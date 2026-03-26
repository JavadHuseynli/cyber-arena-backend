const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, full_name, username, email, role, xp, level, streak_days, student_group, field, avatar_seed, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: users[0] });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { full_name, email, student_group, field } = req.body;
    const updates = [];
    const params = [];

    if (full_name) { updates.push('full_name = ?'); params.push(full_name); }
    if (email) { updates.push('email = ?'); params.push(email); }
    if (student_group !== undefined) { updates.push('student_group = ?'); params.push(student_group); }
    if (field && ['pentest', 'reverse'].includes(field)) { updates.push('field = ?'); params.push(field); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    params.push(req.user.id);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload avatar - accepts base64 image
router.post('/avatar', authMiddleware, async (req, res) => {
  try {
    const { image } = req.body; // base64 string
    if (!image) return res.status(400).json({ error: 'No image provided' });

    // Extract base64 data
    const matches = image.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'Invalid image format' });

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = Buffer.from(matches[2], 'base64');

    // Max 2MB
    if (data.length > 2 * 1024 * 1024) return res.status(400).json({ error: 'Image too large (max 2MB)' });

    const filename = `avatar_${req.user.id}_${Date.now()}.${ext}`;
    const uploadDir = path.join(__dirname, '../../frontend/public/uploads');

    // Ensure dir exists
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    fs.writeFileSync(path.join(uploadDir, filename), data);

    const avatarUrl = `/uploads/${filename}`;
    await pool.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);

    res.json({ message: 'Avatar uploaded', avatar_url: avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
