// Chrome DevTools Protocol (CDP) Test Runner & Visual Auditor for NYC Taxi UI

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9223;
const TARGET_URL = 'http://127.0.0.1:5174';

console.log('🚀 Launching Google Chrome for AutoResearch Click-Through Audit...');

const chromeProc = spawn(CHROME_PATH, [
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + path.join(process.cwd(), '.chrome-profile-nyctaxi')
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
    console.log(`📡 Connected to Chrome DevTools at: ${target.webSocketDebuggerUrl}\n`);

    const WS = globalThis.WebSocket;
    const ws = new WS(target.webSocketDebuggerUrl);

    let messageId = 1;
    const callbacks = new Map();
    const consoleLogs = [];
    const networkErrors = [];
    const networkRequests = [];

    ws.onopen = async () => {
      await send('Runtime.enable');
      await send('Page.enable');
      await send('DOM.enable');
      await send('Network.enable');
      await send('Page.navigate', { url: TARGET_URL });
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

      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        consoleLogs.push({ type: msg.params.type, text });
      }

      if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params.exceptionDetails;
        consoleLogs.push({ type: 'error', text: `${details.text} at line ${details.lineNumber}:${details.columnNumber}` });
      }

      if (msg.method === 'Network.responseReceived') {
        networkRequests.push({ url: msg.params.response.url, status: msg.params.response.status });
      }

      if (msg.method === 'Network.loadingFailed') {
        networkErrors.push({ requestId: msg.params.requestId, errorText: msg.params.errorText });
      }
    };

    console.log('⏳ Waiting for NYC Taxi page DOM to load...');
    await wait(3000);

    // 1. Switch to Data Science Admin Dashboard
    console.log('🔄 Navigating to Data Science Admin Dashboard...');
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.nav-tab-btn')[1].click();`
    });
    await wait(1000);

    // 2. Switch to AutoResearch Tabular Tab
    console.log('⛰️ Selecting AutoResearch Tab...');
    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('.workspace button'));
        const autoBtn = btns.find(b => b.textContent.includes('AutoResearch'));
        if (autoBtn) autoBtn.click();
      `
    });
    await wait(1500);

    // Capture Multi-Backbone Leaderboard & Trajectory
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    const p1 = path.join(process.cwd(), 'client', 'autoresearch_multibackbone_screenshot.png');
    fs.writeFileSync(p1, Buffer.from(shot1.data, 'base64'));
    console.log(`  ✅ Multi-Backbone Leaderboard Screenshot saved to: ${p1}`);

    // 3. Click Step Row to open Click-Through Step Modal
    console.log('\n🔍 Clicking Step row to open Click-Through Inspector Modal...');
    await send('Runtime.evaluate', {
      expression: `
        const inspectBtn = document.querySelector('.data-table tbody tr button');
        if (inspectBtn) inspectBtn.click();
      `
    });
    await wait(1200);

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const p2 = path.join(process.cwd(), 'client', 'autoresearch_clickthrough_screenshot.png');
    fs.writeFileSync(p2, Buffer.from(shot2.data, 'base64'));
    console.log(`  ✅ Click-Through Step Inspector Screenshot saved to: ${p2}`);

    // Summary
    console.log('\n========================================');
    console.log('🔍 AutoResearch Visual Audit Summary:');
    console.log(`  • Network Assets Loaded: ${networkRequests.length}`);
    console.log(`  • Network Failures: ${networkErrors.length}`);
    console.log(`  • Console Errors: ${consoleLogs.filter(l => l.type === 'error').length}`);
    console.log('========================================\n');

    ws.close();
    chromeProc.kill();
    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

runDevToolsAudit();
