const express = require('express');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all CVE labs (only for pentest users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [userRows] = await pool.execute('SELECT field FROM users WHERE id = ?', [req.user.id]);
    const userField = userRows[0]?.field || 'pentest';

    if (userField !== 'pentest') {
      return res.status(403).json({ error: 'CVE Labs yalnız Pentest sahəsi üçündür.' });
    }

    const [labs] = await pool.execute(
      'SELECT id, cve_id, name, category, lab_type, difficulty, cvss, affected_software, description_az, xp_reward FROM cve_labs WHERE is_active = TRUE ORDER BY cvss DESC'
    );

    // Get user progress
    const [progress] = await pool.execute(
      'SELECT cve_lab_id, status, current_step, score FROM user_cve_progress WHERE user_id = ?',
      [req.user.id]
    );

    const progressMap = {};
    progress.forEach(p => { progressMap[p.cve_lab_id] = p; });

    const result = labs.map(lab => ({
      ...lab,
      progress: progressMap[lab.id] || { status: 'available', current_step: 0, score: 0 }
    }));

    res.json({ labs: result });
  } catch (err) {
    console.error('Get CVE labs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single CVE lab detail
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [userRows] = await pool.execute('SELECT field FROM users WHERE id = ?', [req.user.id]);
    if (userRows[0]?.field !== 'pentest') {
      return res.status(403).json({ error: 'CVE Labs yalnız Pentest sahəsi üçündür.' });
    }

    const [labs] = await pool.execute('SELECT * FROM cve_labs WHERE id = ? AND is_active = TRUE', [req.params.id]);
    if (labs.length === 0) return res.status(404).json({ error: 'Lab tapılmadı' });

    const [progress] = await pool.execute(
      'SELECT * FROM user_cve_progress WHERE user_id = ? AND cve_lab_id = ?',
      [req.user.id, req.params.id]
    );

    res.json({ lab: labs[0], progress: progress[0] || null });
  } catch (err) {
    console.error('Get CVE lab error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start a CVE lab
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const labId = req.params.id;
    const userId = req.user.id;

    const [existing] = await pool.execute(
      'SELECT id FROM user_cve_progress WHERE user_id = ? AND cve_lab_id = ?',
      [userId, labId]
    );

    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO user_cve_progress (user_id, cve_lab_id, status, started_at) VALUES (?, ?, "in_progress", NOW())',
        [userId, labId]
      );
    } else {
      await pool.execute(
        'UPDATE user_cve_progress SET status = "in_progress", started_at = NOW() WHERE user_id = ? AND cve_lab_id = ?',
        [userId, labId]
      );
    }

    res.json({ message: 'Lab başladıldı' });
  } catch (err) {
    console.error('Start CVE lab error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit CVE lab step/answer
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { step, answer } = req.body;
    const labId = req.params.id;
    const userId = req.user.id;

    await pool.execute(
      'UPDATE user_cve_progress SET current_step = ?, answers = JSON_SET(COALESCE(answers, "{}"), CONCAT("$.step", ?), ?) WHERE user_id = ? AND cve_lab_id = ?',
      [step, step, answer, userId, labId]
    );

    res.json({ message: 'Addım qeydə alındı', step });
  } catch (err) {
    console.error('Submit CVE step error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete CVE lab
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const labId = req.params.id;
    const userId = req.user.id;

    const [lab] = await pool.execute('SELECT xp_reward FROM cve_labs WHERE id = ?', [labId]);
    const xpReward = lab[0]?.xp_reward || 50;

    await pool.execute(
      'UPDATE user_cve_progress SET status = "completed", score = ?, completed_at = NOW() WHERE user_id = ? AND cve_lab_id = ?',
      [xpReward, userId, labId]
    );

    // Add XP
    const { updateUserXP } = require('../services/xpCalculator');
    const xpResult = await updateUserXP(userId, xpReward);

    // Log
    await pool.execute(
      'INSERT INTO activity_log (user_id, action, metadata) VALUES (?, ?, ?)',
      [userId, 'cve_lab_complete', JSON.stringify({ labId, xpReward })]
    );

    res.json({ message: 'Lab tamamlandı!', xp: xpResult?.xp, level: xpResult?.level, xpReward });
  } catch (err) {
    console.error('Complete CVE lab error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
