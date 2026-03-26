const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('student_group').trim().notEmpty().withMessage('Student group is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, username, email, password, student_group, field } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const avatar_seed = username + Date.now();

    const userField = (field === 'reverse') ? 'reverse' : 'pentest';
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, username, email, password_hash, student_group, field, avatar_seed) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, username, email, password_hash, student_group, userField, avatar_seed]
    );

    const userId = result.insertId;

    // Initialize chapter progress: only chapters matching user's field
    const [chapters] = await pool.execute(
      'SELECT id, number FROM chapters WHERE field = ? ORDER BY number',
      [userField]
    );
    for (const chapter of chapters) {
      const status = chapter.number === 1 ? 'available' : 'locked';
      await pool.execute(
        'INSERT INTO user_chapter_progress (user_id, chapter_id, status) VALUES (?, ?, ?)',
        [userId, chapter.id, status]
      );
    }

    const token = jwt.sign(
      { id: userId, username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: userId, username, full_name, role: 'student' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const [users] = await pool.execute(
      'SELECT id, username, full_name, password_hash, role, field FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last active
    await pool.execute('UPDATE users SET last_active = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, full_name, username, email, role, xp, level, streak_days, student_group, field, avatar_seed, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: users[0] });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
