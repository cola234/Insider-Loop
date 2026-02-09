<template>
  <div class="deck-section">
    <div class="deck-container">
      <div class="panel-header">{{ t.ui.deckSequence }}</div>
      <div class="deck-cards">
        <div
          v-for="(card, index) in deck"
          :key="`${card.id}-${index}`"
          class="deck-card"
          :class="[
            card.color,
            { active: index === activeCardIndex, dragging: index === dragIndex },
            critEffect && index === critEffect.index ? `crit-${critEffect.type}` : '',
            { 'crit-hit': critEffect && index === critEffect.index },
          ]"
          :data-detail="tooltipText(card)"
          draggable="true"
          @dragstart="$emit('drag-start', index, $event)"
          @dragover="$emit('drag-over', index, $event)"
          @dragleave="$emit('drag-leave', $event)"
          @drop="$emit('drop', index, $event)"
          @dragend="$emit('drag-end')"
          @contextmenu.prevent="$emit('show-detail', card)"
          @touchstart="startLongPress(card)"
          @touchend="cancelLongPress"
          @touchmove="cancelLongPress"
        >
          <div class="deck-mobile-controls">
            <button
              class="btn deck-move"
              :disabled="phase !== 'arrange' || index === 0"
              @click.stop="$emit('move-card', index, -1)"
            >
              ↑
            </button>
            <button
              class="btn deck-move"
              :disabled="phase !== 'arrange' || index === deck.length - 1"
              @click.stop="$emit('move-card', index, 1)"
            >
              ↓
            </button>
          </div>
          <div class="card-top">
            <span>{{ t.cards[card.id] || card.name }}</span>
            <span>{{ t.attributes[card.attr].label }}</span>
          </div>
          <div class="card-body">{{ formatPct(card.min) }} ~ {{ formatPct(card.max) }}</div>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn" :disabled="phase !== 'arrange'" @click="$emit('run-day')">{{ t.ui.startExecution }}</button>
        <button class="btn danger" @click="$emit('reset')">{{ t.ui.reset }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  deck: Array,
  phase: String,
  activeCardIndex: Number,
  dragIndex: Number,
  critEffect: Object,
  t: Object,
})

const emit = defineEmits(['drag-start', 'drag-over', 'drag-leave', 'drop', 'drag-end', 'move-card', 'show-detail', 'run-day', 'reset'])

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
</script>
