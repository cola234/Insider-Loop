<template>
  <div class="game-wrapper">
    <!-- Start Page -->
    <transition name="fade-out">
      <StartPage v-if="currentView === 'start'" @start-game="handleStartGame" />
    </transition>

    <!-- Black screen transition -->
    <transition name="fade">
      <div v-if="showBlackScreen" class="black-screen"></div>
    </transition>

    <!-- Tutorial -->
    <transition name="fade">
      <Tutorial v-if="currentView === 'tutorial'" @complete="handleTutorialComplete" />
    </transition>

    <!-- Main Game -->
    <transition name="fade">
      <div v-if="currentView === 'game'" class="game-container">
        <App />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StartPage from './components/StartPage.vue'
import Tutorial from './components/Tutorial.vue'
import App from './App.vue'

const currentView = ref('start') // 'start', 'tutorial', 'game'
const showBlackScreen = ref(false)

const handleStartGame = async () => {
  // Show black screen
  showBlackScreen.value = true
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Hide start page and black screen, show tutorial
  currentView.value = 'tutorial'
  showBlackScreen.value = false
}

const handleTutorialComplete = () => {
  // Hide tutorial, show game
  currentView.value = 'game'
}
</script>

<style scoped>
.game-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.black-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 3000;
}

.game-container {
  width: 100%;
  height: 100%;
}

/* Fade transition for black screen and tutorial */
.fade-enter-active {
  transition: opacity 2s ease-out;
}

.fade-leave-active {
  transition: opacity 0.5s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Fade out transition for start page */
.fade-out-leave-active {
  transition: opacity 0.5s ease-out;
}

.fade-out-leave-to {
  opacity: 0;
}
</style>