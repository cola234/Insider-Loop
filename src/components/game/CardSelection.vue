<template>
  <div class="panel">
    <div class="panel-header">{{ t.ui.tradingDeck }}</div>

    <div class="card-selection">
      <div class="card-group">
        <button
          v-for="(card, index) in selectionRed"
          :key="card.id"
          class="choice-card red"
          :class="{ chosen: chosenRedId === card.id }"
          :style="getBlurBgStyle('red', index)"
          :data-detail="tooltipText(card)"
          :disabled="phase !== 'setup'"
          @click="$emit('choose-card', card)"
          @contextmenu.prevent="$emit('show-detail', card)"
          @touchstart="startLongPress(card)"
          @touchend="cancelLongPress"
          @touchmove="cancelLongPress"
        >
          <div class="choice-card-bg" :style="getClearBgStyle('red', index)"></div>
          <div class="card-name">↓ {{ t.cards[card.id] || card.name }}</div>
          <div class="card-attr">{{ t.attributes[card.attr].label }}</div>
          <div class="card-range">{{ formatPct(card.min) }} ~ {{ formatPct(card.max) }}</div>
        </button>
      </div>

      <div class="card-group">
        <button
          v-for="(card, index) in selectionGreen"
          :key="card.id"
          class="choice-card"
          :class="{ chosen: chosenGreenId === card.id }"
          :style="getBlurBgStyle('green', index)"
          :data-detail="tooltipText(card)"
          :disabled="phase !== 'setup'"
          @click="$emit('choose-card', card)"
          @contextmenu.prevent="$emit('show-detail', card)"
          @touchstart="startLongPress(card)"
          @touchend="cancelLongPress"
          @touchmove="cancelLongPress"
        >
          <div class="choice-card-bg" :style="getClearBgStyle('green', index)"></div>
          <div class="card-name">↑ {{ t.cards[card.id] || card.name }}</div>
          <div class="card-attr">{{ t.attributes[card.attr].label }}</div>
          <div class="card-range">{{ formatPct(card.min) }} ~ {{ formatPct(card.max) }}</div>
        </button>
      </div>

      <div class="btn-group">
        <button class="btn" :disabled="phase !== 'setup' || rerollUsed" @click="$emit('reroll')">
          {{ rerollUsed ? t.ui.used : t.ui.reroll }}
        </button>
        <button
          class="btn"
          :disabled="phase !== 'setup' || !chosenRedId || !chosenGreenId"
          @click="$emit('confirm')"
        >
          {{ t.ui.confirm }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectionRed: Array,
  selectionGreen: Array,
  chosenRedId: String,
  chosenGreenId: String,
  phase: String,
  rerollUsed: Boolean,
  redBg: Array,
  greenBg: Array,
  t: Object,
})

const emit = defineEmits(['choose-card', 'show-detail', 'reroll', 'confirm'])

let longPressTimer = null

function startLongPress(card) {
  longPressTimer = setTimeout(() => {
    emit('show-detail', card)
  }, 500)
}

function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function formatPct(value) {
  return `${value.toFixed(2)}%`
}

function tooltipText(card) {
  const sign = card.color === 'green' ? '+' : ''
  const name = props.t.cards[card.id] || card.name
  const attr = props.t.attributes[card.attr].label
  const special = props.t.specialRules[card.special]
  return [
    name,
    `${props.t.ui.attribute}：${attr}`,
    `${props.t.ui.priceRange}${sign}${formatPct(card.min)} ~ ${sign}${formatPct(card.max)}`,
    `${props.t.ui.specialEffect}：${special}`,
  ].join('\n')
}

function getBlurBgStyle(color, index) {
  const list = color === 'red' ? props.redBg : props.greenBg
  const url = list[index] ?? ''
  if (!url) return {}
  return {
    '--blur-bg': `url('${url}')`,
  }
}

function getClearBgStyle(color, index) {
  const list = color === 'red' ? props.redBg : props.greenBg
  const url = list[index] ?? ''
  if (!url) return {}
  return {
    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url('${url}')`,
  }
}
</script>
