import express from 'express';
import { query, run } from '../db.js';

const router = express.Router();

// GET /api/activity
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const logs = await query(
      `SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/activity
router.delete('/', async (req, res) => {
  try {
    await run(`DELETE FROM activity_logs`);
    res.json({ success: true, message: 'Activity log cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
