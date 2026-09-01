import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getOne, run } from '../db.js';
import { broadcastEvent } from '../index.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await query(
      `SELECT c.*, COUNT(t.id) as task_count 
       FROM categories c 
       LEFT JOIN tasks t ON c.id = t.category_id AND t.is_deleted = 0
       GROUP BY c.id 
       ORDER BY c.created_at ASC`
    );
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, icon = 'Folder', color = '#6366f1' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const id = `cat-${uuidv4().slice(0, 8)}`;
    await run('INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)', [
      id, name.trim(), icon, color
    ]);

    const created = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
    broadcastEvent({ type: 'CATEGORIES_UPDATED' });
    res.status(201).json({ success: true, category: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    broadcastEvent({ type: 'CATEGORIES_UPDATED' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tags
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await query(
      `SELECT t.*, COUNT(tt.task_id) as task_count 
       FROM tags t 
       LEFT JOIN task_tags tt ON t.id = tt.tag_id 
       GROUP BY t.id 
       ORDER BY t.name ASC`
    );
    res.json({ success: true, tags });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tags
router.post('/tags', async (req, res) => {
  try {
    const { name, color = '#3b82f6' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Tag name is required' });
    }

    const cleanName = name.trim().toLowerCase().replace(/^#/, '');
    const id = `tag-${uuidv4().slice(0, 8)}`;
    
    await run('INSERT INTO tags (id, name, color) VALUES (?, ?, ?)', [
      id, cleanName, color
    ]);

    const created = await getOne('SELECT * FROM tags WHERE id = ?', [id]);
    broadcastEvent({ type: 'TAGS_UPDATED' });
    res.status(201).json({ success: true, tag: created });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      const existing = await getOne('SELECT * FROM tags WHERE name = ?', [req.body.name.trim().toLowerCase().replace(/^#/, '')]);
      return res.json({ success: true, tag: existing });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/tags/:id
router.delete('/tags/:id', async (req, res) => {
  try {
    await run('DELETE FROM tags WHERE id = ?', [req.params.id]);
    broadcastEvent({ type: 'TAGS_UPDATED' });
    res.json({ success: true, message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
