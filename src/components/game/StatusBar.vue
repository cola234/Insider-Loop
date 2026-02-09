<template>
  <div class="status-bar">
    <div class="status-header">
      <div class="status-title">{{ t.systemOnline }}</div>
      <div class="status-info">
        <span class="status-item">{{ t.ui.week.replace('{n}', '') }}<span class="status-value">{{ week }}</span></span>
        <span class="status-item">{{ t.ui.day.replace('{n}', '') }}<span class="status-value">{{ day }}</span></span>
        <span class="status-item">{{ t.ui.cash }}：<span class="status-value">{{ formatMoney(cash) }}</span></span>
        <span class="status-item">{{ t.ui.status }}：<span class="status-value">{{ phaseLabel }}</span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  week: Number,
  day: Number,
  cash: Number,
  phaseLabel: String,
  t: Object,
})

function formatMoney(value) {
  return `$${value.toFixed(2)}`
}
</script>
