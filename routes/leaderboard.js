const express = require('express');
const pool = require('../db/connection');

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { filter } = req.query; // 'all', 'week', or chapter number

    let query, params = [];

    if (filter === 'week') {
      query = `
        SELECT u.id, u.full_name, u.username, u.xp, u.level, u.student_group, u.field, u.avatar_seed,
          (SELECT COUNT(*) FROM user_cards uc WHERE uc.user_id = u.id) as cards_count,
          (SELECT COALESCE(AVG(accuracy), 0) FROM user_chapter_progress ucp WHERE ucp.user_id = u.id AND ucp.status IN ('completed','approved')) as avg_accuracy
        FROM users u
        WHERE u.role = 'student' AND u.last_active >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY u.xp DESC
        LIMIT 100`;
    } else if (filter && !isNaN(filter)) {
      query = `
        SELECT u.id, u.full_name, u.username, u.xp, u.level, u.student_group, u.field, u.avatar_seed,
          ucp.score as chapter_score, ucp.accuracy as chapter_accuracy,
          (SELECT COUNT(*) FROM user_cards uc WHERE uc.user_id = u.id) as cards_count
        FROM users u
        JOIN user_chapter_progress ucp ON ucp.user_id = u.id
        WHERE u.role = 'student' AND ucp.chapter_id = ? AND ucp.status IN ('completed','approved')
        ORDER BY ucp.score DESC
        LIMIT 100`;
      params = [parseInt(filter)];
    } else {
      query = `
        SELECT u.id, u.full_name, u.username, u.xp, u.level, u.student_group, u.field, u.avatar_seed,
          (SELECT COUNT(*) FROM user_cards uc WHERE uc.user_id = u.id) as cards_count,
          (SELECT COALESCE(AVG(accuracy), 0) FROM user_chapter_progress ucp WHERE ucp.user_id = u.id AND ucp.status IN ('completed','approved')) as avg_accuracy
        FROM users u
        WHERE u.role = 'student'
        ORDER BY u.xp DESC
        LIMIT 100`;
    }

    const [rankings] = await pool.execute(query, params);

    // Add rank numbers
    rankings.forEach((r, i) => { r.rank = i + 1; });

    res.json({ rankings });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
