// 测试时间戳转换
const timestamps = [
  1778362343035,
  1778362304572, 
  1778039021077,
  1778039018302,
  1778039010024,
  1778039004891
];

console.log('=== 时间戳分析 ===');
timestamps.forEach(ts => {
  const date = new Date(ts);
  console.log(`时间戳 ${ts}:`);
  console.log(`  - UTC: ${date.toISOString()}`);
  console.log(`  - 本地: ${date.toString()}`);
  console.log(`  - 小时: ${date.getHours()}`);
  console.log(`  - UTC小时: ${date.getUTCHours()}`);
  console.log('');
});

console.log('=== 用户期望 ===');
console.log('2026-05-06 11 点: 4条');
console.log('2026-05-10 05 点: 3条');
