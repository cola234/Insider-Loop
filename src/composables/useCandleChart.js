import { ref, computed } from 'vue'

export function useCandleChart() {
  const candles = ref([])
  const hoveredCandle = ref(null)

  const displayedCandles = computed(() => candles.value.slice(-50))

  function buildCandleChart(candleList) {
    if (candleList.length === 0) return { viewBox: '0 0 320 120', bars: [] }
    const width = 320
    const height = 120
    const padding = 8
    const prices = candleList.flatMap((c) => [c.high, c.low])
    const max = Math.max(...prices)
    const min = Math.min(...prices)
    const span = Math.max(1, max - min)
    const barWidth = Math.max(6, (width - padding * 2) / candleList.length - 6)

    const bars = candleList.map((candle, index) => {
      const x = padding + index * ((width - padding * 2) / candleList.length)
      const openY = padding + (height - padding * 2) * (1 - (candle.open - min) / span)
      const closeY = padding + (height - padding * 2) * (1 - (candle.close - min) / span)
      const highY = padding + (height - padding * 2) * (1 - (candle.high - min) / span)
      const lowY = padding + (height - padding * 2) * (1 - (candle.low - min) / span)
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
    return { price: close, pct: Number(pct.toFixed(2)) }
  })

  function buildCandle(open, close, color, id) {
    const range = Math.max(0.5, Math.abs(close - open))
    const wick = Math.max(0.8, range * 0.6)
    const high = Math.max(open, close) + wick
    const low = Math.max(1, Math.min(open, close) - wick)
    return { open, close, high, low, color, id }
  }

  function onCandleEnter(bar) {
    hoveredCandle.value = bar.candle
  }

  function onCandleLeave() {
    hoveredCandle.value = null
  }

  return {
    candles,
    hoveredCandle,
    displayedCandles,
    candleChart,
    fullCandleChart,
    hoveredCandleInfo,
    buildCandle,
    onCandleEnter,
    onCandleLeave,
  }
}
