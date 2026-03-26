const express = require('express');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { generateAndStoreQuestions } = require('../services/claudeAI');

const router = express.Router();

router.use(authMiddleware, adminOnly);

// Get all students
router.get('/students', async (req, res) => {
  try {
    const { search, group } = req.query;
    let query = `SELECT id, full_name, username, email, xp, level, streak_days, student_group, field, last_active, created_at FROM users WHERE role = 'student'`;
    const params = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR username LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (group) {
      query += ' AND student_group = ?';
      params.push(group);
    }
    query += ' ORDER BY xp DESC';

    const [students] = await pool.execute(query, params);

    // Get progress for each student
    for (const student of students) {
      const [progress] = await pool.execute(
        `SELECT ucp.*, c.number, c.title_az
         FROM user_chapter_progress ucp
         JOIN chapters c ON c.id = ucp.chapter_id
         WHERE ucp.user_id = ?
         ORDER BY c.number`,
        [student.id]
      );
      student.chapters = progress;
    }

    res.json({ students });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single student details
router.get('/students/:id', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, full_name, username, email, xp, level, streak_days, student_group, last_active, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'Student not found' });

    const [progress] = await pool.execute(
      `SELECT ucp.*, c.number, c.title_az FROM user_chapter_progress ucp
       JOIN chapters c ON c.id = ucp.chapter_id WHERE ucp.user_id = ? ORDER BY c.number`,
      [req.params.id]
    );

    const [sessions] = await pool.execute(
      `SELECT qs.*, c.title_az FROM quiz_sessions qs
       JOIN chapters c ON c.id = qs.chapter_id WHERE qs.user_id = ? ORDER BY qs.started_at DESC`,
      [req.params.id]
    );

    const [cards] = await pool.execute(
      'SELECT * FROM user_cards WHERE user_id = ?',
      [req.params.id]
    );

    res.json({ student: users[0], progress, sessions, cards });
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending approvals
router.get('/approvals', async (req, res) => {
  try {
    const [pending] = await pool.execute(
      `SELECT ucp.*, u.full_name, u.username, u.student_group, c.number, c.title_az
       FROM user_chapter_progress ucp
       JOIN users u ON u.id = ucp.user_id
       JOIN chapters c ON c.id = ucp.chapter_id
       WHERE ucp.status = 'completed'
       ORDER BY ucp.completed_at DESC`
    );
    res.json({ approvals: pending });
  } catch (err) {
    console.error('Get approvals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve a chapter for a student
router.post('/approve', async (req, res) => {
  try {
    const { userId, chapterId } = req.body;

    await pool.execute(
      `UPDATE user_chapter_progress SET status = 'approved', approved_at = NOW(), approved_by = ?
       WHERE user_id = ? AND chapter_id = ?`,
      [req.user.id, userId, chapterId]
    );

    // Unlock next chapter (same field only)
    const [currentChapterRow] = await pool.execute('SELECT id, number, field FROM chapters WHERE id = ?', [chapterId]);
    const currentChapter = currentChapterRow[0];
    if (currentChapter) {
      const [nextChapterRow] = await pool.execute(
        'SELECT id, number FROM chapters WHERE number = ? AND field = ?',
        [currentChapter.number + 1, currentChapter.field]
      );
      if (nextChapterRow.length > 0) {
        await pool.execute(
          `UPDATE user_chapter_progress SET status = 'available'
           WHERE user_id = ? AND chapter_id = ? AND status = 'locked'`,
          [userId, nextChapterRow[0].id]
        );
      }
    }

    // Notify via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('chapter:approved', {
        userId,
        chapterId,
        message: `Fəsil ${currentChapter?.number} təsdiqləndi! Növbəti fəsil açıldı.`
      });
    }

    res.json({ message: 'Chapter approved successfully' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Batch approve
router.post('/approve-batch', async (req, res) => {
  try {
    const { approvals } = req.body; // [{ userId, chapterId }, ...]

    for (const { userId, chapterId } of approvals) {
      await pool.execute(
        `UPDATE user_chapter_progress SET status = 'approved', approved_at = NOW(), approved_by = ?
         WHERE user_id = ? AND chapter_id = ?`,
        [req.user.id, userId, chapterId]
      );

      const [currentChapterRow] = await pool.execute('SELECT id, number, field FROM chapters WHERE id = ?', [chapterId]);
      const currentChapter = currentChapterRow[0];
      if (currentChapter) {
        const [nextChapterRow] = await pool.execute(
          'SELECT id, number FROM chapters WHERE number = ? AND field = ?',
          [currentChapter.number + 1, currentChapter.field]
        );
        if (nextChapterRow.length > 0) {
          await pool.execute(
            `UPDATE user_chapter_progress SET status = 'available'
             WHERE user_id = ? AND chapter_id = ? AND status = 'locked'`,
            [userId, nextChapterRow[0].id]
          );
        }
      }

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${userId}`).emit('chapter:approved', {
          userId, chapterId,
          message: `Fəsil ${currentChapter?.number} təsdiqləndi!`
        });
      }
    }

    res.json({ message: `${approvals.length} chapters approved` });
  } catch (err) {
    console.error('Batch approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject chapter
router.post('/reject', async (req, res) => {
  try {
    const { userId, chapterId } = req.body;

    await pool.execute(
      `UPDATE user_chapter_progress SET status = 'available', attempts = GREATEST(attempts - 1, 0)
       WHERE user_id = ? AND chapter_id = ?`,
      [userId, chapterId]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('chapter:rejected', {
        userId, chapterId,
        message: 'Fəsil rədd edildi. Yenidən cəhd edin.'
      });
    }

    res.json({ message: 'Chapter rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate questions for a chapter
router.post('/generate-questions', async (req, res) => {
  try {
    const { chapterId } = req.body;

    // Get chapter's field and number for context lookup
    const [chapterRow] = await pool.execute('SELECT number, field FROM chapters WHERE id = ?', [chapterId]);
    if (chapterRow.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    const { number: chapterNumber, field } = chapterRow[0];

    const questions = await generateAndStoreQuestions(chapterId, field, chapterNumber);
    res.json({ message: 'Questions generated successfully', count: questions.length });
  } catch (err) {
    console.error('Generate questions error:', err);
    res.status(500).json({ error: 'Failed to generate questions: ' + err.message });
  }
});

// Get questions for a chapter (admin view)
router.get('/questions/:chapterId', async (req, res) => {
  try {
    const [questions] = await pool.execute(
      'SELECT * FROM questions WHERE chapter_id = ? AND is_active = TRUE ORDER BY difficulty, id',
      [req.params.chapterId]
    );
    res.json({ questions });
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a question
router.put('/questions/:id', async (req, res) => {
  try {
    const { question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty } = req.body;
    const points = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;

    await pool.execute(
      `UPDATE questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?,
       correct_option = ?, explanation = ?, difficulty = ?, points = ? WHERE id = ?`,
      [question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, points, req.params.id]
    );
    res.json({ message: 'Question updated' });
  } catch (err) {
    console.error('Update question error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Adjust student XP
router.post('/adjust-xp', async (req, res) => {
  try {
    const { userId, xpChange, reason } = req.body;
    const [users] = await pool.execute('SELECT xp FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const newXP = Math.max(0, users[0].xp + xpChange);
    const { calculateLevel } = require('../services/xpCalculator');
    const newLevel = calculateLevel(newXP);

    await pool.execute('UPDATE users SET xp = ?, level = ? WHERE id = ?', [newXP, newLevel, userId]);

    await pool.execute(
      'INSERT INTO activity_log (user_id, action, metadata) VALUES (?, ?, ?)',
      [userId, 'xp_adjusted', JSON.stringify({ change: xpChange, reason, by: req.user.id })]
    );

    res.json({ message: 'XP adjusted', newXP, newLevel });
  } catch (err) {
    console.error('Adjust XP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activity log
router.get('/activity', async (req, res) => {
  try {
    const [logs] = await pool.execute(
      `SELECT al.*, u.full_name, u.username
       FROM activity_log al JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC LIMIT 100`
    );
    res.json({ activity: logs });
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.execute("SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'");
    const [[{ pendingApprovals }]] = await pool.execute("SELECT COUNT(*) as pendingApprovals FROM user_chapter_progress WHERE status = 'completed'");
    const [[{ totalQuizzes }]] = await pool.execute("SELECT COUNT(*) as totalQuizzes FROM quiz_sessions");
    const [[{ avgAccuracy }]] = await pool.execute("SELECT COALESCE(AVG(accuracy), 0) as avgAccuracy FROM user_chapter_progress WHERE status IN ('completed', 'approved')");

    res.json({ totalStudents, pendingApprovals, totalQuizzes, avgAccuracy: parseFloat(avgAccuracy).toFixed(1) });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
