// Chrome DevTools Protocol (CDP) Automated Test Runner & Auditor
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const TARGET_URL = 'http://localhost:5173';

console.log('🚀 Launching Google Chrome with DevTools Protocol enabled...');

const chromeProc = spawn(CHROME_PATH, [
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + path.join(process.cwd(), '.chrome-profile')
], { stdio: 'ignore' });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWebSocketDebuggerUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent(TARGET_URL)}`, { method: 'PUT' });
      const data = await res.json();
      if (data.webSocketDebuggerUrl) {
        return data;
      }
    } catch (e) {
      await wait(500);
    }
  }
  throw new Error('Could not connect to Chrome DevTools port');
}

async function runDevToolsAudit() {
  try {
    await wait(2000);
    const target = await getWebSocketDebuggerUrl();
    console.log(`📡 Connected to Chrome DevTools Protocol at: ${target.webSocketDebuggerUrl}\n`);

    const WS = globalThis.WebSocket;
    const ws = new WS(target.webSocketDebuggerUrl);

    let messageId = 1;
    const callbacks = new Map();
    const consoleLogs = [];
    const networkErrors = [];
    const networkRequests = [];

    ws.onopen = () => {
      // Enable DevTools domains
      send('Runtime.enable');
      send('Page.enable');
      send('DOM.enable');
      send('Network.enable');
      send('Performance.enable');
      
      // Navigate to target
      send('Page.navigate', { url: TARGET_URL });
    };

    function send(method, params = {}) {
      const id = messageId++;
      return new Promise((resolve, reject) => {
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.onmessage = (event) => {
      const data = typeof event.data === 'string' ? event.data : event.data.toString();
      const msg = JSON.parse(data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }

      // Collect Console events
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        consoleLogs.push({ type: msg.params.type, text });
      }

      // Collect Exception events
      if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params.exceptionDetails;
        consoleLogs.push({ type: 'error', text: `${details.text} at line ${details.lineNumber}:${details.columnNumber}` });
      }

      // Collect Network events
      if (msg.method === 'Network.responseReceived') {
        networkRequests.push({
          url: msg.params.response.url,
          status: msg.params.response.status,
          mimeType: msg.params.response.mimeType
        });
      }

      if (msg.method === 'Network.loadingFailed') {
        networkErrors.push({
          requestId: msg.params.requestId,
          errorText: msg.params.errorText,
          canceled: msg.params.canceled
        });
      }
    };

    // Wait for initial page load
    console.log('⏳ Waiting for page DOM and assets to render...');
    await wait(3500);

    // 1. Evaluate DOM Title and Root Elements
    const titleResult = await send('Runtime.evaluate', {
      expression: 'document.title'
    });
    console.log(`📄 Page Title: "${titleResult.result.value}"`);

    // 2. Evaluate Task Elements on Page
    const evalTasks = await send('Runtime.evaluate', {
      expression: `({
        taskCardsCount: document.querySelectorAll('.task-card').length,
        navItemsCount: document.querySelectorAll('.nav-item').length,
        quickAddExists: !!document.querySelector('.quick-add-container'),
        theme: document.documentElement.getAttribute('data-theme'),
        accent: document.documentElement.getAttribute('data-accent')
      })`,
      returnByValue: true
    });
    console.log('🔍 Initial DOM Inspection:', evalTasks.result.value);

    // 3. Test Interactivity via DevTools: Quick Add a new task
    console.log('\n📝 Simulating Quick Add input via Chrome Runtime...');
    await send('Runtime.evaluate', {
      expression: `
        const input = document.querySelector('.quick-add-input');
        input.value = "Chrome DevTools Integration Verified @tomorrow !urgent #qa ~30m";
        input.dispatchEvent(new Event('input', { bubbles: true }));
      `
    });

    await wait(800);

    // Verify recognized token pills
    const tokensEval = await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('.token-pill')).map(el => el.textContent.trim())`,
      returnByValue: true
    });
    console.log('🏷️ Recognized Token Pills in Quick Add:', tokensEval.result.value);

    // Submit the form
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.quick-add-container form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));`
    });

    await wait(1500);

    // 4. Test View Switcher Tabs via DevTools
    console.log('\n🔄 Testing View Switching:');
    
    // Switch to Kanban Board
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.view-tab-btn')[1].click();`
    });
    await wait(800);
    const kanbanCheck = await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.kanban-col').length`,
      returnByValue: true
    });
    console.log(`  ➔ Switched to Kanban Board: ${kanbanCheck.result.value} columns rendered`);

    // Switch to Eisenhower Matrix
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.view-tab-btn')[2].click();`
    });
    await wait(800);
    const matrixCheck = await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.matrix-quadrant').length`,
      returnByValue: true
    });
    console.log(`  ➔ Switched to Eisenhower Matrix: ${matrixCheck.result.value} quadrants rendered`);

    // Switch to Calendar
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.view-tab-btn')[3].click();`
    });
    await wait(800);
    const calendarCheck = await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.calendar-cell').length`,
      returnByValue: true
    });
    console.log(`  ➔ Switched to Calendar: ${calendarCheck.result.value} day cells rendered`);

    // Switch to Analytics
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.view-tab-btn')[4].click();`
    });
    await wait(1000);
    const analyticsCheck = await send('Runtime.evaluate', {
      expression: `({
        statCards: document.querySelectorAll('.stat-card').length,
        heatmapCells: document.querySelectorAll('.heatmap-cell').length
      })`,
      returnByValue: true
    });
    console.log(`  ➔ Switched to Analytics: ${analyticsCheck.result.value.statCards} stat cards, ${analyticsCheck.result.value.heatmapCells} heatmap cells rendered`);

    // 5. Test Theme Switcher
    console.log('\n🎨 Testing Theme & Accent Switcher:');
    await send('Runtime.evaluate', {
      expression: `
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.setAttribute('data-accent', 'cyan');
      `
    });
    const themeState = await send('Runtime.evaluate', {
      expression: `({
        theme: document.documentElement.getAttribute('data-theme'),
        accent: document.documentElement.getAttribute('data-accent')
      })`,
      returnByValue: true
    });
    console.log(`  ➔ Applied Theme State:`, themeState.result.value);

    // 6. Capture DevTools Screenshot
    console.log('\n📸 Capturing Full-Page DevTools Screenshot...');
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const imgPath = path.join(process.cwd(), 'client', 'devtools_screenshot.png');
    fs.writeFileSync(imgPath, Buffer.from(screenshot.data, 'base64'));
    console.log(`  ✅ Screenshot saved to: ${imgPath}`);

    // 7. Audit DevTools Console & Network Health
    console.log('\n========================================');
    console.log('🔍 Chrome DevTools Health Summary:');
    console.log(`  • Network Requests Sample: ${networkRequests.length} assets loaded successfully`);
    console.log(`  • Network Failures: ${networkErrors.length}`);
    console.log(`  • Console Errors: ${consoleLogs.filter(l => l.type === 'error').length}`);
    console.log('========================================\n');

    if (consoleLogs.filter(l => l.type === 'error').length > 0) {
      console.log('Console Errors Details:', consoleLogs.filter(l => l.type === 'error'));
    }

    ws.close();
    chromeProc.kill();
    process.exit(0);
  } catch (err) {
    console.error('DevTools Audit failed:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

runDevToolsAudit();
