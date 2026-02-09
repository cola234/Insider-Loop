const { config, cards } = require('./src/gameData.js');

const weekRedScales = [0.75, 0.75, 0.75, 0.75];
const weekGreenScales = [1.20, 1.20, 1.20, 1.20];
const weekColorWeights = [
  { green: 1.00, red: 1.00 },
  { green: 1.00, red: 1.00 },
  { green: 1.00, red: 1.00 },
  { green: 1.00, red: 1.00 },
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

      for (const card of dayCards) {
        let pct = (card.min + card.max) / 2;
        if (card.color === 'red' && pct < 0) pct *= redScale;
        if (card.color === 'green' && pct > 0) pct *= greenScale;
        price = Math.max(1, price * (1 + pct / 100));
      }

      const shares = Math.floor(cash / dayStart);
      cash = cash - shares * dayStart + shares * price;
    }
    results.push(cash);
  }

  results.sort((a, b) => a - b);
  return {
    results: results,
    median: results[Math.floor(SIMS / 2)],
    p25: results[Math.floor(SIMS * 0.25)],
    p75: results[Math.floor(SIMS * 0.75)],
  };
}

const targets = [1400, 1600, 1800, 2000];

console.log('=== Week Pass Rate Analysis ===\n');

let totalPass = 1;
for (let w = 0; w < 4; w++) {
  const r = simWeek(w);
  const target = targets[w];
  const passRate = r.results.filter(c => c >= target).length / SIMS;
  totalPass *= passRate;
  console.log(`Week ${w + 1} (Target: ${target}):`);
  console.log(`  Pass Rate: ${(passRate * 100).toFixed(1)}%`);
  console.log(`  Median: ${r.median.toFixed(0)}`);
  console.log(`  25%-75%: ${r.p25.toFixed(0)} ~ ${r.p75.toFixed(0)}`);
  console.log('');
}

console.log(`Overall 4-Week Pass Rate: ${(totalPass * 100).toFixed(1)}%`);
