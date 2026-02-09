const { cards } = require('./src/gameData.js');

const stats = {};
cards.forEach(c => {
  const key = c.color + '-' + c.attr;
  if (!stats[key]) stats[key] = { count: 0, sum: 0 };
  stats[key].count++;
  stats[key].sum += Math.abs((c.min + c.max) / 2);
});

console.log('=== 属性分布分析 ===\n');
console.log('属性    | 绿卡数 | 绿卡均值 | 红卡数 | 红卡均值');
console.log('-'.repeat(50));

['bull', 'bear', 'monkey'].forEach(attr => {
  const g = stats['green-' + attr] || { count: 0, sum: 0 };
  const r = stats['red-' + attr] || { count: 0, sum: 0 };
  const gAvg = g.count ? (g.sum / g.count).toFixed(1) : '-';
  const rAvg = r.count ? (r.sum / r.count).toFixed(1) : '-';
  console.log(`${attr.padEnd(7)} | ${String(g.count).padStart(6)} | ${gAvg.padStart(8)} | ${String(r.count).padStart(6)} | ${rAvg.padStart(8)}`);
});

// 特效分布
console.log('\n=== 特效分布分析 ===\n');
const specialStats = {};
cards.forEach(c => {
  if (!specialStats[c.special]) specialStats[c.special] = { green: 0, red: 0 };
  specialStats[c.special][c.color]++;
});

console.log('特效        | 绿卡 | 红卡 | 总计');
console.log('-'.repeat(40));
Object.keys(specialStats).sort().forEach(sp => {
  const s = specialStats[sp];
  console.log(`${sp.padEnd(11)} | ${String(s.green).padStart(4)} | ${String(s.red).padStart(4)} | ${String(s.green + s.red).padStart(4)}`);
});
