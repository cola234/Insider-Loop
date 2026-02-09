const { config, cards } = require('./src/gameData.js');

const weekRedScales = [0.60, 0.70, 0.80, 0.88];
const weekGreenScales = [1.35, 1.25, 1.15, 1.08];
const weekColorWeights = [
  { green: 1.08, red: 0.92 },
  { green: 1.04, red: 0.96 },
  { green: 1.00, red: 1.00 },
  { green: 0.96, red: 1.04 },
];

const SIMS = 10000;

function weightedPick(pool, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function simWeek(weekIndex) {
  const redScale = weekRedScales[weekIndex];
  const greenScale = weekGreenScales[weekIndex];
  const colorWeight = weekColorWeights[weekIndex];
  const results = [];

  for (let sim = 0; sim < SIMS; sim++) {
    let cash = config.startingCash;
    let price = config.startingPrice;

    for (let day = 0; day < config.daysPerWeek; day++) {
      const dayStart = price;

      // 抽10张牌（使用权重）
      const pool = [...cards];
      const dayCards = [];
      for (let c = 0; c < config.cardsPerDay; c++) {
        const weights = pool.map(card => {
          const cardWeight = card.weight || 1.0;
          const cw = colorWeight[card.color] || 1.0;
          return cardWeight * cw;
        });
        const picked = weightedPick(pool, weights);
        dayCards.push(picked);
        const idx = pool.indexOf(picked);
        if (idx > -1) pool.splice(idx, 1);
      }

      // 执行卡牌
      for (const card of dayCards) {
        let pct = (card.min + card.max) / 2;
        if (card.color === 'red' && pct < 0) pct *= redScale;
        if (card.color === 'green' && pct > 0) pct *= greenScale;
        price = Math.max(1, price * (1 + pct / 100));
      }

      // 日终结算
      const shares = Math.floor(cash / dayStart);
      cash = cash - shares * dayStart + shares * price;
    }
    results.push(cash);
  }

  results.sort((a, b) => a - b);
  const target = config.weekTargets[weekIndex];
  const passRate = results.filter(c => c >= target).length / SIMS;
  const median = results[Math.floor(SIMS / 2)];
  const avg = results.reduce((a, b) => a + b, 0) / SIMS;
  const p25 = results[Math.floor(SIMS * 0.25)];
  const p75 = results[Math.floor(SIMS * 0.75)];

  return { target, passRate, median, avg, p25, p75 };
}

console.log('=== 新数值模拟结果 ===\n');
let totalPass = 1;

for (let w = 0; w < 4; w++) {
  const r = simWeek(w);
  totalPass *= r.passRate;
  console.log(`Week${w + 1}:`);
  console.log(`  目标: ${r.target}`);
  console.log(`  通过率: ${(r.passRate * 100).toFixed(1)}%`);
  console.log(`  中位数: ${r.median.toFixed(0)}`);
  console.log(`  25%-75%: ${r.p25.toFixed(0)} ~ ${r.p75.toFixed(0)}`);
  console.log('');
}

console.log(`连续4周通关率: ${(totalPass * 100).toFixed(1)}%`);
