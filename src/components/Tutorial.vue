<template>
  <div class="tutorial-overlay" @click="handleSkip">
    <div class="tutorial-content" @click.stop>
      <button class="skip-btn" @click="handleSkip">
        跳过教程 ✕
      </button>

      <!-- Tutorial pages -->
      <transition :name="slideDirection" mode="out-in">
        <div :key="currentPage" class="tutorial-page">
          <div class="page-indicator">
            <span
              v-for="i in totalPages"
              :key="i"
              class="indicator-dot"
              :class="{ active: i === currentPage }"
            ></span>
          </div>

          <!-- Page 1: Welcome -->
          <div v-if="currentPage === 1" class="page-content">
            <div class="icon-large">🎮</div>
            <h2 class="page-title">欢迎来到股市卡牌大师</h2>
            <p class="page-text">
              这是一款策略卡牌游戏，你需要通过合理安排红色和绿色卡牌来影响股价走势。
            </p>
            <p class="page-text highlight">
              目标：在规定周数内达到目标资产值！
            </p>
          </div>

          <!-- Page 2: Card Selection -->
          <div v-if="currentPage === 2" class="page-content">
            <div class="icon-large">🎴</div>
            <h2 class="page-title">选择卡牌</h2>
            <p class="page-text">
              每天开始时，你需要从<span class="red-text">红色卡牌</span>和<span class="green-text">绿色卡牌</span>中各选择一张。
            </p>
            <div class="card-demo">
              <div class="demo-card red">
                <div class="card-label">红色卡牌</div>
                <div class="card-effect">下跌效果</div>
              </div>
              <div class="demo-card green">
                <div class="card-label">绿色卡牌</div>
                <div class="card-effect">上涨效果</div>
              </div>
            </div>
            <p class="page-text small">
              💡 提示：每天有一次重抽机会
            </p>
          </div>

          <!-- Page 3: Deck Arrangement -->
          <div v-if="currentPage === 3" class="page-content">
            <div class="icon-large">📊</div>
            <h2 class="page-title">排列卡组</h2>
            <p class="page-text">
              选择完卡牌后，你可以通过<strong>拖拽</strong>来调整卡组中的卡牌顺序。
            </p>
            <div class="demo-deck">
              <div class="demo-deck-card green">1</div>
              <div class="demo-deck-card red">2</div>
              <div class="demo-deck-card green">3</div>
              <div class="demo-deck-card red">4</div>
            </div>
            <p class="page-text highlight">
              卡牌的顺序会影响连击效果和特殊规则！
            </p>
          </div>

          <!-- Page 4: Execution -->
          <div v-if="currentPage === 4" class="page-content">
            <div class="icon-large">⚡</div>
            <h2 class="page-title">执行与策略</h2>
            <p class="page-text">
              点击"开始执行"后，卡牌将按顺序生效，影响股价。
            </p>
            <div class="strategy-tips">
              <div class="tip-item">
                <span class="tip-icon">📈</span>
                <span>持有股票时使用绿色卡牌</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">💰</span>
                <span>低价买入，高价卖出</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">🎯</span>
                <span>注意每周的目标资产值</span>
              </div>
            </div>
          </div>

          <!-- Page 5: Start -->
          <div v-if="currentPage === 5" class="page-content">
            <div class="icon-large">🚀</div>
            <h2 class="page-title">准备好了吗？</h2>
            <p class="page-text">
              现在你已经了解了游戏的基本规则。
            </p>
            <p class="page-text highlight">
              祝你好运，成为真正的股市大师！
            </p>
            <button class="start-game-btn" @click="handleSkip">
              开始游戏 🎮
            </button>
          </div>
        </div>
      </transition>

      <!-- Navigation -->
      <div class="tutorial-nav">
        <button
          class="nav-btn"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          ← 上一页
        </button>
        <button
          class="nav-btn primary"
          @click="nextPage"
        >
          {{ currentPage === totalPages ? '开始游戏' : '下一页 →' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['complete'])

const currentPage = ref(1)
const totalPages = 5
const slideDirection = ref('slide-left')

const nextPage = () => {
  if (currentPage.value < totalPages) {
    slideDirection.value = 'slide-left'
    currentPage.value++
  } else {
    handleSkip()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    slideDirection.value = 'slide-right'
    currentPage.value--
  }
}

const handleSkip = () => {
  emit('complete')
}
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tutorial-content {
  position: relative;
  background: linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%);
  border-radius: 24px;
  padding: 50px 40px 40px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  border: 2px solid rgba(78, 205, 196, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.skip-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.skip-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
  color: #ff6b6b;
}

/* Page indicator */
.page-indicator {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.indicator-dot.active {
  background: #4ecdc4;
  width: 30px;
  border-radius: 5px;
}

/* Page content */
.tutorial-page {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.page-content {
  text-align: center;
  flex: 1;
}

.icon-large {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.page-title {
  font-size: 2rem;
  color: #4ecdc4;
  margin-bottom: 20px;
  font-weight: 700;
}

.page-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin-bottom: 15px;
}

.page-text.small {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
}

.page-text.highlight {
  color: #95e1d3;
  font-weight: 600;
  font-size: 1.2rem;
}

.red-text {
  color: #ff6b6b;
  font-weight: 600;
}

.green-text {
  color: #4ecdc4;
  font-weight: 600;
}

/* Card demo */
.card-demo {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 30px 0;
}

.demo-card {
  width: 150px;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
  transition: all 0.3s;
}

.demo-card.red {
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
}

.demo-card.green {
  background: rgba(78, 205, 196, 0.1);
  border-color: #4ecdc4;
}

.demo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
}

.card-label {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: white;
}

.card-effect {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Deck demo */
.demo-deck {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 30px 0;
}

.demo-deck-card {
  width: 60px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  border: 2px solid;
  animation: cardFloat 3s ease-in-out infinite;
}

.demo-deck-card.red {
  background: rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
}

.demo-deck-card.green {
  background: rgba(78, 205, 196, 0.2);
  border-color: #4ecdc4;
}

.demo-deck-card:nth-child(1) {
  animation-delay: 0s;
}

.demo-deck-card:nth-child(2) {
  animation-delay: 0.2s;
}

.demo-deck-card:nth-child(3) {
  animation-delay: 0.4s;
}

.demo-deck-card:nth-child(4) {
  animation-delay: 0.6s;
}

@keyframes cardFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Strategy tips */
.strategy-tips {
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #4ecdc4;
  text-align: left;
  transition: all 0.3s;
}

.tip-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(10px);
}

.tip-icon {
  font-size: 1.8rem;
}

.tip-item span:last-child {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

/* Start button */
.start-game-btn {
  margin-top: 30px;
  padding: 18px 50px;
  font-size: 1.3rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 32px rgba(78, 205, 196, 0.4);
}

.start-game-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 48px rgba(78, 205, 196, 0.6);
}

/* Navigation */
.tutorial-nav {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-btn {
  flex: 1;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid rgba(78, 205, 196, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #95e1d3;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4ecdc4;
  transform: translateY(-2px);
}

.nav-btn.primary {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  border: none;
}

.nav-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(78, 205, 196, 0.4);
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

/* Responsive */
@media (max-width: 768px) {
  .tutorial-content {
    padding: 40px 25px 30px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .page-text {
    font-size: 1rem;
  }

  .icon-large {
    font-size: 4rem;
  }

  .card-demo {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .demo-card {
    width: 200px;
  }

  .tutorial-nav {
    flex-direction: column;
  }

  .nav-btn {
    width: 100%;
  }
}
</style>
