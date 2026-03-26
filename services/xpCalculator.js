const pool = require('../db/connection');

const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  800,   // Level 5
  1200,  // Level 6
  1700,  // Level 7
  2300,  // Level 8
  3000,  // Level 9
  4000   // Level 10
];

function calculateLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function calculateComboScore(answers) {
  let totalScore = 0;
  let streak = 0;

  for (const answer of answers) {
    if (answer.correct) {
      streak++;
      let points = answer.points;
      if (streak >= 3) {
        points = Math.floor(points * 1.5);
      }
      totalScore += points;
    } else {
      streak = 0;
    }
  }

  return totalScore;
}

function calculateAccuracy(answers) {
  if (answers.length === 0) return 0;
  const correct = answers.filter(a => a.correct).length;
  return parseFloat(((correct / answers.length) * 100).toFixed(2));
}

async function updateUserXP(userId, xpToAdd) {
  const [users] = await pool.execute('SELECT xp FROM users WHERE id = ?', [userId]);
  if (users.length === 0) return;

  const newXP = users[0].xp + xpToAdd;
  const newLevel = calculateLevel(newXP);

  await pool.execute(
    'UPDATE users SET xp = ?, level = ?, last_active = NOW() WHERE id = ?',
    [newXP, newLevel, userId]
  );

  return { xp: newXP, level: newLevel };
}

module.exports = { calculateLevel, calculateComboScore, calculateAccuracy, updateUserXP, LEVEL_THRESHOLDS };
