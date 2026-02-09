<template>
  <div class="leaderboard">
    <div class="leaderboard-header">
      <h3>{{ t.leaderboard.title }}</h3>
      <button class="refresh-btn" @click="refresh" :disabled="loading">
        {{ loading ? '...' : 'REFRESH' }}
      </button>
    </div>

    <div v-if="loading" class="leaderboard-loading">
      {{ t.leaderboard.loading }}
    </div>

    <div v-else-if="error" class="leaderboard-error">
      {{ error }}
    </div>

    <div v-else-if="leaderboard.length === 0" class="leaderboard-empty">
      {{ t.leaderboard.empty }}
    </div>

    <div v-else class="leaderboard-list">
      <div
        v-for="(entry, index) in leaderboard"
        :key="entry.signature"
        class="leaderboard-item"
        :class="{ 'top-3': index < 3 }"
      >
        <span class="rank" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
        <span class="player">{{ formatAddress(entry.player) }}</span>
        <span class="score">${{ entry.score.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLeaderboard } from '../composables/useLeaderboard'

const props = defineProps({
  t: Object
})

const { leaderboard, loading, error, fetchLeaderboard, formatAddress } = useLeaderboard()

const refresh = () => {
  fetchLeaderboard()
}

onMounted(() => {
  fetchLeaderboard()
})
</script>

<style scoped>
.leaderboard {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  width: 100%;
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.leaderboard-header h3 {
  margin: 0;
  color: #4ecdc4;
  font-size: 1.2rem;
}

.refresh-btn {
  background: rgba(78, 205, 196, 0.2);
  border: 1px solid rgba(78, 205, 196, 0.4);
  color: #4ecdc4;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(78, 205, 196, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.leaderboard-loading,
.leaderboard-empty,
.leaderboard-error {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
}

.leaderboard-error {
  color: #ff6b6b;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s;
}

.leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.leaderboard-item.top-3 {
  background: rgba(78, 205, 196, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.2);
}

.rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #000;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #000;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #a0522d);
  color: #fff;
}

.player {
  flex: 1;
  color: rgba(255, 255, 255, 0.8);
  font-family: monospace;
}

.score {
  color: #4ecdc4;
  font-weight: bold;
}
</style>
