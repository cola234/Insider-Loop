<template>
  <div class="start-page">
    <!-- Animated background -->
    <div class="bg-animation">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Main content -->
    <div class="start-content">
      <div class="logo-container">
        <h1 class="game-title">
          <span class="title-line">股市</span>
          <span class="title-line">卡牌</span>
          <span class="title-line">大师</span>
        </h1>
        <p class="game-subtitle">用策略征服市场波动</p>
      </div>

      <div class="menu-container">
        <button class="menu-btn primary" @click="startGame">
          <span class="btn-text">开始游戏</span>
          <span class="btn-icon">▶</span>
        </button>
        
        <button class="menu-btn secondary" @click="showCredits">
          <span class="btn-text">制作人员</span>
          <span class="btn-icon">👥</span>
        </button>
      </div>

      <div class="footer-text">
        <p>© 2026 Solana Hackathon Project</p>
      </div>
    </div>

    <!-- Credits Modal -->
    <transition name="modal-fade">
      <div v-if="creditsVisible" class="modal-overlay" @click="hideCredits">
        <div class="modal-content credits-modal" @click.stop>
          <button class="close-btn" @click="hideCredits">✕</button>
          <h2 class="modal-title">制作人员</h2>
          <div class="credits-list">
            <div class="credit-item">
              <div class="credit-role">游戏设计</div>
              <div class="credit-name">开发团队</div>
            </div>
            <div class="credit-item">
              <div class="credit-role">程序开发</div>
              <div class="credit-name">Vue.js 团队</div>
            </div>
            <div class="credit-item">
              <div class="credit-role">UI/UX 设计</div>
              <div class="credit-name">设计团队</div>
            </div>
            <div class="credit-item">
              <div class="credit-role">特别感谢</div>
              <div class="credit-name">Solana Hackathon</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['start-game'])
const creditsVisible = ref(false)

const startGame = () => {
  emit('start-game')
}

const showCredits = () => {
  creditsVisible.value = true
}

const hideCredits = () => {
  creditsVisible.value = false
}
</script>

<style scoped>
.start-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animated background */
.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ff6b6b, transparent);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #4ecdc4, transparent);
  bottom: -150px;
  right: -150px;
  animation-delay: 7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #95e1d3, transparent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
}

/* Main content */
.start-content {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo */
.logo-container {
  margin-bottom: 60px;
}

.game-title {
  font-size: 5rem;
  font-weight: 900;
  margin: 0;
  line-height: 1.1;
  background: linear-gradient(135deg, #fff 0%, #4ecdc4 50%, #95e1d3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(78, 205, 196, 0.3);
  animation: titleGlow 3s ease-in-out infinite;
}

.title-line {
  display: block;
  animation: slideIn 0.8s ease-out backwards;
}

.title-line:nth-child(1) {
  animation-delay: 0.1s;
}

.title-line:nth-child(2) {
  animation-delay: 0.2s;
}

.title-line:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes titleGlow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(78, 205, 196, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(78, 205, 196, 0.6));
  }
}

.game-subtitle {
  font-size: 1.4rem;
  color: #95e1d3;
  margin-top: 20px;
  font-weight: 300;
  letter-spacing: 4px;
  animation: fadeIn 1s ease-out 0.5s backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Menu */
.menu-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  animation: fadeIn 1s ease-out 0.7s backwards;
}

.menu-btn {
  position: relative;
  width: 320px;
  padding: 20px 40px;
  font-size: 1.3rem;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  letter-spacing: 2px;
}

.menu-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.menu-btn:hover::before {
  left: 100%;
}

.menu-btn.primary {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  box-shadow: 0 8px 32px rgba(78, 205, 196, 0.4);
}

.menu-btn.primary:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 48px rgba(78, 205, 196, 0.6);
}

.menu-btn.primary:active {
  transform: translateY(-2px) scale(1.01);
}

.menu-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #95e1d3;
  border: 2px solid rgba(149, 225, 211, 0.3);
  backdrop-filter: blur(10px);
}

.menu-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(149, 225, 211, 0.6);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 32px rgba(149, 225, 211, 0.3);
}

.menu-btn.secondary:active {
  transform: translateY(-2px) scale(1.01);
}

.btn-text {
  flex: 1;
  text-align: center;
}

.btn-icon {
  font-size: 1.2rem;
  opacity: 0.8;
}

/* Footer */
.footer-text {
  margin-top: 60px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  animation: fadeIn 1s ease-out 1s backwards;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%);
  border-radius: 24px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  border: 2px solid rgba(78, 205, 196, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #95e1d3;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  transform: rotate(90deg);
}

.modal-title {
  font-size: 2rem;
  color: #4ecdc4;
  margin-bottom: 30px;
  text-align: center;
}

.credits-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.credit-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #4ecdc4;
  transition: all 0.3s;
}

.credit-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(8px);
}

.credit-role {
  font-size: 0.9rem;
  color: #95e1d3;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 1px;
}

.credit-name {
  font-size: 1.2rem;
  color: white;
  font-weight: 300;
}

/* Modal transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .game-title {
    font-size: 3.5rem;
  }

  .game-subtitle {
    font-size: 1rem;
    letter-spacing: 2px;
  }

  .menu-btn {
    width: 280px;
    padding: 18px 32px;
    font-size: 1.1rem;
  }

  .modal-content {
    padding: 30px;
  }

  .modal-title {
    font-size: 1.6rem;
  }
}
</style>
