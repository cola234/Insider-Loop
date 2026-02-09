<template>
  <div class="panel">
    <div class="panel-header">{{ t.ui.marketTerminal }}</div>

    <div class="market-stats">
      <div class="stat-box">
        <div class="stat-label">{{ t.ui.price }}</div>
        <div class="stat-value">{{ formatMoney(price) }}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">{{ t.ui.shares }}</div>
        <div class="stat-value">{{ shares }}{{ t.ui.sharesUnit }}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">{{ t.ui.profit }}</div>
        <div class="stat-value" :class="{ positive: lastDayProfit > 0, negative: lastDayProfit < 0 }">
          {{ formatMoney(lastDayProfit) }}
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-label">{{ t.ui.target }}</div>
        <div class="stat-value">{{ formatMoney(weekTarget) }}</div>
      </div>
    </div>

    <div class="chart-area">
      <svg :viewBox="candleChart.viewBox" role="img" aria-label="Price chart" style="width: 100%; height: 150px">
        <g
          v-for="bar in candleChart.bars"
          :key="bar.id"
          @mouseenter="$emit('candle-enter', bar)"
          @mouseleave="$emit('candle-leave')"
        >
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
      <div v-if="hoveredCandleInfo" class="chart-tooltip">
        <div>{{ t.ui.currentPrice }}：{{ formatMoney(hoveredCandleInfo.price) }}</div>
        <div>{{ hoveredCandleInfo.pct >= 0 ? t.ui.rising : t.ui.falling }}：{{ formatPct(hoveredCandleInfo.pct) }}</div>
      </div>
      <div v-if="critEffect" :key="critEffect.key" class="crit-burst" :class="`crit-${critEffect.type}`"></div>
      <div
        v-if="critEffect"
        :key="`label-${critEffect.key}`"
        class="crit-label"
        :class="`crit-${critEffect.type}`"
      >
        {{ t.ui.crit }}
      </div>
    </div>

    <div v-if="currentEvent" class="event-box">
      <div class="event-name">{{ t.events[currentEvent.id]?.name || currentEvent.name }}</div>
      <div class="event-desc">{{ t.events[currentEvent.id]?.desc || currentEvent.desc }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  price: Number,
  shares: Number,
  lastDayProfit: Number,
  weekTarget: Number,
  candleChart: Object,
  hoveredCandleInfo: Object,
  critEffect: Object,
  currentEvent: Object,
  t: Object,
})

defineEmits(['candle-enter', 'candle-leave'])

function formatMoney(value) {
  return `$${value.toFixed(2)}`
}

function formatPct(value) {
  return `${value.toFixed(2)}%`
}
</script>
