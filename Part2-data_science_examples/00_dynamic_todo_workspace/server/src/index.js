import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import todosRouter from './routes/todos.js';
import categoriesRouter from './routes/categories.js';
import analyticsRouter from './routes/analytics.js';
import activityRouter from './routes/activity.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Server-Sent Events (SSE) Client Registry for Live Dynamic Updates
const sseClients = new Set();

export const broadcastEvent = (eventData) => {
  const data = `data: ${JSON.stringify({ ...eventData, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch (err) {
      sseClients.delete(client);
    }
  }
};

// SSE Stream Endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Realtime stream connected' })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Mount Routes
app.use('/api/todos', todosRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/activity', activityRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), clients: sseClients.size });
});

// Initialize database and start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✨ Fullstack Todo API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });
