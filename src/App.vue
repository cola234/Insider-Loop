<script setup>
import { ref, computed, onMounted } from 'vue'
import { attributes, cards, config, events, specialRules } from './gameData'
import bgmUrl from './music.mp3'

// i18n
import { useI18n } from './i18n'
const { t, lang, toggleLang } = useI18n()

// Composables
import { useGameState } from './composables/useGameState'
import { useAudio } from './composables/useAudio'
import { useCandleChart } from './composables/useCandleChart'
import { useDeckDrag } from './composables/useDeckDrag'

// Components
import Tutorial from './components/Tutorial.vue'
import StatusBar from './components/game/StatusBar.vue'
import MarketPanel from './components/game/MarketPanel.vue'
import CardSelection from './components/game/CardSelection.vue'
import DeckSequence from './components/game/DeckSequence.vue'
import ExecutionLog from './components/game/ExecutionLog.vue'
import GameModals from './components/game/GameModals.vue'

// 教程状态
const showTutorial = ref(true)
const showWeekOverlay = ref(false)

const handleTutorialComplete = async () => {
  showTutorial.value = false
  showWeekOverlay.value = true

  // 2秒后开始淡出
  await new Promise(resolve => setTimeout(resolve, 2000))
  showWeekOverlay.value = false
  audio.startBgm()
}

// 使用 composables
const gameState = useGameState()
const audio = useAudio(bgmUrl)
const chart = useCandleChart()

// 卡组状态
const deck = ref([])
const dayLog = ref([])
const deckBg = ref([])

// 拖拽逻辑
const drag = useDeckDrag(deck, deckBg, gameState.phase, gameState.isRunning, audio.playTone)

// 卡牌选择状态
const selectionRed = ref([])
const selectionGreen = ref([])
const chosenRedId = ref('')
const chosenGreenId = ref('')
const redBg = ref([])
const greenBg = ref([])
const rerollUsed = ref(false)

// UI 状态
const activeCardIndex = ref(-1)
const shakeKey = ref(0)
const critEffect = ref(null)
const showEndModal = ref(false)
const showFullChart = ref(false)
const showResetConfirm = ref(false)
const showDaySummary = ref(false)
const daySummary = ref(null)
const pendingDayAdvance = ref(null)
const showWeekComplete = ref(false)
const winPercent = ref(null)
const showMobileLog = ref(true)

// 手机端卡牌详情弹窗
const showCardDetail = ref(false)
const cardDetailData = ref(null)

let critTimer = null
let critShakeTimer = null

// 背景图片资源
const redBgAssets = [
  '/svg/red/07b1f3875b39de249404ff2374baf76f.png',
  '/svg/red/144b3bd0b7c8a25c4a1abc8b52095090.png',
  '/svg/red/3bbfb33666086bc80f5013953dc7c13f.png',
  '/svg/red/5260fc1026ae800f3abbf22157558c3c.png',
  '/svg/red/6000cb80f98667471843c234ceec554f.png',
  '/svg/red/65a714ff56ed75b373603a47319e7549.png',
  '/svg/red/abb1b324eccc1348df4732b7a4b5439b.png',
  '/svg/red/c4f99dd5c64352a5adcf66bb5cc58444.png',
  '/svg/red/e36add699358527a97dc10e78d85b01d.png',
  '/svg/red/eb4353bca63a07e0fbf6148583933068.png',
  '/svg/red/f379fdf2a1fc5bdb61ee5cb45b5c752f.png',
]
const greenBgAssets = [
  '/svg/green/1.png',
  '/svg/green/1b0ca8a6a13c0df69c35d5cbe6b45bb7.png',
  '/svg/green/3bdb07a5b282737dffab411921a9bc2f.png',
  '/svg/green/90ea083ef064cc7391c0d4cee3c73e24.png',
  '/svg/green/a629cb65b16aec8ea9e3a90f43256ddb.png',
  '/svg/green/ec2ca3ac2f4142b612275223058d893f.png',
  '/svg/green/ed2984ae88735e381e31ed927d1ebeae.png',
]

const redCards = computed(() => cards.filter((card) => card.color === 'red'))
const greenCards = computed(() => cards.filter((card) => card.color === 'green'))

// 工具函数
function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomRange(min, max) {
  return min + Math.random() * (max - min)
}

function assignCardBackgrounds(color, count) {
  const pool = color === 'red' ? redBgAssets : greenBgAssets
  if (pool.length === 0) return Array.from({ length: count }, () => '')
  const picked = shuffle(pool)
  const result = []
  for (let i = 0; i < count; i += 1) {
    result.push(picked[i % picked.length])
  }
  return result
}

// 卡牌选择
function pickSelectionPools(resetReroll = true) {
  selectionRed.value = shuffle(redCards.value).slice(0, 3)
  selectionGreen.value = shuffle(greenCards.value).slice(0, 3)
  chosenRedId.value = ''
  chosenGreenId.value = ''
  redBg.value = assignCardBackgrounds('red', 3)
  greenBg.value = assignCardBackgrounds('green', 3)
  if (resetReroll) rerollUsed.value = false
}

function chooseCard(card) {
  if (gameState.phase.value !== 'setup') return
  if (card.color === 'red') chosenRedId.value = card.id
  if (card.color === 'green') chosenGreenId.value = card.id
}

function rerollSelections() {
  if (gameState.phase.value !== 'setup' || rerollUsed.value) return
  rerollUsed.value = true
  pickSelectionPools(false)
}

// 游戏核心逻辑
function rollEvent() {
  if (Math.random() > config.eventChance) return null
  return events[Math.floor(Math.random() * events.length)]
}

function canBuyShares() {
  return Math.floor(gameState.cash.value / gameState.price.value)
}

function buyShares() {
  const affordable = canBuyShares()
  if (affordable <= 0) {
    gameState.phase.value = 'gameover'
    gameState.statusMessage.value = t.value.ui.firedNoMoney
    showEndModal.value = true
    showFullChart.value = false
    return false
  }
  gameState.shares.value = affordable
  gameState.cash.value = Number((gameState.cash.value - affordable * gameState.price.value).toFixed(2))
  return true
}

function drawRandomCards(count, excludeIds) {
  const pool = cards.filter((card) => !excludeIds.includes(card.id))
  const weights = pool.map((card) => {
    const cardWeight = card.weight ?? 1.0
    const colorWeight = gameState.getWeekColorWeight(card.color)
    return cardWeight * colorWeight
  })
  const picked = []
  while (picked.length < count && pool.length > 0) {
    const total = weights.reduce((sum, value) => sum + value, 0)
    let roll = Math.random() * total
    let pickedIndex = 0
    for (let i = 0; i < weights.length; i += 1) {
      roll -= weights[i]
      if (roll <= 0) {
        pickedIndex = i
        break
      }
    }
    picked.push(pool[pickedIndex])
    pool.splice(pickedIndex, 1)
    weights.splice(pickedIndex, 1)
  }
  return picked
}

function cleanupDayState() {
  drag.dragIndex.value = -1
  activeCardIndex.value = -1
  deck.value = []
  deckBg.value = []
  dayLog.value = []
  chosenRedId.value = ''
  chosenGreenId.value = ''
  document.querySelectorAll('.card.drag-over, .card.dragging, .card.active').forEach((el) => {
    el.classList.remove('drag-over', 'dragging', 'active')
  })
}

function buildDeck() {
  if (gameState.phase.value !== 'setup') return
  const forcedRed = cards.find((card) => card.id === chosenRedId.value && card.color === 'red')
  const forcedGreen = cards.find((card) => card.id === chosenGreenId.value && card.color === 'green')
  if (!forcedRed || !forcedGreen) return

  gameState.currentEvent.value = rollEvent()
  const randomCards = drawRandomCards(
    config.cardsPerDay - config.forcedRed - config.forcedGreen,
    [forcedRed.id, forcedGreen.id]
  )
  deck.value = shuffle([forcedRed, forcedGreen, ...randomCards])

  const redCount = deck.value.filter((card) => card.color === 'red').length
  const greenCount = deck.value.filter((card) => card.color === 'green').length
  const redBgs = assignCardBackgrounds('red', redCount)
  const greenBgs = assignCardBackgrounds('green', greenCount)

  const deckBgs = []
  let redIndex = 0
  let greenIndex = 0
  for (const card of deck.value) {
    if (card.color === 'red') {
      deckBgs.push(redBgs[redIndex++])
    } else {
      deckBgs.push(greenBgs[greenIndex++])
    }
  }

  deckBg.value = deckBgs
  redBg.value = redBgs
  greenBg.value = greenBgs
  dayLog.value = []
  gameState.dayStartPrice.value = gameState.price.value
  gameState.cashBeforeDay.value = gameState.cash.value
  gameState.shares.value = 0

  if (!buyShares()) return
  gameState.phase.value = 'arrange'
}

// 暴击效果
function triggerCrit(type) {
  audio.ensureAudio()
  audio.playCritTone(type)
  if (critTimer) clearTimeout(critTimer)
  const nextKey = (critEffect.value?.key ?? 0) + 1
  critEffect.value = { type, key: nextKey, index: activeCardIndex.value }
  critTimer = setTimeout(() => {
    critEffect.value = null
  }, 420)
  if (critShakeTimer) clearTimeout(critShakeTimer)
  document.body.classList.remove('crit-shake')
  void document.body.offsetWidth
  document.body.classList.add('crit-shake')
  critShakeTimer = setTimeout(() => {
    document.body.classList.remove('crit-shake')
  }, 480)
}

function triggerShake() {
  shakeKey.value += 1
  setTimeout(() => {
    shakeKey.value += 1
  }, 220)
}

// 卡牌效果计算
function getStreakLength(cardsList, index) {
  let length = 1
  for (let i = index - 1; i >= 0; i -= 1) {
    if (cardsList[i].attr !== cardsList[index].attr) break
    length += 1
  }
  return length
}

function applySpecialEffects(pct, card, prevCard) {
  let nextPct = pct
  const isGreen = card.color === 'green'

  // echo: 绿卡55%触发，红卡50%触发
  if (card.special === 'echo' && prevCard && prevCard.color === card.color) {
    const chance = isGreen ? 0.55 : 0.50
    if (Math.random() < chance) {
      nextPct += isGreen ? 2 : -2
    }
  }

  // swing: 绿卡55%触发，红卡50%触发
  if (card.special === 'swing' && prevCard && prevCard.color !== card.color) {
    const chance = isGreen ? 0.55 : 0.50
    if (Math.random() < chance) {
      nextPct += isGreen ? 3 : -3
    }
  }

  // booster: 绿卡55%触发，红卡45%触发
  if (card.special === 'booster') {
    const chance = isGreen ? 0.55 : 0.45
    if (Math.random() < chance) {
      nextPct *= 1.25
    }
  }

  // brake: 绿卡40%触发，红卡55%触发
  if (card.special === 'brake') {
    const chance = isGreen ? 0.40 : 0.55
    if (Math.random() < chance) {
      nextPct *= 0.75
    }
  }

  return nextPct
}

function buildModifiers(eventData) {
  const defaults = {
    profitMultiplier: 1,
    clampAbs: null,
    globalMultiplier: 1,
    monkeyFlipBonus: 0,
    bullBoost: 0,
    bearBoost: 0,
    firstGreenBonus: 0,
    firstRedBonus: 0,
    taxRate: 0,
  }
  if (!eventData?.modifiers) return defaults
  return { ...defaults, ...eventData.modifiers }
}

// 核心游戏执行
async function runDay() {
  if (gameState.phase.value !== 'arrange' || gameState.isRunning.value) return
  audio.ensureAudio()
  audio.startBgm()
  gameState.isRunning.value = true
  gameState.phase.value = 'running'

  // 手机端自动滚动到顶部查看 K 线图
  if (window.innerWidth <= 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const modifiers = buildModifiers(gameState.currentEvent.value)
  const pending = { invert: false, double: false }
  let usedFirstGreen = false
  let usedFirstRed = false
  let runningPrice = gameState.price.value
  const log = []
  const candleHistory = [...chart.candles.value]
  const stepDelay = 520
  const eventId = gameState.currentEvent.value?.id
  let pendingAddToNext = 0
  let pendingDayEndAdd = 0
  let pendingShieldColor = null
  let pendingLatchColor = null
  let mirrorPct = null

  for (let index = 0; index < deck.value.length; index += 1) {
    const card = deck.value[index]
    const prevCard = deck.value[index - 1] ?? null
    const streakLength = getStreakLength(deck.value, index)
    let critType = ''
    const pendingNow = { ...pending }
    pending.invert = false
    pending.double = false

    const addFromPrev = pendingAddToNext
    pendingAddToNext = 0
    let nextMultiplier = 1
    if (pendingShieldColor && pendingShieldColor !== card.color) {
      nextMultiplier *= 0.85
    }
    if (pendingLatchColor && pendingLatchColor === card.color) {
      nextMultiplier *= 1.15
    }
    pendingShieldColor = null
    pendingLatchColor = null

    let pct = randomRange(card.min, card.max)
    pct = applySpecialEffects(pct, card, prevCard)

    // 猴子连击
    if (card.attr === 'monkey' && streakLength >= 2) {
      const baseChance = 0.25 + 0.15 * (streakLength - 2)
      const chance = Math.min(0.7, baseChance + modifiers.monkeyFlipBonus)
      if (Math.random() < chance) {
        pct *= -1
        critType = 'monkey'
      }
    }

    // 熊/牛连击
    if (card.attr === 'bear' && pct < 0) {
      const multiplier = 1 + 0.2 * (streakLength - 1) + modifiers.bearBoost
      pct *= multiplier
      if (multiplier > 1) critType = 'bear'
    }
    if (card.attr === 'bull' && pct > 0) {
      const multiplier = 1 + 0.2 * (streakLength - 1) + modifiers.bullBoost
      pct *= multiplier
      if (multiplier > 1) critType = 'bull'
    }

    // 事件加成
    if (card.color === 'green' && !usedFirstGreen && modifiers.firstGreenBonus) {
      pct += modifiers.firstGreenBonus
      usedFirstGreen = true
    }
    if (card.color === 'red' && !usedFirstRed && modifiers.firstRedBonus) {
      pct += modifiers.firstRedBonus
      usedFirstRed = true
    }

    pct *= modifiers.globalMultiplier
    if (modifiers.clampAbs) {
      pct = Math.max(-modifiers.clampAbs, Math.min(modifiers.clampAbs, pct))
    }

    // 周难度系数
    if (card.color === 'red' && pct < 0) {
      pct *= gameState.getWeekRedScale()
    }
    if (card.color === 'green' && pct > 0) {
      pct *= gameState.getWeekGreenScale()
    }

    if (pendingNow.invert) pct *= -1
    if (pendingNow.double) pct *= 2
    if (nextMultiplier !== 1) pct *= nextMultiplier

    // 特殊事件处理
    if (eventId === 'freeze-beat' && index === 3) {
      pct = 0
      critType = ''
    } else {
      if (card.special === 'split') {
        pendingAddToNext += pct * 0.4
        pct *= 0.6
      }
      if (card.special === 'buffer') {
        pendingDayEndAdd += pct * 0.3
        pct *= 0.7
      }
      if (card.special === 'ghost') {
        // ghost: 绿卡35%触发，红卡55%触发
        const ghostChance = card.color === 'green' ? 0.35 : 0.55
        if (Math.random() < ghostChance) {
          pendingAddToNext += card.color === 'green' ? 2 : -2
          pct = 0
          critType = ''
        }
      }
      if (card.special === 'shield') pendingShieldColor = card.color
      if (card.special === 'latch') pendingLatchColor = card.color
    }

    if (eventId === 'tail-echo' && index === deck.value.length - 1) {
      pct += pct * 0.4
    }
    if (eventId === 'mirror-noise' && index === 1) {
      mirrorPct = pct * 0.5
    }
    if (eventId === 'mirror-noise' && index === 5 && mirrorPct) {
      pct += mirrorPct
      mirrorPct = null
    }
    if (addFromPrev) pct += addFromPrev

    // reverseNext: 绿卡45%触发，红卡55%触发
    if (card.special === 'reverseNext') {
      const chance = card.color === 'green' ? 0.45 : 0.55
      if (Math.random() < chance) pending.invert = true
    }
    // doubleNext: 绿卡55%触发，红卡45%触发
    if (card.special === 'doubleNext') {
      const chance = card.color === 'green' ? 0.55 : 0.45
      if (Math.random() < chance) pending.double = true
    }

    // 更新价格和UI
    const priceBefore = runningPrice
    activeCardIndex.value = index
    if (critType) triggerCrit(critType)
    runningPrice = Math.max(1, runningPrice * (1 + pct / 100))
    runningPrice = Number(runningPrice.toFixed(2))

    const candleId = `w${gameState.week.value}d${gameState.day.value}-${card.id}-${index}-${candleHistory.length}`
    candleHistory.push(chart.buildCandle(priceBefore, runningPrice, pct >= 0 ? 'green' : 'red', candleId))
    chart.candles.value = [...candleHistory]

    log.push({
      id: `${card.id}-${index}`,
      card,
      pct: Number(pct.toFixed(2)),
      before: priceBefore,
      after: runningPrice,
    })
    dayLog.value = [...log]
    audio.playTone(card.color)
    if (Math.abs(pct) >= 6) triggerShake()
    await sleep(stepDelay)

    // 中段重排事件
    if (eventId === 'mid-reshuffle' && index === 4) {
      const remaining = deck.value.slice(index + 1)
      const remainingBg = deckBg.value.slice(index + 1)
      if (remaining.length) {
        const paired = remaining.map((item, i) => ({ card: item, bg: remainingBg[i] }))
        const shuffled = shuffle(paired)
        deck.value = [...deck.value.slice(0, index + 1), ...shuffled.map((item) => item.card)]
        deckBg.value = [...deckBg.value.slice(0, index + 1), ...shuffled.map((item) => item.bg)]
      }
    }
  }

  // 日终结算
  let settlementBefore = runningPrice
  if (pendingDayEndAdd) {
    runningPrice = Math.max(1, runningPrice * (1 + pendingDayEndAdd / 100))
    runningPrice = Number(runningPrice.toFixed(2))
  }

  if (eventId === 'soft-retrace') {
    const dayPct = gameState.dayStartPrice.value === 0
      ? 0
      : ((runningPrice - gameState.dayStartPrice.value) / gameState.dayStartPrice.value) * 100
    if (Math.abs(dayPct) > 8) {
      const targetPct = dayPct * 0.8
      runningPrice = Number((gameState.dayStartPrice.value * (1 + targetPct / 100)).toFixed(2))
    }
  }

  if (runningPrice !== settlementBefore) {
    const settleId = `settle-w${gameState.week.value}d${gameState.day.value}-${candleHistory.length}`
    candleHistory.push(chart.buildCandle(settlementBefore, runningPrice, runningPrice >= settlementBefore ? 'green' : 'red', settleId))
    chart.candles.value = [...candleHistory]
  }

  gameState.price.value = runningPrice
  chart.candles.value = candleHistory
  dayLog.value = log
  activeCardIndex.value = -1

  // 计算盈亏
  const cashAfterSell = gameState.cash.value + gameState.shares.value * gameState.price.value
  const rawProfit = cashAfterSell - gameState.cashBeforeDay.value
  const adjustedProfit = rawProfit * modifiers.profitMultiplier
  let finalCash = gameState.cashBeforeDay.value + adjustedProfit
  if (modifiers.taxRate && adjustedProfit > 0) {
    finalCash -= adjustedProfit * modifiers.taxRate
  }
  gameState.cash.value = Number(finalCash.toFixed(2))
  gameState.shares.value = 0
  gameState.lastDayProfit.value = Number(adjustedProfit.toFixed(2))
  gameState.isRunning.value = false

  // 显示日终总结
  const dayPct = gameState.dayStartPrice.value === 0
    ? 0
    : ((gameState.price.value - gameState.dayStartPrice.value) / gameState.dayStartPrice.value) * 100
  daySummary.value = {
    week: gameState.week.value,
    day: gameState.day.value,
    dayPct: Number(dayPct.toFixed(2)),
    profit: gameState.lastDayProfit.value,
    cash: gameState.cash.value,
    target: gameState.weekTarget.value,
  }
  showDaySummary.value = true
  gameState.phase.value = 'summary'

  pendingDayAdvance.value = advanceDay
}

// 日/周推进
function advanceDay() {
  if (gameState.day.value >= config.daysPerWeek) {
    if (gameState.cash.value >= gameState.weekTarget.value) {
      if (gameState.week.value >= config.weeks) {
        const percent = winPercent.value ?? Number((50 + Math.random() * 50).toFixed(2))
        winPercent.value = percent
        gameState.phase.value = 'win'
        gameState.statusMessage.value = t.value.ui.winMessage.replace('{percent}', percent)
        showEndModal.value = true
        showFullChart.value = false
        return
      }
      showWeekComplete.value = true
      setTimeout(() => {
        showWeekComplete.value = false
        gameState.week.value += 1
        gameState.day.value = 1
        gameState.cash.value = config.startingCash
        gameState.phase.value = 'setup'
        gameState.statusMessage.value = t.value.ui.weekPassed
        gameState.currentEvent.value = null
        cleanupDayState()
        pickSelectionPools()
      }, 1200)
      return
    }
    gameState.phase.value = 'gameover'
    gameState.statusMessage.value = t.value.ui.firedNoTarget
    showEndModal.value = true
    showFullChart.value = false
    return
  }
  gameState.day.value += 1
  gameState.phase.value = 'setup'
  gameState.statusMessage.value = ''
  gameState.currentEvent.value = null
  cleanupDayState()
  pickSelectionPools()
}

// 重置游戏
function resetGame() {
  gameState.resetGameState()
  deck.value = []
  dayLog.value = []
  chart.candles.value = []
  chart.hoveredCandle.value = null
  showEndModal.value = false
  showFullChart.value = false
  drag.dragIndex.value = -1
  activeCardIndex.value = -1
  deckBg.value = []
  redBg.value = []
  greenBg.value = []
  chosenRedId.value = ''
  chosenGreenId.value = ''
  rerollUsed.value = false
  shakeKey.value = 0
  document.querySelectorAll('.card.drag-over, .card.dragging, .card.active').forEach((el) => {
    el.classList.remove('drag-over', 'dragging', 'active')
  })
  pickSelectionPools()
}

// 模态框控制
function openFullChart() {
  showFullChart.value = true
}

function closeEndModal() {
  showEndModal.value = false
  showFullChart.value = false
}

function confirmDaySummary() {
  showDaySummary.value = false
  if (pendingDayAdvance.value) {
    const next = pendingDayAdvance.value
    pendingDayAdvance.value = null
    next()
  }
}

function openResetConfirm() {
  showResetConfirm.value = true
}

function closeResetConfirm() {
  showResetConfirm.value = false
}

function confirmReset() {
  showResetConfirm.value = false
  resetGame()
}

function toggleMobileLog() {
  showMobileLog.value = !showMobileLog.value
}

// 手机端卡牌详情
function showCardInfo(card) {
  const sign = card.color === 'green' ? '+' : ''
  const pctMin = `${card.min.toFixed(2)}%`
  const pctMax = `${card.max.toFixed(2)}%`
  cardDetailData.value = {
    name: t.value.cards[card.id] || card.name,
    color: card.color,
    attr: t.value.attributes[card.attr].label,
    range: `${sign}${pctMin} ~ ${sign}${pctMax}`,
    special: t.value.specialRules[card.special],
  }
  showCardDetail.value = true
}

function closeCardDetail() {
  showCardDetail.value = false
  cardDetailData.value = null
}

// 初始化
resetGame()

onMounted(() => {
  audio.initBgm()
})
</script>

<template>
  <div class="app">
    <!-- Tutorial -->
    <Tutorial v-if="showTutorial" @complete="handleTutorialComplete" />

    <!-- Week Overlay -->
    <div v-if="showWeekOverlay" class="week-overlay">
      <div class="week-text">{{ lang === 'zh' ? '第一周....' : 'Week 1....' }}</div>
    </div>

    <div v-if="critEffect" :key="critEffect.key" class="crit-screen" :class="`crit-${critEffect.type}`"></div>

    <StatusBar
      :week="gameState.week.value"
      :day="gameState.day.value"
      :cash="gameState.cash.value"
      :phaseLabel="t.phases[gameState.phase.value]"
      :t="t"
    />

    <div class="audio-toggle">
      <button class="btn" @click="toggleLang">
        {{ lang === 'zh' ? 'EN' : '中文' }}
      </button>
      <button class="btn" @click="audio.toggleBgm">
        {{ t.ui.bgm }}: {{ audio.isBgmOn.value ? 'ON' : 'OFF' }}
      </button>
    </div>

    <div class="main-grid">
      <MarketPanel
        :price="gameState.price.value"
        :shares="gameState.shares.value"
        :lastDayProfit="gameState.lastDayProfit.value"
        :weekTarget="gameState.weekTarget.value"
        :candleChart="chart.candleChart.value"
        :hoveredCandleInfo="chart.hoveredCandleInfo.value"
        :critEffect="critEffect"
        :currentEvent="gameState.currentEvent.value"
        :t="t"
        @candle-enter="chart.onCandleEnter"
        @candle-leave="chart.onCandleLeave"
      />

      <CardSelection
        :selectionRed="selectionRed"
        :selectionGreen="selectionGreen"
        :chosenRedId="chosenRedId"
        :chosenGreenId="chosenGreenId"
        :phase="gameState.phase.value"
        :rerollUsed="rerollUsed"
        :redBg="redBg"
        :greenBg="greenBg"
        :t="t"
        @choose-card="chooseCard"
        @show-detail="showCardInfo"
        @reroll="rerollSelections"
        @confirm="buildDeck"
      />
    </div>

    <DeckSequence
      :deck="deck"
      :phase="gameState.phase.value"
      :activeCardIndex="activeCardIndex"
      :dragIndex="drag.dragIndex.value"
      :critEffect="critEffect"
      :t="t"
      @drag-start="drag.onDragStart"
      @drag-over="drag.onDragOver"
      @drag-leave="drag.onDragLeave"
      @drop="drag.onDrop"
      @drag-end="drag.onDragEnd"
      @move-card="drag.moveCard"
      @show-detail="showCardInfo"
      @run-day="runDay"
      @reset="openResetConfirm"
    />

    <ExecutionLog
      :dayLog="dayLog"
      :showMobileLog="showMobileLog"
      :t="t"
      @toggle="toggleMobileLog"
    />

    <GameModals
      :showEndModal="showEndModal"
      :showDaySummary="showDaySummary"
      :showResetConfirm="showResetConfirm"
      :showWeekComplete="showWeekComplete"
      :statusMessage="gameState.statusMessage.value"
      :daySummary="daySummary"
      :fullCandleChart="chart.fullCandleChart.value"
      :showFullChart="showFullChart"
      :isWin="gameState.phase.value === 'win'"
      :finalScore="gameState.cash.value"
      :finalWeek="gameState.week.value"
      :t="t"
      @close-end="closeEndModal"
      @open-chart="openFullChart"
      @confirm-summary="confirmDaySummary"
      @confirm-reset="confirmReset"
      @cancel-reset="closeResetConfirm"
    />

    <!-- 手机端卡牌详情弹窗 -->
    <div v-if="showCardDetail" class="card-detail-modal" @click="closeCardDetail">
      <div class="card-detail-content" :class="cardDetailData?.color" @click.stop>
        <div class="card-detail-name">{{ cardDetailData?.name }}</div>
        <div class="card-detail-attr">{{ t.ui.attribute }}：{{ cardDetailData?.attr }}</div>
        <div class="card-detail-range">{{ t.ui.priceRange }}：{{ cardDetailData?.range }}</div>
        <div class="card-detail-special">{{ t.ui.specialEffect }}：{{ cardDetailData?.special }}</div>
        <button class="btn" @click="closeCardDetail">{{ t.ui.close }}</button>
      </div>
    </div>
  </div>
</template>
