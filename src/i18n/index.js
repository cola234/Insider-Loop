import { ref, computed } from 'vue'
import zh from './zh.js'
import en from './en.js'

const messages = { zh, en }
const currentLang = ref(localStorage.getItem('lang') || 'zh')

export function useI18n() {
  const lang = computed(() => currentLang.value)
  const t = computed(() => messages[currentLang.value])

  function setLang(newLang) {
    if (messages[newLang]) {
      currentLang.value = newLang
      localStorage.setItem('lang', newLang)
    }
  }

  function toggleLang() {
    setLang(currentLang.value === 'zh' ? 'en' : 'zh')
  }

  return { lang, t, setLang, toggleLang }
}

export { currentLang }
