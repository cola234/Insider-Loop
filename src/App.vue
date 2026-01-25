<script setup>
import { computed, ref, onMounted } from 'vue'
import { attributes, cards, config, events, specialRules } from './gameData'
import bgmUrl from './music.mp3'

const week = ref(1)
const day = ref(1)
const cash = ref(config.startingCash)
const shares = ref(0)
const price = ref(config.startingPrice)
const dayStartPrice = ref(config.startingPrice)
const cashBeforeDay = ref(config.startingCash)
const lastDayProfit = ref(0)
const phase = ref('setup')
const statusMessage = ref('')

const deck = ref([])
const dayLog = ref([])
const candles = ref([])
const hoveredCandle = ref(null)
const critEffect = ref(null)
const showEndModal = ref(false)
const showFullChart = ref(false)
const showResetConfirm = ref(false)
const showDaySummary = ref(false)
const daySummary = ref(null)
const pendingDayAdvance = ref(null)
const showWeekComplete = ref(false)
const winPercent = ref(null)
const isBgmReady = ref(false)
const isBgmOn = ref(true)
const showMobileLog = ref(true)
let bgmAudio = null
const currentEvent = ref(null)

const selectionRed = ref([])
const selectionGreen = ref([])
const chosenRedId = ref('')
const chosenGreenId = ref('')
const redBg = ref([])
const greenBg = ref([])
const deckBg = ref([]) // 存储deck中每张卡牌的背景图片
const selectedRedDone = ref(false)
const selectedGreenDone = ref(false)
const rerollUsed = ref(false)
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
const activeCardIndex = ref(-1)
const shakeKey = ref(0)
const isRunning = ref(false)
const dragIndex = ref(-1)

const redCards = computed(() => cards.filter((card) => card.color === 'red'))
const greenCards = computed(() => cards.filter((card) => card.color === 'green'))

const weekTarget = computed(() => config.weekTargets[week.value - 1] ?? config.weekTargets[0])
const totalValue = computed(() => cash.value + shares.value * price.value)
const weekColorWeights = [
  { green: 1.1, red: 0.9 },
  { green: 1.05, red: 0.95 },
  { green: 1.0, red: 1.0 },
  { green: 0.95, red: 1.05 },
]
const weekRedScales = [0.6, 0.7, 0.8, 0.9]
const weekGreenScales = [1.4, 1.3, 1.2, 1.1]

function getWeekColorWeight(color) {
  const index = Math.min(week.value - 1, weekColorWeights.length - 1)
  return weekColorWeights[index][color] ?? 1
}

function getWeekRedScale() {
  const index = Math.min(week.value - 1, weekRedScales.length - 1)
  return weekRedScales[index]
}

function getWeekGreenScale() {
  const index = Math.min(week.value - 1, weekGreenScales.length - 1)
  return weekGreenScales[index]
}
const phaseLabel = computed(() => {
  const map = {
    setup: '准备',
    arrange: '排序',
    running: '执行中',
    summary: '结算中',
    win: '通关',
    gameover: '失败',
  }
  return map[phase.value] ?? phase.value
})

const displayedCandles = computed(() => candles.value.slice(-50))

function buildCandleChart(candleList) {
  if (candleList.length === 0) return { viewBox: '0 0 320 120', bars: [] }
  const width = 320
  const height = 120
  const padding = 8
  const prices = candleList.flatMap((candle) => [candle.high, candle.low])
  const max = Math.max(...prices)
  const min = Math.min(...prices)
  const span = Math.max(1, max - min)
  const barWidth = Math.max(6, (width - padding * 2) / candleList.length - 6)
  const bars = candleList.map((candle, index) => {
    const x = padding + index * ((width - padding * 2) / candleList.length)
    const openY = padding + ((height - padding * 2) * (1 - (candle.open - min) / span))
    const closeY = padding + ((height - padding * 2) * (1 - (candle.close - min) / span))
    const highY = padding + ((height - padding * 2) * (1 - (candle.high - min) / span))
    const lowY = padding + ((height - padding * 2) * (1 - (candle.low - min) / span))
    const topY = Math.min(openY, closeY)
    const bodyHeight = Math.max(3, Math.abs(openY - closeY))
    return {
      id: candle.id,
      candle,
      x,
      barWidth,
      openY,
      closeY,
      highY,
      lowY,
      topY,
      bodyHeight,
      color: candle.color,
    }
  })
  return { viewBox: `0 0 ${width} ${height}`, bars }
}

const candleChart = computed(() => buildCandleChart(displayedCandles.value))
const fullCandleChart = computed(() => buildCandleChart(candles.value))

const hoveredCandleInfo = computed(() => {
  if (!hoveredCandle.value) return null
  const open = hoveredCandle.value.open
  const close = hoveredCandle.value.close
  const pct = open === 0 ? 0 : ((close - open) / open) * 100
  return {
    price: close,
    pct: Number(pct.toFixed(2)),
  }
})

function formatMoney(value) {
  return `$${value.toFixed(2)}`
}

function formatPct(value) {
  return `${value.toFixed(2)}%`
}

function pickSelectionPools(resetReroll = true) {
  selectionRed.value = shuffle(redCards.value).slice(0, 3)
  selectionGreen.value = shuffle(greenCards.value).slice(0, 3)
  chosenRedId.value = ''
  chosenGreenId.value = ''
  selectedRedDone.value = false
  selectedGreenDone.value = false
  redBg.value = assignCardBackgrounds('red', 3)
  greenBg.value = assignCardBackgrounds('green', 3)
  if (resetReroll) rerollUsed.value = false
}

function resetGame() {
  week.value = 1
  day.value = 1
  cash.value = config.startingCash
  shares.value = 0
  price.value = config.startingPrice
  dayStartPrice.value = config.startingPrice
  cashBeforeDay.value = config.startingCash
  lastDayProfit.value = 0
  currentEvent.value = null
  deck.value = []
  dayLog.value = []
  candles.value = []
  statusMessage.value = ''
  phase.value = 'setup'
  hoveredCandle.value = null
  showEndModal.value = false
  showFullChart.value = false
  
  // 重置拖拽相关状态
  dragIndex.value = -1
  activeCardIndex.value = -1
  
  // 重置背景图片数组
  deckBg.value = []
  redBg.value = []
  greenBg.value = []
  
  // 重置选择相关状态
  chosenRedId.value = ''
  chosenGreenId.value = ''
  selectedRedDone.value = false
  selectedGreenDone.value = false
  rerollUsed.value = false
  
  // 重置其他状态
  isRunning.value = false
  shakeKey.value = 0
  
  // 清除所有可能残留的 DOM 类
  document.querySelectorAll('.card.drag-over, .card.dragging, .card.active').forEach(el => {
    el.classList.remove('drag-over', 'dragging', 'active')
  })
  
  pickSelectionPools()
}

// 清理每天结束后的状态，防止拖拽和背景图片问题
function cleanupDayState() {
  // 重置拖拽相关状态
  dragIndex.value = -1
  activeCardIndex.value = -1
  
  // 清空卡组和背景图片
  deck.value = []
  deckBg.value = []
  dayLog.value = []
  
  // 重置选择状态
  chosenRedId.value = ''
  chosenGreenId.value = ''
  selectedRedDone.value = false
  selectedGreenDone.value = false
  
  // 清除所有可能残留的 DOM 类
  document.querySelectorAll('.card.drag-over, .card.dragging, .card.active').forEach(el => {
    el.classList.remove('drag-over', 'dragging', 'active')
  })
}

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
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

function cardBgStyle(color, index) {
  // 在选择卡牌阶段使用redBg/greenBg，在排序阶段使用deckBg
  let url = ''
  if (phase.value === 'setup') {
    // 选择卡牌阶段
    const list = color === 'red' ? redBg.value : greenBg.value
    url = list[index] ?? ''
  } else {
    // 排序/执行阶段
    url = deckBg.value[index] ?? ''
  }
  
  if (!url) return {}
  return {
    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url('${url}')`,
  }
}

function tooltipText(card) {
  const sign = card.color === 'green' ? '+' : ''
  return [
    card.name,
    `属性：${attributes[card.attr].label}`,
    `股价${sign}${formatPct(card.min)} ~ ${sign}${formatPct(card.max)}`,
    `特殊效果：${specialRules[card.special]}`,
  ].join('\n')
}

function drawRandomCards(count, excludeIds) {
  const pool = cards.filter((card) => !excludeIds.includes(card.id))
  const weights = pool.map((card) => getWeekColorWeight(card.color))
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

function rollEvent() {
  if (Math.random() > config.eventChance) return null
  return events[Math.floor(Math.random() * events.length)]
}

function canBuyShares() {
  return Math.floor(cash.value / price.value)
}

function buyShares() {
  const affordable = canBuyShares()
  if (affordable <= 0) {
    phase.value = 'gameover'
    statusMessage.value = '被炒：资金不足买 1 股'
    showEndModal.value = true
    showFullChart.value = false
    return false
  }
  shares.value = affordable
  cash.value = Number((cash.value - affordable * price.value).toFixed(2))
  return true
}

function buildDeck() {
  if (phase.value !== 'setup') return
  const forcedRed = cards.find((card) => card.id === chosenRedId.value && card.color === 'red')
  const forcedGreen = cards.find((card) => card.id === chosenGreenId.value && card.color === 'green')
  if (!forcedRed || !forcedGreen) return

  currentEvent.value = rollEvent()
  const randomCards = drawRandomCards(
    config.cardsPerDay - config.forcedRed - config.forcedGreen,
    [forcedRed.id, forcedGreen.id],
  )
  deck.value = shuffle([forcedRed, forcedGreen, ...randomCards])
  
  // 为deck中的卡牌分配背景图片
  const redCount = deck.value.filter(card => card.color === 'red').length
  const greenCount = deck.value.filter(card => card.color === 'green').length
  const redBgs = assignCardBackgrounds('red', redCount)
  const greenBgs = assignCardBackgrounds('green', greenCount)
  
  // 创建背景图片数组，按照deck中卡牌的顺序
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
  
  // 存储到deckBg数组中
  deckBg.value = deckBgs
  redBg.value = redBgs
  greenBg.value = greenBgs
  
  dayLog.value = []
  dayStartPrice.value = price.value
  cashBeforeDay.value = cash.value

  shares.value = 0
  if (!buyShares()) return

  phase.value = 'arrange'
}

function moveCard(index, direction) {
  if (phase.value !== 'arrange') return
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= deck.value.length) return
  const updated = [...deck.value]
  ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
  deck.value = updated
}

function onDragStart(index, event) {
  if (phase.value !== 'arrange' || isRunning.value) return
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  
  // 播放拖拽开始音效
  playTone('select')
  
  // 创建更精美的拖拽图像
  const dragImage = event.target.cloneNode(true)
  dragImage.style.position = 'absolute'
  dragImage.style.top = '-9999px'
  dragImage.style.width = '120px'
  dragImage.style.height = 'auto'
  dragImage.style.opacity = '0.9'
  dragImage.style.transform = 'rotate(5deg) scale(1.1)'
  dragImage.style.filter = 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.8))'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 60, 40)
  
  setTimeout(() => {
    if (document.body.contains(dragImage)) {
      document.body.removeChild(dragImage)
    }
  }, 0)
}

function onDragOver(index, event) {
  if (phase.value !== 'arrange' || isRunning.value) return
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  const target = event.currentTarget
  
  // 只在不同卡牌上添加高亮
  if (dragIndex.value !== index) {
    target.classList.add('drag-over')
    
    // 移除其他卡牌的 drag-over 类（智能高亮切换）
    document.querySelectorAll('.deck-card.drag-over').forEach(el => {
      if (el !== target) {
        el.classList.remove('drag-over')
      }
    })
  }
}

function onDrop(index, event) {
  if (phase.value !== 'arrange' || isRunning.value) return
  event.preventDefault()
  const from = dragIndex.value
  if (from < 0 || from === index) return
  
  // 移除拖拽悬停样式
  event.currentTarget.classList.remove('drag-over')
  
  // 播放放置成功音效
  playTone('confirm')
  
  // 更新deck数组（Vue 会自动触发平滑过渡动画）
  const updated = [...deck.value]
  const [moved] = updated.splice(from, 1)
  updated.splice(index, 0, moved)
  deck.value = updated
  
  // 同步更新deckBg数组
  const updatedBg = [...deckBg.value]
  const [movedBg] = updatedBg.splice(from, 1)
  updatedBg.splice(index, 0, movedBg)
  deckBg.value = updatedBg
  
  dragIndex.value = -1
}

function onDragEnd() {
  dragIndex.value = -1
  
  // 清除所有拖拽相关的CSS类
  document.querySelectorAll('.deck-card.drag-over').forEach(el => {
    el.classList.remove('drag-over')
  })
}

// 新增：拖拽离开事件，防止残留高亮
function onDragLeave(event) {
  // 移除高亮效果
  event.currentTarget.classList.remove('drag-over')
}

function chooseCard(card) {
  if (phase.value !== 'setup') return
  if (card.color === 'red') {
    chosenRedId.value = card.id
  }
  if (card.color === 'green') {
    chosenGreenId.value = card.id
  }
  // 移除自动确认逻辑，用户需要点击“确认”按钮
}

function rerollSelections() {
  if (phase.value !== 'setup' || rerollUsed.value) return
  rerollUsed.value = true
  pickSelectionPools(false)
}

function randomRange(min, max) {
  return min + Math.random() * (max - min)
}

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
  if (card.special === 'echo' && prevCard && prevCard.color === card.color && Math.random() < 0.5) {
    nextPct += card.color === 'green' ? 2 : -2
  }
  if (card.special === 'swing' && prevCard && prevCard.color !== card.color && Math.random() < 0.5) {
    nextPct += card.color === 'green' ? 3 : -3
  }
  if (card.special === 'booster' && Math.random() < 0.5) {
    nextPct *= 1.25
  }
  if (card.special === 'brake' && Math.random() < 0.5) {
    nextPct *= 0.75
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const audio = {
  ctx: null,
  ready: false,
}

let critTimer = null
let critShakeTimer = null

function ensureAudio() {
  if (audio.ready) return
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return
  audio.ctx = new AudioCtx()
  audio.ready = true
}

function playTone(type) {
  if (!audio.ready || !audio.ctx) return
  const ctx = audio.ctx
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime
  const base = type === 'green' ? 520 : 220
  osc.type = type === 'green' ? 'triangle' : 'sawtooth'
  osc.frequency.setValueAtTime(base, now)
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
}

function playCritTone(type) {
  if (!audio.ready || !audio.ctx) return
  const ctx = audio.ctx
  const now = ctx.currentTime
  const baseMap = {
    monkey: 620,
    bull: 520,
    bear: 260,
  }
  const base = baseMap[type] ?? 440
  const osc = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const osc3 = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc2.type = 'triangle'
  osc3.type = 'sawtooth'
  osc.frequency.setValueAtTime(base, now)
  osc2.frequency.setValueAtTime(base * 1.5, now)
  osc3.frequency.setValueAtTime(base * 2.2, now)
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.exponentialRampToValueAtTime(0.32, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24)
  osc.connect(gain)
  osc2.connect(gain)
  osc3.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc2.start(now)
  osc3.start(now)
  osc.stop(now + 0.28)
  osc2.stop(now + 0.28)
  osc3.stop(now + 0.28)
}

function triggerCrit(type) {
  ensureAudio()
  playCritTone(type)
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

function initBgm() {
  if (bgmAudio) return
  bgmAudio = new Audio(bgmUrl)
  bgmAudio.loop = true
  bgmAudio.volume = 0.5
  isBgmReady.value = true
}

function startBgm() {
  if (!isBgmOn.value) return
  initBgm()
  if (!bgmAudio) return
  bgmAudio.play().catch(() => {})
}

function toggleBgm() {
  isBgmOn.value = !isBgmOn.value
  if (!bgmAudio) {
    initBgm()
  }
  if (!bgmAudio) return
  if (isBgmOn.value) {
    bgmAudio.play().catch(() => {})
  } else {
    bgmAudio.pause()
  }
}

function triggerShake() {
  shakeKey.value += 1
  setTimeout(() => {
    shakeKey.value += 1
  }, 220)
}

function buildCandle(open, close, color, id) {
  const range = Math.max(0.5, Math.abs(close - open))
  const wick = Math.max(0.8, range * 0.6)
  const high = Math.max(open, close) + wick
  const low = Math.max(1, Math.min(open, close) - wick)
  return { open, close, high, low, color, id }
}

async function runDay() {
  if (phase.value !== 'arrange' || isRunning.value) return
  ensureAudio()
  startBgm()
  isRunning.value = true
  phase.value = 'running'

  const modifiers = buildModifiers(currentEvent.value)
  const pending = { invert: false, double: false }
  let usedFirstGreen = false
  let usedFirstRed = false
  let runningPrice = price.value
  const log = []
  const candleHistory = [...candles.value]
  const stepDelay = 520
  const eventId = currentEvent.value?.id
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

    if (card.attr === 'monkey' && streakLength >= 2) {
      const baseChance = 0.25 + 0.15 * (streakLength - 2)
      const chance = Math.min(0.7, baseChance + modifiers.monkeyFlipBonus)
      if (Math.random() < chance) {
        pct *= -1
        critType = 'monkey'
      }
    }

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

    if (card.color === 'red' && pct < 0) {
      pct *= getWeekRedScale()
    }
    if (card.color === 'green' && pct > 0) {
      pct *= getWeekGreenScale()
    }

    if (pendingNow.invert) pct *= -1
    if (pendingNow.double) pct *= 2

    if (nextMultiplier !== 1) {
      pct *= nextMultiplier
    }

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
      if (card.special === 'ghost' && Math.random() < 0.5) {
        pendingAddToNext += card.color === 'green' ? 2 : -2
        pct = 0
        critType = ''
      }
      if (card.special === 'shield') {
        pendingShieldColor = card.color
      }
      if (card.special === 'latch') {
        pendingLatchColor = card.color
      }
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

    if (addFromPrev) {
      pct += addFromPrev
    }

    if (card.special === 'reverseNext' && Math.random() < 0.5) pending.invert = true
    if (card.special === 'doubleNext' && Math.random() < 0.5) pending.double = true

    const priceBefore = runningPrice
    activeCardIndex.value = index
    if (critType) triggerCrit(critType)
    runningPrice = Math.max(1, runningPrice * (1 + pct / 100))
    runningPrice = Number(runningPrice.toFixed(2))
    const candleId = `w${week.value}d${day.value}-${card.id}-${index}-${candleHistory.length}`
    candleHistory.push(buildCandle(priceBefore, runningPrice, pct >= 0 ? 'green' : 'red', candleId))
    candles.value = [...candleHistory]

    log.push({
      id: `${card.id}-${index}`,
      card,
      pct: Number(pct.toFixed(2)),
      before: priceBefore,
      after: runningPrice,
    })
    dayLog.value = [...log]
    playTone(card.color)
    if (Math.abs(pct) >= 6) triggerShake()
    await sleep(stepDelay)

    if (eventId === 'mid-reshuffle' && index === 4) {
      const remaining = deck.value.slice(index + 1)
      const remainingBg = deckBg.value.slice(index + 1)
      if (remaining.length) {
        const paired = remaining.map((item, i) => ({ card: item, bg: remainingBg[i] }))
        const shuffled = shuffle(paired)
        const prefix = deck.value.slice(0, index + 1)
        deck.value = [...prefix, ...shuffled.map((item) => item.card)]
        deckBg.value = [...deckBg.value.slice(0, index + 1), ...shuffled.map((item) => item.bg)]
      }
    }
  }

  let settlementBefore = runningPrice
  if (pendingDayEndAdd) {
    runningPrice = Math.max(1, runningPrice * (1 + pendingDayEndAdd / 100))
    runningPrice = Number(runningPrice.toFixed(2))
  }

  if (eventId === 'soft-retrace') {
    const dayPct = dayStartPrice.value === 0
      ? 0
      : ((runningPrice - dayStartPrice.value) / dayStartPrice.value) * 100
    if (Math.abs(dayPct) > 8) {
      const targetPct = dayPct * 0.8
      runningPrice = Number((dayStartPrice.value * (1 + targetPct / 100)).toFixed(2))
    }
  }

  if (runningPrice !== settlementBefore) {
    const settleId = `settle-w${week.value}d${day.value}-${candleHistory.length}`
    candleHistory.push(buildCandle(settlementBefore, runningPrice, runningPrice >= settlementBefore ? 'green' : 'red', settleId))
    candles.value = [...candleHistory]
  }

  price.value = runningPrice
  candles.value = candleHistory
  dayLog.value = log
  activeCardIndex.value = -1

  const cashAfterSell = cash.value + shares.value * price.value
  const rawProfit = cashAfterSell - cashBeforeDay.value
  const adjustedProfit = rawProfit * modifiers.profitMultiplier
  let finalCash = cashBeforeDay.value + adjustedProfit
  if (modifiers.taxRate && adjustedProfit > 0) {
    finalCash -= adjustedProfit * modifiers.taxRate
  }
  cash.value = Number(finalCash.toFixed(2))
  shares.value = 0
  lastDayProfit.value = Number(adjustedProfit.toFixed(2))
  isRunning.value = false

  const dayPct = dayStartPrice.value === 0
    ? 0
    : ((price.value - dayStartPrice.value) / dayStartPrice.value) * 100
  daySummary.value = {
    week: week.value,
    day: day.value,
    dayPct: Number(dayPct.toFixed(2)),
    profit: lastDayProfit.value,
    cash: cash.value,
    target: weekTarget.value,
  }
  showDaySummary.value = true
  phase.value = 'summary'

  pendingDayAdvance.value = () => {
    if (day.value >= config.daysPerWeek) {
      if (cash.value >= weekTarget.value) {
        if (week.value >= config.weeks) {
          const percent = winPercent.value ?? Number((50 + Math.random() * 50).toFixed(2))
          winPercent.value = percent
          phase.value = 'win'
          statusMessage.value = `通关成功/任务完成！您已击败${percent}%的玩家`
          showEndModal.value = true
          showFullChart.value = false
          return
        }
        showWeekComplete.value = true
        setTimeout(() => {
          showWeekComplete.value = false
          week.value += 1
          day.value = 1
          cash.value = config.startingCash
          phase.value = 'setup'
          statusMessage.value = '本周达标'
          currentEvent.value = null
          cleanupDayState()
          pickSelectionPools()
        }, 1200)
        return
      }
      phase.value = 'gameover'
      statusMessage.value = '被炒：未达成周目标'
      showEndModal.value = true
      showFullChart.value = false
      return
    }
    day.value += 1
    phase.value = 'setup'
    statusMessage.value = ''
    currentEvent.value = null
    cleanupDayState()
    pickSelectionPools()
  }
}

function onCandleEnter(bar) {
  hoveredCandle.value = bar.candle
}

function onCandleLeave() {
  hoveredCandle.value = null
}

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

resetGame()

onMounted(() => {
  initBgm()
  const unlock = () => {
    startBgm()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
})
</script>

<template>
  <div class="app">
    <div v-if="critEffect" :key="critEffect.key" class="crit-screen" :class="`crit-${critEffect.type}`"></div>
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="status-header">
          <div class="status-title">Insider Loop v1.0 系统在线</div>
        <div class="status-info">
          <span class="status-item">第 <span class="status-value">{{ week }}</span> 周</span>
          <span class="status-item">第 <span class="status-value">{{ day }}</span> 天</span>
          <span class="status-item">现金：<span class="status-value">{{ formatMoney(cash) }}</span></span>
          <span class="status-item">状态：<span class="status-value">{{ phaseLabel }}</span></span>
        </div>
      </div>
    </div>

    <div class="audio-toggle">
      <button class="btn" @click="toggleBgm">
        BGM: {{ isBgmOn ? 'ON' : 'OFF' }}
      </button>
    </div>

    <!-- 主网格区域 -->
    <div class="main-grid">
      <!-- 左侧：市场终端 -->
      <div class="panel">
        <div class="panel-header">市场终端</div>
        
        <div class="market-stats">
          <div class="stat-box">
            <div class="stat-label">股价</div>
            <div class="stat-value">{{ formatMoney(price) }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">持仓</div>
            <div class="stat-value">{{ shares }}股</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">盈亏</div>
            <div class="stat-value" :class="{ positive: lastDayProfit > 0, negative: lastDayProfit < 0 }">
              {{ formatMoney(lastDayProfit) }}
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-label">目标</div>
            <div class="stat-value">{{ formatMoney(weekTarget) }}</div>
          </div>
        </div>
        <div class="chart-area">
          <svg :viewBox="candleChart.viewBox" role="img" aria-label="Price chart" style="width: 100%; height: 150px;">
            <g
              v-for="bar in candleChart.bars"
              :key="bar.id"
              @mouseenter="onCandleEnter(bar)"
              @mouseleave="onCandleLeave"
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
            <div>当前股价：{{ formatMoney(hoveredCandleInfo.price) }}</div>
            <div>上涨/下跌：{{ formatPct(hoveredCandleInfo.pct) }}</div>
          </div>
          <div
            v-if="critEffect"
            :key="critEffect.key"
            class="crit-burst"
            :class="`crit-${critEffect.type}`"
          ></div>
          <div
            v-if="critEffect"
            :key="`label-${critEffect.key}`"
            class="crit-label"
            :class="`crit-${critEffect.type}`"
          >
            暴击
          </div>
        </div>

        <div v-if="currentEvent" class="event-box">
          <div class="event-name">{{ currentEvent.name }}</div>
          <div class="event-desc">{{ currentEvent.desc }}</div>
        </div>
      </div>

      <!-- 右侧：交易卡组 -->
      <div class="panel">
        <div class="panel-header">交易卡组</div>
        
        <div class="card-selection">
          <div class="card-group">
            <button
              v-for="(card, index) in selectionRed"
              :key="card.id"
              class="choice-card red"
              :class="{ chosen: chosenRedId === card.id }"
              :style="cardBgStyle('red', index)"
              :data-detail="tooltipText(card)"
              @click="chooseCard(card)"
              :disabled="phase !== 'setup'"
            >
              <div class="card-name">↓ {{ card.name }}</div>
              <div class="card-attr">{{ attributes[card.attr].label }}</div>
              <div class="card-range">{{ formatPct(card.min) }} ~ {{ formatPct(card.max) }}</div>
            </button>
          </div>

          <div class="card-group">
            <button
              v-for="(card, index) in selectionGreen"
              :key="card.id"
              class="choice-card"
              :class="{ chosen: chosenGreenId === card.id }"
              :style="cardBgStyle('green', index)"
              :data-detail="tooltipText(card)"
              @click="chooseCard(card)"
              :disabled="phase !== 'setup'"
            >
              <div class="card-name">↑ {{ card.name }}</div>
              <div class="card-attr">{{ attributes[card.attr].label }}</div>
              <div class="card-range">{{ formatPct(card.min) }} ~ {{ formatPct(card.max) }}</div>
            </button>
          </div>

          <div class="btn-group">
            <button class="btn" @click="rerollSelections" :disabled="phase !== 'setup' || rerollUsed">
              {{ rerollUsed ? '已使用' : '重抽' }}
            </button>
            <button
              class="btn"
              @click="buildDeck"
              :disabled="phase !== 'setup' || !chosenRedId || !chosenGreenId"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡组序列 -->
    <div class="deck-section">
      <div class="deck-container">
        <div class="panel-header">卡组序列</div>
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
            @dragstart="onDragStart(index, $event)"
            @dragover="onDragOver(index, $event)"
            @dragleave="onDragLeave($event)"
            @drop="onDrop(index, $event)"
            @dragend="onDragEnd"
          >
            <div class="deck-mobile-controls">
              <button class="btn deck-move" @click.stop="moveCard(index, -1)" :disabled="phase !== 'arrange' || index === 0">
                ↑
              </button>
              <button class="btn deck-move" @click.stop="moveCard(index, 1)" :disabled="phase !== 'arrange' || index === deck.length - 1">
                ↓
              </button>
            </div>
            <div class="card-top">
              <span>{{ card.name }}</span>
              <span>{{ attributes[card.attr].label }}</span>
            </div>
            <div class="card-body">{{ formatPct(card.min) }} ~ {{ formatPct(card.max) }}</div>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn" @click="runDay" :disabled="phase !== 'arrange'">开始执行</button>
          <button class="btn danger" @click="openResetConfirm">重置</button>
        </div>
      </div>
    </div>

    <!-- 执行日志 -->
    <div class="log-section" :class="{ 'is-collapsed': !showMobileLog }">
      <div class="panel-header log-header">
        <span>执行日志</span>
        <button class="btn log-toggle" @click="toggleMobileLog">
          {{ showMobileLog ? '隐藏日志' : '展开日志' }}
        </button>
      </div>
      <div class="log-content">
        <div v-if="dayLog.length === 0" class="log-empty">暂无记录</div>
        <div v-else>
          <div v-for="entry in dayLog" :key="entry.id" class="log-line">
            <span class="log-text">{{ entry.card.name }}</span>
            <span
              class="log-value"
              :class="{ negative: entry.pct < 0, positive: entry.pct > 0 }"
            >
              {{ formatPct(entry.pct) }}
            </span>
            <span class="log-text">[{{ formatMoney(entry.after) }}]</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEndModal" class="end-modal">
      <div class="end-modal-content">
        <div class="end-modal-title">游戏结束</div>
        <div class="end-modal-status">{{ statusMessage || '游戏结束' }}</div>
        <div class="end-modal-actions">
          <button class="btn" @click="openFullChart">查看本局走势</button>
          <button class="btn danger" @click="closeEndModal">关闭</button>
        </div>
        <div v-if="showFullChart" class="end-modal-chart">
          <svg
            :viewBox="fullCandleChart.viewBox"
            role="img"
            aria-label="Full price chart"
            style="width: 100%; height: 220px;"
          >
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

    <div v-if="showDaySummary" class="end-modal">
      <div class="end-modal-content day-summary">
        <div class="end-modal-title">日终总结</div>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">当前周/日</span>
            <span class="summary-value">第{{ daySummary?.week }}周 / 第{{ daySummary?.day }}天</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">当日涨跌幅</span>
            <span class="summary-value" :class="{ positive: (daySummary?.dayPct ?? 0) > 0, negative: (daySummary?.dayPct ?? 0) < 0 }">
              {{ formatPct(daySummary?.dayPct ?? 0) }}
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">当日盈亏</span>
            <span class="summary-value" :class="{ positive: (daySummary?.profit ?? 0) > 0, negative: (daySummary?.profit ?? 0) < 0 }">
              {{ formatMoney(daySummary?.profit ?? 0) }}
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">当前现金</span>
            <span class="summary-value">{{ formatMoney(daySummary?.cash ?? 0) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">目标资产</span>
            <span class="summary-value">{{ formatMoney(daySummary?.target ?? 0) }}</span>
          </div>
        </div>
        <div class="end-modal-actions">
          <button class="btn" @click="confirmDaySummary">确认并继续</button>
        </div>
      </div>
    </div>

    <div v-if="showWeekComplete" class="week-complete">
      <div class="week-complete-inner">
        <div class="week-complete-title">周目标达成</div>
        <div class="week-complete-subtitle">系统推进中...</div>
      </div>
    </div>

    <div v-if="showResetConfirm" class="end-modal">
      <div class="end-modal-content">
        <div class="end-modal-title">确认重置</div>
        <div class="end-modal-status">你是否要确认重新开始游戏？这会导致你所有的数据丢失。</div>
        <div class="end-modal-actions">
          <button class="btn danger" @click="confirmReset">确认重置</button>
          <button class="btn" @click="closeResetConfirm">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>
