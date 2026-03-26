const express = require('express');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user's cards
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [cards] = await pool.execute(
      `SELECT uc.*, c.number as chapter_number
       FROM user_cards uc
       JOIN chapters c ON c.id = uc.chapter_id
       WHERE uc.user_id = ?
       ORDER BY c.number`,
      [req.user.id]
    );
    res.json({ cards });
  } catch (err) {
    console.error('Get cards error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
