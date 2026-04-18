export function estimateGrades(points, isAsLevel = false) {
  if (!points) return '';
  if (isAsLevel) {
    // AS level points: a=10, b=5, c=something?
    const aCount = Math.floor(points / 10);
    const bCount = Math.floor((points % 10) / 5);
    let str = [];
    if (aCount > 0) str.push(`${aCount}a`);
    if (bCount > 0) str.push(`${bCount}b`);
    return str.join(', ') || `${points} pts`;
  } else {
    // O level points: A*=10, A=7
    // Let's find best combination of 10 and 7 that's <= points
    // Maximize A* first? Not always, but let's try.
    // e.g. 71 points -> 8 subjects: 5A* (50) + 3A (21) = 71
    let bestAStar = 0;
    let MathAbsDiff = Infinity;
    let bA = 0;

    for (let aStar = Math.floor(points / 10); aStar >= 0; aStar--) {
      let rem = points - (aStar * 10);
      let a = Math.floor(rem / 7);
      let diff = points - (aStar * 10 + a * 7);
      if (diff < MathAbsDiff) {
        MathAbsDiff = diff;
        bestAStar = aStar;
        bA = a;
      }
      if (diff === 0) break;
    }
    
    let str = [];
    if (bestAStar > 0) str.push(`${bestAStar}A*`);
    if (bA > 0) str.push(`${bA}A`);
    return str.length > 0 ? str.join(' ') : `${points} pts`;
  }
}
