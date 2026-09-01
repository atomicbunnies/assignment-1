# ⚡ Zenith Task — Modern Dynamic Task & Workflow Workspace

A high-performance dynamic task management application engineered for power users with real-time SSE live updates, natural language task parsing, Pomodoro focus telemetry, Eisenhower prioritization matrix, and GitHub-style productivity analytics heatmaps.

---

## 📸 Comprehensive Visual Tour

### 1. Multi-Bucket Smart List View & Natural Language Parser
*Smart date-bucketed list with tag pills, priority chips, subtask progress, and inline quick-entry parsing `!urgent`, `#dev`, `@tomorrow`, `~30m`.*
![Zenith List View](./screenshots/todo_list_view.png)

### 2. Drag-and-Drop Kanban Board
*Fluid 4-stage column workflow (To Do, In Progress, In Review, Done) with automatic count indicators.*
![Zenith Kanban Board](./screenshots/todo_kanban_board.png)

### 3. Eisenhower Decision Matrix
*4-quadrant urgency-importance matrix (Do First, Schedule, Delegate, Eliminate) with quadrant re-assignment.*
![Zenith Eisenhower Matrix](./screenshots/todo_eisenhower_matrix.png)

### 4. Interactive Monthly Calendar Timeline
*Visual scheduling grid with scheduled task markers and click-to-schedule date modals.*
![Zenith Calendar Timeline](./screenshots/todo_calendar_timeline.png)

### 5. Real-Time Productivity Analytics & Activity Heatmap
*Weekly completion velocity, current streak counter (🔥), and GitHub-style 30-day activity matrix.*
![Zenith Analytics Dashboard](./screenshots/todo_analytics_dashboard.png)

### 6. Integrated Pomodoro Focus Timer
*Synthesized Web Audio chimes, 25m Focus / 5m Break modes with task time-spent tracking.*
![Zenith Pomodoro Focus](./screenshots/todo_pomodoro_focus.png)

---

## 🏛️ System Architecture

* **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS Glassmorphic design system.
* **Backend**: Express.js REST API with Server-Sent Events (SSE) live broadcast.
* **Storage**: SQLite / JSON persistent relational engine.
* **Audio**: Web Audio API oscillator synthesis.

---

## 🧠 Autonomous Skills Included

This project includes pre-packaged agent skills inside `skills/` and `.agents/skills/`:
* `matt-pocock-typescript-patterns`: Discriminated unions and strict runtime safety.
* `dashboard-specification`: Analytical telemetry layout specs.
* `visualization-builder`: Heatmap and velocity chart design.

---

## 🚀 Quick Start

```bash
# Backend Server (Port 5000)
cd server
npm install
npm run dev

# Frontend Client (Port 5173)
cd client
npm install
npm run dev # Open http://localhost:5173/
```
