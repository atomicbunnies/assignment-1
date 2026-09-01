import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getOne, run } from '../db.js';
import { broadcastEvent } from '../index.js';

const router = express.Router();

// Helper to hydrate task with subtasks and tags
async function hydrateTasks(tasks) {
  if (!tasks || tasks.length === 0) return [];
  const taskIds = tasks.map(t => t.id);
  const placeholders = taskIds.map(() => '?').join(',');

  const subtasks = await query(
    `SELECT * FROM subtasks WHERE task_id IN (${placeholders}) ORDER BY order_index ASC`,
    taskIds
  );

  const tags = await query(
    `SELECT t.id, t.name, t.color, tt.task_id 
     FROM tags t 
     JOIN task_tags tt ON t.id = tt.tag_id 
     WHERE tt.task_id IN (${placeholders})`,
    taskIds
  );

  const subtaskMap = {};
  const tagMap = {};

  for (const s of subtasks) {
    if (!subtaskMap[s.task_id]) subtaskMap[s.task_id] = [];
    subtaskMap[s.task_id].push({
      ...s,
      is_completed: Boolean(s.is_completed)
    });
  }

  for (const tg of tags) {
    if (!tagMap[tg.task_id]) tagMap[tg.task_id] = [];
    tagMap[tg.task_id].push({ id: tg.id, name: tg.name, color: tg.color });
  }

  return tasks.map(task => ({
    ...task,
    is_pinned: Boolean(task.is_pinned),
    is_archived: Boolean(task.is_archived),
    is_deleted: Boolean(task.is_deleted),
    subtasks: subtaskMap[task.id] || [],
    tags: tagMap[task.id] || []
  }));
}

// Log activity helper
async function logActivity(taskId, taskTitle, action, details) {
  try {
    await run(
      `INSERT INTO activity_logs (id, task_id, task_title, action, details) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), taskId, taskTitle, action, details]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// GET /api/todos
router.get('/', async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      categoryId,
      tagId,
      isArchived,
      isDeleted,
      sortBy = 'order_index',
      sortOrder = 'ASC'
    } = req.query;

    let sql = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (isDeleted === 'true' || isDeleted === '1') {
      sql += ` AND t.is_deleted = 1`;
    } else {
      sql += ` AND t.is_deleted = 0`;
      if (isArchived === 'true' || isArchived === '1') {
        sql += ` AND t.is_archived = 1`;
      } else {
        sql += ` AND t.is_archived = 0`;
      }
    }

    if (status && status !== 'all') {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'all') {
      sql += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (categoryId && categoryId !== 'all') {
      sql += ` AND t.category_id = ?`;
      params.push(categoryId);
    }

    if (tagId && tagId !== 'all') {
      sql += ` AND t.id IN (SELECT task_id FROM task_tags WHERE tag_id = ?)`;
      params.push(tagId);
    }

    if (search && search.trim() !== '') {
      sql += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    // Sort column sanitization
    const validSortCols = ['order_index', 'due_date', 'priority', 'created_at', 'title'];
    const safeSortCol = validSortCols.includes(sortBy) ? sortBy : 'order_index';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY t.is_pinned DESC, ${safeSortCol} ${safeSortOrder}, t.created_at DESC`;

    const rawTasks = await query(sql, params);
    const tasks = await hydrateTasks(rawTasks);

    res.json({ success: true, tasks, count: tasks.length });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/todos/:id
router.get('/:id', async (req, res) => {
  try {
    const rawTask = await getOne(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (!rawTask) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const [task] = await hydrateTasks([rawTask]);
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description = '',
      priority = 'medium',
      status = 'todo',
      category_id = null,
      due_date = null,
      estimated_minutes = 0,
      subtasks = [],
      tags = [],
      is_pinned = 0
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const taskId = `task-${uuidv4().slice(0, 8)}`;
    const maxOrderRow = await getOne('SELECT MAX(order_index) as max_order FROM tasks');
    const orderIndex = (maxOrderRow?.max_order || 0) + 1000;

    await run(
      `INSERT INTO tasks (
        id, title, description, priority, status, category_id, due_date, 
        estimated_minutes, order_index, is_pinned, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        taskId, title.trim(), description.trim(), priority, status,
        category_id || null, due_date || null, estimated_minutes || 0,
        orderIndex, is_pinned ? 1 : 0
      ]
    );

    // Insert subtasks
    if (Array.isArray(subtasks)) {
      for (let i = 0; i < subtasks.length; i++) {
        const sub = subtasks[i];
        if (sub.title && sub.title.trim()) {
          const subId = sub.id || `sub-${uuidv4().slice(0, 8)}`;
          await run(
            `INSERT INTO subtasks (id, task_id, title, is_completed, order_index) VALUES (?, ?, ?, ?, ?)`,
            [subId, taskId, sub.title.trim(), sub.is_completed ? 1 : 0, i]
          );
        }
      }
    }

    // Insert tags
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        const tagId = typeof tag === 'string' ? tag : tag.id;
        if (tagId) {
          await run(`INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`, [taskId, tagId]);
        }
      }
    }

    await logActivity(taskId, title.trim(), 'CREATED', `Created task with priority ${priority}`);

    const rawCreated = await getOne(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [taskId]
    );
    const [createdTask] = await hydrateTasks([rawCreated]);

    broadcastEvent({ type: 'TASK_CREATED', task: createdTask });
    res.status(201).json({ success: true, task: createdTask });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/todos/:id
router.put('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const {
      title,
      description = '',
      priority = 'medium',
      status = 'todo',
      category_id = null,
      due_date = null,
      estimated_minutes = 0,
      time_spent_minutes = 0,
      is_pinned = 0,
      subtasks = [],
      tags = []
    } = req.body;

    const existing = await getOne('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const completedAt = status === 'completed'
      ? (existing.completed_at || new Date().toISOString())
      : null;

    await run(
      `UPDATE tasks SET 
        title = ?, description = ?, priority = ?, status = ?, category_id = ?,
        due_date = ?, estimated_minutes = ?, time_spent_minutes = ?, is_pinned = ?,
        updated_at = CURRENT_TIMESTAMP, completed_at = ?
      WHERE id = ?`,
      [
        title.trim(), description.trim(), priority, status, category_id || null,
        due_date || null, estimated_minutes, time_spent_minutes, is_pinned ? 1 : 0,
        completedAt, taskId
      ]
    );

    // Sync subtasks
    await run('DELETE FROM subtasks WHERE task_id = ?', [taskId]);
    if (Array.isArray(subtasks)) {
      for (let i = 0; i < subtasks.length; i++) {
        const sub = subtasks[i];
        if (sub.title && sub.title.trim()) {
          const subId = sub.id || `sub-${uuidv4().slice(0, 8)}`;
          await run(
            `INSERT INTO subtasks (id, task_id, title, is_completed, order_index) VALUES (?, ?, ?, ?, ?)`,
            [subId, taskId, sub.title.trim(), sub.is_completed ? 1 : 0, i]
          );
        }
      }
    }

    // Sync tags
    await run('DELETE FROM task_tags WHERE task_id = ?', [taskId]);
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        const tagId = typeof tag === 'string' ? tag : tag.id;
        if (tagId) {
          await run(`INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`, [taskId, tagId]);
        }
      }
    }

    await logActivity(taskId, title.trim(), 'UPDATED', `Updated task details`);

    const rawUpdated = await getOne(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [taskId]
    );
    const [updatedTask] = await hydrateTasks([rawUpdated]);

    broadcastEvent({ type: 'TASK_UPDATED', task: updatedTask });
    res.json({ success: true, task: updatedTask });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/todos/:id
router.patch('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const existing = await getOne('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const updates = [];
    const params = [];
    const body = req.body;

    if (body.title !== undefined) {
      updates.push('title = ?');
      params.push(body.title.trim());
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      params.push(body.description.trim());
    }
    if (body.priority !== undefined) {
      updates.push('priority = ?');
      params.push(body.priority);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      params.push(body.status);
      if (body.status === 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      } else {
        updates.push('completed_at = NULL');
      }
    }
    if (body.category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(body.category_id || null);
    }
    if (body.due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(body.due_date || null);
    }
    if (body.is_pinned !== undefined) {
      updates.push('is_pinned = ?');
      params.push(body.is_pinned ? 1 : 0);
    }
    if (body.is_archived !== undefined) {
      updates.push('is_archived = ?');
      params.push(body.is_archived ? 1 : 0);
    }
    if (body.is_deleted !== undefined) {
      updates.push('is_deleted = ?');
      params.push(body.is_deleted ? 1 : 0);
    }
    if (body.time_spent_minutes !== undefined) {
      updates.push('time_spent_minutes = ?');
      params.push(body.time_spent_minutes);
    }
    if (body.order_index !== undefined) {
      updates.push('order_index = ?');
      params.push(body.order_index);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(taskId);
      await run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Toggle subtask if provided
    if (body.toggleSubtaskId !== undefined) {
      const sub = await getOne('SELECT * FROM subtasks WHERE id = ? AND task_id = ?', [
        body.toggleSubtaskId, taskId
      ]);
      if (sub) {
        await run('UPDATE subtasks SET is_completed = ? WHERE id = ?', [
          sub.is_completed ? 0 : 1, sub.id
        ]);
      }
    }

    const actionText = body.status === 'completed'
      ? 'COMPLETED'
      : (body.is_deleted ? 'DELETED' : (body.is_archived ? 'ARCHIVED' : 'UPDATED'));

    await logActivity(taskId, existing.title, actionText, `Patched properties: ${Object.keys(body).join(', ')}`);

    const rawUpdated = await getOne(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [taskId]
    );
    const [updatedTask] = await hydrateTasks([rawUpdated]);

    broadcastEvent({ type: 'TASK_UPDATED', task: updatedTask });
    res.json({ success: true, task: updatedTask });
  } catch (err) {
    console.error('Error patching task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const permanent = req.query.permanent === 'true';

    const existing = await getOne('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    if (permanent || existing.is_deleted === 1) {
      // Hard delete
      await run('DELETE FROM tasks WHERE id = ?', [taskId]);
      await logActivity(taskId, existing.title, 'PERMANENT_DELETED', 'Permanently removed task');
      broadcastEvent({ type: 'TASK_PERMANENTLY_DELETED', taskId });
      return res.json({ success: true, message: 'Task permanently deleted' });
    } else {
      // Soft delete
      await run('UPDATE tasks SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [taskId]);
      await logActivity(taskId, existing.title, 'MOVED_TO_TRASH', 'Moved task to trash bin');
      broadcastEvent({ type: 'TASK_TRASHED', taskId });
      return res.json({ success: true, message: 'Task moved to trash' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos/batch
router.post('/batch', async (req, res) => {
  try {
    const { action, taskIds, value } = req.body;
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ success: false, error: 'taskIds must be a non-empty array' });
    }

    const placeholders = taskIds.map(() => '?').join(',');

    switch (action) {
      case 'complete':
        await run(
          `UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          taskIds
        );
        break;
      case 'incomplete':
        await run(
          `UPDATE tasks SET status = 'todo', completed_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          taskIds
        );
        break;
      case 'delete':
        await run(
          `UPDATE tasks SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          taskIds
        );
        break;
      case 'restore':
        await run(
          `UPDATE tasks SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          taskIds
        );
        break;
      case 'permanent_delete':
        await run(`DELETE FROM tasks WHERE id IN (${placeholders})`, taskIds);
        break;
      case 'archive':
        await run(
          `UPDATE tasks SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          taskIds
        );
        break;
      case 'unarchive':
        await run(
          `UPDATE tasks SET is_archived = 0, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          taskIds
        );
        break;
      case 'set_priority':
        if (['low', 'medium', 'high', 'urgent'].includes(value)) {
          await run(
            `UPDATE tasks SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [value, ...taskIds]
          );
        }
        break;
      case 'set_category':
        await run(
          `UPDATE tasks SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          [value || null, ...taskIds]
        );
        break;
      default:
        return res.status(400).json({ success: false, error: `Unknown batch action: ${action}` });
    }

    await logActivity(null, 'Batch Action', 'BATCH_OPERATION', `Applied ${action} to ${taskIds.length} tasks`);
    broadcastEvent({ type: 'BATCH_ACTION_COMPLETED', action, count: taskIds.length });
    res.json({ success: true, message: `Batch ${action} completed on ${taskIds.length} tasks` });
  } catch (err) {
    console.error('Error in batch operation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos/reorder
router.post('/reorder', async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order_index, status }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'items array is required' });
    }

    for (const item of items) {
      if (item.status) {
        const completedAt = item.status === 'completed' ? new Date().toISOString() : null;
        await run(
          `UPDATE tasks SET order_index = ?, status = ?, completed_at = CASE WHEN ? = 'completed' THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE NULL END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [item.order_index, item.status, item.status, item.id]
        );
      } else {
        await run(
          `UPDATE tasks SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [item.order_index, item.id]
        );
      }
    }

    broadcastEvent({ type: 'TASKS_REORDERED' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
