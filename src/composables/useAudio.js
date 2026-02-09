import { ref } from 'vue'

export function useAudio(bgmUrl) {
  const isBgmReady = ref(false)
  const isBgmOn = ref(true)

  let bgmAudio = null
  const audio = { ctx: null, ready: false }

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
    if (!bgmAudio) initBgm()
    if (!bgmAudio) return
    if (isBgmOn.value) {
      bgmAudio.play().catch(() => {})
    } else {
      bgmAudio.pause()
    }
  }

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
    const baseMap = { monkey: 620, bull: 520, bear: 260 }
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

  return {
    isBgmReady,
    isBgmOn,
    initBgm,
    startBgm,
    toggleBgm,
    ensureAudio,
    playTone,
    playCritTone,
  }
}
