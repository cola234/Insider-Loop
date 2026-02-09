<template>
  <div>
    <!-- 游戏结束模态框 -->
    <div v-if="showEndModal" class="end-modal">
      <div class="end-modal-content">
        <div class="end-modal-title">{{ t.ui.gameOver }}</div>
        <div class="end-modal-status">{{ statusMessage || t.ui.gameOver }}</div>
        <div class="end-modal-actions">
          <button class="btn" @click="$emit('open-chart')">{{ t.ui.viewChart }}</button>
          <button
            v-if="isWin"
            class="btn primary"
            :disabled="uploading"
            @click="handleUploadScore"
          >
            {{ uploading ? t.wallet.uploading : (connected ? t.wallet.uploadScore : t.wallet.connect) }}
          </button>
          <button class="btn danger" @click="$emit('close-end')">{{ t.ui.close }}</button>
        </div>
        <div v-if="uploadStatus" class="upload-status">{{ uploadStatus }}</div>
        <div v-if="showFullChart" class="end-modal-chart">
          <svg :viewBox="fullCandleChart.viewBox" role="img" style="width: 100%; height: 220px">
            <g v-for="bar in fullCandleChart.bars" :key="bar.id">
              <line
                class="wick"
                :class="bar.color"
                :x1="bar.x + bar.barWidth / 2"
                :x2="bar.x + bar.barWidth / 2"
                :y1="bar.highY"
                :y2="bar.lowY"
              />
              <rect
                class="body"
                :class="bar.color"
                :x="bar.x"
                :y="bar.topY"
                :width="bar.barWidth"
                :height="bar.bodyHeight"
                rx="1"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>

    <!-- 日终总结模态框 -->
    <div v-if="showDaySummary" class="end-modal">
      <div class="end-modal-content day-summary">
        <div class="end-modal-title">{{ t.ui.daySummary }}</div>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">{{ t.ui.currentWeekDay }}</span>
            <span class="summary-value">{{ t.ui.week.replace('{n}', daySummary?.week) }} / {{ t.ui.day.replace('{n}', daySummary?.day) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">{{ t.ui.dailyChange }}</span>
            <span
              class="summary-value"
              :class="{ positive: (daySummary?.dayPct ?? 0) > 0, negative: (daySummary?.dayPct ?? 0) < 0 }"
            >
              {{ formatPct(daySummary?.dayPct ?? 0) }}
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">{{ t.ui.dailyProfit }}</span>
            <span
              class="summary-value"
              :class="{ positive: (daySummary?.profit ?? 0) > 0, negative: (daySummary?.profit ?? 0) < 0 }"
            >
              {{ formatMoney(daySummary?.profit ?? 0) }}
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">{{ t.ui.currentCash }}</span>
            <span class="summary-value">{{ formatMoney(daySummary?.cash ?? 0) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">{{ t.ui.targetAsset }}</span>
            <span class="summary-value">{{ formatMoney(daySummary?.target ?? 0) }}</span>
          </div>
        </div>
        <div class="end-modal-actions">
          <button class="btn" @click="$emit('confirm-summary')">{{ t.ui.confirmContinue }}</button>
        </div>
      </div>
    </div>

    <!-- 周完成提示 -->
    <div v-if="showWeekComplete" class="week-complete">
      <div class="week-complete-inner">
        <div class="week-complete-title">{{ t.ui.weekComplete }}</div>
        <div class="week-complete-subtitle">{{ t.ui.systemAdvancing }}</div>
      </div>
    </div>

    <!-- 重置确认模态框 -->
    <div v-if="showResetConfirm" class="end-modal">
      <div class="end-modal-content">
        <div class="end-modal-title">{{ t.ui.confirmReset }}</div>
        <div class="end-modal-status">{{ t.ui.resetWarning }}</div>
        <div class="end-modal-actions">
          <button class="btn danger" @click="$emit('confirm-reset')">{{ t.ui.confirmReset }}</button>
          <button class="btn" @click="$emit('cancel-reset')">{{ t.ui.cancel }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWallet } from '../../composables/useWallet'

const props = defineProps({
  showEndModal: Boolean,
  showDaySummary: Boolean,
  showResetConfirm: Boolean,
  showWeekComplete: Boolean,
  statusMessage: String,
  daySummary: Object,
  fullCandleChart: Object,
  showFullChart: Boolean,
  isWin: Boolean,
  finalScore: Number,
  finalWeek: Number,
  t: Object,
})

defineEmits(['close-end', 'open-chart', 'confirm-summary', 'confirm-reset', 'cancel-reset'])

const { connected, connecting, publicKey, connect, submitScore } = useWallet()
const uploading = ref(false)
const uploadStatus = ref('')

async function handleUploadScore() {
  if (!connected.value) {
    try {
      await connect()
    } catch (e) {
      uploadStatus.value = props.t.wallet.installPhantom
      return
    }
  }

  uploading.value = true
  uploadStatus.value = props.t.wallet.confirmTx

  try {
    await submitScore(props.finalScore, props.finalWeek)
    uploadStatus.value = props.t.wallet.uploadSuccess
  } catch (e) {
    uploadStatus.value = props.t.wallet.uploadFailed
  } finally {
    uploading.value = false
  }
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`
}

function formatPct(value) {
  return `${value.toFixed(2)}%`
}
</script>
