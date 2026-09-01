import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'todos.db');
const db = new sqlite3.Database(dbPath);

// Helper for promise-based queries
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const initDb = async () => {
  await run(`PRAGMA foreign_keys = ON;`);

  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('todo', 'in_progress', 'review', 'completed')) DEFAULT 'todo',
      category_id TEXT,
      due_date TEXT,
      estimated_minutes INTEGER DEFAULT 0,
      time_spent_minutes INTEGER DEFAULT 0,
      order_index REAL DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY(task_id, tag_id),
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      task_title TEXT,
      action TEXT NOT NULL,
      details TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default categories and sample tasks if empty
  const count = await getOne('SELECT COUNT(*) as count FROM categories');
  if (count.count === 0) {
    await seedDefaultData();
  }
};

async function seedDefaultData() {
  const categories = [
    { id: 'cat-work', name: 'Work & Projects', icon: 'Briefcase', color: '#6366f1' },
    { id: 'cat-personal', name: 'Personal & Life', icon: 'User', color: '#ec4899' },
    { id: 'cat-dev', name: 'Dev & Engineering', icon: 'Code', color: '#06b6d4' },
    { id: 'cat-health', name: 'Health & Fitness', icon: 'HeartPulse', color: '#10b981' },
    { id: 'cat-finance', name: 'Finance & Bills', icon: 'DollarSign', color: '#f59e0b' }
  ];

  for (const cat of categories) {
    await run('INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)', [
      cat.id, cat.name, cat.icon, cat.color
    ]);
  }

  const tags = [
    { id: 'tag-frontend', name: 'frontend', color: '#38bdf8' },
    { id: 'tag-backend', name: 'backend', color: '#a855f7' },
    { id: 'tag-design', name: 'design', color: '#f43f5e' },
    { id: 'tag-urgent', name: 'critical', color: '#ef4444' },
    { id: 'tag-learning', name: 'learning', color: '#10b981' }
  ];

  for (const tag of tags) {
    await run('INSERT INTO tags (id, name, color) VALUES (?, ?, ?)', [
      tag.id, tag.name, tag.color
    ]);
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const tasks = [
    {
      id: 'task-1',
      title: 'Architect dynamic fullstack micro-interactions',
      description: 'Implement glassmorphism styling, smooth layout transitions, and audio cues for task completions.',
      priority: 'urgent',
      status: 'in_progress',
      category_id: 'cat-dev',
      due_date: today,
      estimated_minutes: 45,
      time_spent_minutes: 25,
      order_index: 1000,
      is_pinned: 1,
      subtasks: [
        { id: 'sub-1-1', title: 'Design tactile feedback sound effects', is_completed: 1 },
        { id: 'sub-1-2', title: 'Add confetti burst animation on task completion', is_completed: 1 },
        { id: 'sub-1-3', title: 'Implement keyboard shortcut command palette (Ctrl+K)', is_completed: 0 }
      ],
      tags: ['tag-frontend', 'tag-design']
    },
    {
      id: 'task-2',
      title: 'Setup natural language task parsing engine',
      description: 'Support typing phrases like "Submit tax report tomorrow @5pm !high #finance ~30m"',
      priority: 'high',
      status: 'todo',
      category_id: 'cat-dev',
      due_date: today,
      estimated_minutes: 60,
      time_spent_minutes: 0,
      order_index: 2000,
      is_pinned: 1,
      subtasks: [
        { id: 'sub-2-1', title: 'Regex tokenizer for tags and priorities', is_completed: 1 },
        { id: 'sub-2-2', title: 'Date parser for relative keywords (today, tomorrow, next friday)', is_completed: 0 }
      ],
      tags: ['tag-frontend', 'tag-backend']
    },
    {
      id: 'task-3',
      title: 'Review weekly sprint milestones and deliverables',
      description: 'Synchronize with design and engineering leads on release schedule.',
      priority: 'medium',
      status: 'review',
      category_id: 'cat-work',
      due_date: tomorrow,
      estimated_minutes: 30,
      time_spent_minutes: 30,
      order_index: 3000,
      is_pinned: 0,
      subtasks: [
        { id: 'sub-3-1', title: 'Aggregate telemetry & analytics metrics', is_completed: 1 },
        { id: 'sub-3-2', title: 'Draft release notes', is_completed: 1 }
      ],
      tags: ['tag-urgent']
    },
    {
      id: 'task-4',
      title: '30-minute cardio & mobility session',
      description: 'Stay energized and maintain physical wellness.',
      priority: 'low',
      status: 'completed',
      category_id: 'cat-health',
      due_date: today,
      estimated_minutes: 30,
      time_spent_minutes: 30,
      order_index: 4000,
      is_pinned: 0,
      subtasks: [],
      tags: ['tag-learning']
    },
    {
      id: 'task-5',
      title: 'Prepare quarterly cloud infrastructure budget estimate',
      description: 'Calculate server scaling, SQLite backups, and CDN costs for upcoming traffic surge.',
      priority: 'high',
      status: 'todo',
      category_id: 'cat-finance',
      due_date: nextWeek,
      estimated_minutes: 90,
      time_spent_minutes: 0,
      order_index: 5000,
      is_pinned: 0,
      subtasks: [
        { id: 'sub-5-1', title: 'Audit current AWS/GCP node instances', is_completed: 0 },
        { id: 'sub-5-2', title: 'Project user concurrency growth rate', is_completed: 0 }
      ],
      tags: ['tag-backend']
    }
  ];

  for (const t of tasks) {
    await run(
      `INSERT INTO tasks (id, title, description, priority, status, category_id, due_date, estimated_minutes, time_spent_minutes, order_index, is_pinned, created_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      [
        t.id, t.title, t.description, t.priority, t.status, t.category_id,
        t.due_date, t.estimated_minutes, t.time_spent_minutes, t.order_index,
        t.is_pinned, t.status === 'completed' ? new Date().toISOString() : null
      ]
    );

    for (let i = 0; i < t.subtasks.length; i++) {
      const sub = t.subtasks[i];
      await run(
        `INSERT INTO subtasks (id, task_id, title, is_completed, order_index) VALUES (?, ?, ?, ?, ?)`,
        [sub.id, t.id, sub.title, sub.is_completed, i]
      );
    }

    for (const tagId of t.tags) {
      await run(`INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`, [t.id, tagId]);
    }
  }

  await run(`
    INSERT INTO activity_logs (id, task_id, task_title, action, details)
    VALUES ('log-init', 'task-1', 'Initial Workspace Created', 'CREATED', 'Initialized dynamic fullstack workspace with rich templates')
  `);
}

export default db;
