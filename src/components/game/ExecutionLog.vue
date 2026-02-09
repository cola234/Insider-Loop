<template>
  <div class="log-section" :class="{ 'is-collapsed': !showMobileLog }">
    <div class="panel-header log-header">
      <span>{{ t.ui.executionLog }}</span>
      <button class="btn log-toggle" @click="$emit('toggle')">
        {{ showMobileLog ? t.ui.hideLog : t.ui.expandLog }}
      </button>
    </div>
    <div class="log-content">
      <div v-if="dayLog.length === 0" class="log-empty">{{ t.ui.noRecords }}</div>
      <div v-else>
        <div v-for="entry in dayLog" :key="entry.id" class="log-line">
          <span class="log-text">{{ t.cards[entry.card.id] || entry.card.name }}</span>
          <span class="log-value" :class="{ negative: entry.pct < 0, positive: entry.pct > 0 }">
            {{ formatPct(entry.pct) }}
          </span>
          <span class="log-text">[{{ formatMoney(entry.after) }}]</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  dayLog: Array,
  showMobileLog: Boolean,
  t: Object,
})

defineEmits(['toggle'])

function formatMoney(value) {
  return `$${value.toFixed(2)}`
}

function formatPct(value) {
  return `${value.toFixed(2)}%`
}
</script>
