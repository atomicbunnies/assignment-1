import express from 'express';
import { query, getOne } from '../db.js';

const router = express.Router();

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    // 1. Overall counts
    const totalRow = await getOne(`SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0`);
    const completedRow = await getOne(`SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0 AND status = 'completed'`);
    const inProgressRow = await getOne(`SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0 AND status = 'in_progress'`);
    const todoRow = await getOne(`SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0 AND status = 'todo'`);
    const reviewRow = await getOne(`SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0 AND status = 'review'`);
    const overdueRow = await getOne(`SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0 AND status != 'completed' AND due_date < date('now') AND due_date IS NOT NULL`);
    const timeSpentRow = await getOne(`SELECT SUM(time_spent_minutes) as total_time FROM tasks WHERE is_deleted = 0`);

    const total = totalRow?.count || 0;
    const completed = completedRow?.count || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 2. By Priority
    const priorityBreakdown = await query(`
      SELECT 
        priority,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tasks
      WHERE is_deleted = 0
      GROUP BY priority
    `);

    // 3. By Category
    const categoryBreakdown = await query(`
      SELECT 
        COALESCE(c.name, 'Uncategorized') as name,
        COALESCE(c.color, '#94a3b8') as color,
        COALESCE(c.icon, 'Folder') as icon,
        COUNT(t.id) as count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.is_deleted = 0
      GROUP BY c.id
    `);

    // 4. 30-Day Activity & Completed Heatmap
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push(dateStr);
    }

    const placeholders = days.map(() => '?').join(',');
    const dailyCompleted = await query(
      `SELECT date(completed_at) as day, COUNT(*) as count 
       FROM tasks 
       WHERE completed_at IS NOT NULL AND date(completed_at) IN (${placeholders})
       GROUP BY date(completed_at)`,
      days
    );

    const dailyCreated = await query(
      `SELECT date(created_at) as day, COUNT(*) as count 
       FROM tasks 
       WHERE is_deleted = 0 AND date(created_at) IN (${placeholders})
       GROUP BY date(created_at)`,
      days
    );

    const completedMap = Object.fromEntries(dailyCompleted.map(r => [r.day, r.count]));
    const createdMap = Object.fromEntries(dailyCreated.map(r => [r.day, r.count]));

    const heatmap = days.map(day => ({
      date: day,
      completed: completedMap[day] || 0,
      created: createdMap[day] || 0,
      totalActivity: (completedMap[day] || 0) + (createdMap[day] || 0)
    }));

    // 5. Streak calculation (consecutive days leading up to today with >= 1 completion)
    let currentStreak = 0;
    for (let i = heatmap.length - 1; i >= 0; i--) {
      if (heatmap[i].completed > 0) {
        currentStreak++;
      } else {
        // If today has 0 completions, check if yesterday had completions before breaking
        if (i === heatmap.length - 1) {
          continue;
        }
        break;
      }
    }

    // Productivity Score (0-100 index based on completion velocity, overdue handling, active streak)
    const overduePenalty = Math.min((overdueRow?.count || 0) * 10, 30);
    const streakBonus = Math.min(currentStreak * 5, 20);
    const productivityScore = Math.max(10, Math.min(100, Math.round(completionRate * 0.7 + streakBonus - overduePenalty + 20)));

    res.json({
      success: true,
      summary: {
        total,
        completed,
        inProgress: inProgressRow?.count || 0,
        todo: todoRow?.count || 0,
        review: reviewRow?.count || 0,
        overdue: overdueRow?.count || 0,
        completionRate,
        currentStreak,
        totalTimeSpentMinutes: timeSpentRow?.total_time || 0,
        productivityScore
      },
      priorityBreakdown,
      categoryBreakdown,
      heatmap
    });
  } catch (err) {
    console.error('Error generating analytics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
