import { ref, computed } from 'vue'
import { config } from '../gameData'

export function useGameState() {
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
  const currentEvent = ref(null)
  const isRunning = ref(false)

  const weekTarget = computed(() => config.weekTargets[week.value - 1] ?? config.weekTargets[0])

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

  const weekColorWeights = [
    { green: 1.08, red: 0.92 },
    { green: 1.04, red: 0.96 },
    { green: 1.00, red: 1.00 },
    { green: 0.96, red: 1.04 },
  ]
  const weekRedScales = [0.60, 0.70, 0.80, 0.88]
  const weekGreenScales = [1.35, 1.25, 1.15, 1.08]

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

  function resetGameState() {
    week.value = 1
    day.value = 1
    cash.value = config.startingCash
    shares.value = 0
    price.value = config.startingPrice
    dayStartPrice.value = config.startingPrice
    cashBeforeDay.value = config.startingCash
    lastDayProfit.value = 0
    currentEvent.value = null
    statusMessage.value = ''
    phase.value = 'setup'
    isRunning.value = false
  }

  return {
    week,
    day,
    cash,
    shares,
    price,
    dayStartPrice,
    cashBeforeDay,
    lastDayProfit,
    phase,
    statusMessage,
    currentEvent,
    isRunning,
    weekTarget,
    phaseLabel,
    getWeekColorWeight,
    getWeekRedScale,
    getWeekGreenScale,
    resetGameState,
  }
}
