// Comprehensive End-to-End Test Suite for Zenith Task API & Utilities

import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Zenith Task E2E Automated Verification...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('GET /api/health should return ok status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.status, 'ok');
  });

  // 2. Fetch Initial Tasks
  let initialTaskCount = 0;
  await test('GET /api/todos should return list of hydrated tasks', async () => {
    const res = await fetch(`${BASE_URL}/todos`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.tasks));
    assert(json.tasks.length > 0);
    initialTaskCount = json.tasks.length;
    // Verify subtasks and tags hydration
    const taskWithSubtasks = json.tasks.find(t => t.subtasks && t.subtasks.length > 0);
    assert(taskWithSubtasks, 'Expected at least one task with subtasks');
    assert(Array.isArray(taskWithSubtasks.subtasks));
  });

  // 3. Create New Task with Subtasks and Tags
  let createdTaskId = null;
  await test('POST /api/todos should create a task with nested subtasks & tags', async () => {
    const payload = {
      title: 'Automated E2E Test Task #test',
      description: 'Verifying end-to-end integration test runner',
      priority: 'urgent',
      due_date: '2026-08-25',
      estimated_minutes: 60,
      subtasks: [
        { title: 'Subtask Alpha', is_completed: false },
        { title: 'Subtask Beta', is_completed: true }
      ],
      tags: ['tag-frontend']
    };

    const res = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(json.success, true);
    assert(json.task.id);
    assert.strictEqual(json.task.title, 'Automated E2E Test Task #test');
    assert.strictEqual(json.task.priority, 'urgent');
    assert.strictEqual(json.task.subtasks.length, 2);
    createdTaskId = json.task.id;
  });

  // 4. Fetch Single Task
  await test('GET /api/todos/:id should return single task details', async () => {
    const res = await fetch(`${BASE_URL}/todos/${createdTaskId}`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.task.id, createdTaskId);
    assert.strictEqual(json.task.subtasks.length, 2);
  });

  // 5. Patch Task Status to Completed
  await test('PATCH /api/todos/:id should toggle status and set completed_at', async () => {
    const res = await fetch(`${BASE_URL}/todos/${createdTaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.task.status, 'completed');
    assert(json.task.completed_at !== null, 'completed_at should be populated');
  });

  // 6. Full Update via PUT
  await test('PUT /api/todos/:id should update full task properties', async () => {
    const res = await fetch(`${BASE_URL}/todos/${createdTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated E2E Test Task',
        description: 'Updated description',
        priority: 'high',
        status: 'in_progress',
        estimated_minutes: 90,
        time_spent_minutes: 45,
        subtasks: [{ title: 'Single Updated Subtask', is_completed: true }],
        tags: ['tag-backend']
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.task.title, 'Updated E2E Test Task');
    assert.strictEqual(json.task.priority, 'high');
    assert.strictEqual(json.task.subtasks.length, 1);
    assert.strictEqual(json.task.time_spent_minutes, 45);
  });

  // 7. Batch Operations
  await test('POST /api/todos/batch should execute bulk priority change', async () => {
    const res = await fetch(`${BASE_URL}/todos/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set_priority',
        taskIds: [createdTaskId],
        value: 'low'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);

    // Verify change
    const checkRes = await fetch(`${BASE_URL}/todos/${createdTaskId}`);
    const checkJson = await checkRes.json();
    assert.strictEqual(checkJson.task.priority, 'low');
  });

  // 8. Reordering Tasks
  await test('POST /api/todos/reorder should update order_index and status', async () => {
    const res = await fetch(`${BASE_URL}/todos/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: createdTaskId, order_index: 9999, status: 'review' }]
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
  });

  // 9. Categories and Tags Management
  let createdCatId = null;
  await test('POST & GET /api/categories should manage categories', async () => {
    const postRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Automated Test Cat', icon: 'Code', color: '#ec4899' })
    });
    const postJson = await postRes.json();
    assert.strictEqual(postRes.status, 201);
    assert.strictEqual(postJson.category.name, 'Automated Test Cat');
    createdCatId = postJson.category.id;

    const getRes = await fetch(`${BASE_URL}/categories`);
    const getJson = await getRes.json();
    assert(getJson.categories.some(c => c.id === createdCatId));
  });

  // 10. Analytics & 30-Day Heatmap
  await test('GET /api/analytics should calculate velocity, streak & 30-day heatmap', async () => {
    const res = await fetch(`${BASE_URL}/analytics`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert(typeof json.summary.total === 'number');
    assert(typeof json.summary.completionRate === 'number');
    assert(typeof json.summary.productivityScore === 'number');
    assert(Array.isArray(json.heatmap));
    assert.strictEqual(json.heatmap.length, 30);
    assert(Array.isArray(json.priorityBreakdown));
  });

  // 11. Activity Log Audit Trail
  await test('GET /api/activity should return recent action logs', async () => {
    const res = await fetch(`${BASE_URL}/activity`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.logs));
    assert(json.logs.length > 0);
  });

  // 12. Soft Delete and Permanent Delete
  await test('DELETE /api/todos/:id should soft delete then permanently delete', async () => {
    // Soft delete
    const softRes = await fetch(`${BASE_URL}/todos/${createdTaskId}`, { method: 'DELETE' });
    const softJson = await softRes.json();
    assert.strictEqual(softRes.status, 200);
    assert.strictEqual(softJson.message, 'Task moved to trash');

    // Verify in trash
    const trashRes = await fetch(`${BASE_URL}/todos?isDeleted=true`);
    const trashJson = await trashRes.json();
    assert(trashJson.tasks.some(t => t.id === createdTaskId));

    // Permanent delete
    const permRes = await fetch(`${BASE_URL}/todos/${createdTaskId}?permanent=true`, { method: 'DELETE' });
    const permJson = await permRes.json();
    assert.strictEqual(permRes.status, 200);
    assert.strictEqual(permJson.message, 'Task permanently deleted');

    // Clean up category
    if (createdCatId) {
      await fetch(`${BASE_URL}/categories/${createdCatId}`, { method: 'DELETE' });
    }
  });

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
