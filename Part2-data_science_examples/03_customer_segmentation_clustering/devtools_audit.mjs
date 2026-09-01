// Chrome DevTools Protocol (CDP) Automated Visual Auditor for Customer Clustering Platform

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9226;
const TARGET_URL = 'http://127.0.0.1:5176';

console.log('🚀 Launching Google Chrome for Customer Clustering Platform Visual Audit...');

const chromeProc = spawn(CHROME_PATH, [
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + path.join(process.cwd(), '.chrome-profile-clustering')
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
    await wait(2500);
    const target = await getWebSocketDebuggerUrl();
    console.log(`📡 Connected to Chrome DevTools at: ${target.webSocketDebuggerUrl}\n`);

    const WS = globalThis.WebSocket;
    const ws = new WS(target.webSocketDebuggerUrl);

    let messageId = 1;
    const callbacks = new Map();
    const consoleLogs = [];
    const networkErrors = [];
    const networkRequests = [];

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

      if (msg.method === 'Network.responseReceived') {
        networkRequests.push({ url: msg.params.response.url, status: msg.params.response.status });
      }
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    await send('Runtime.enable');
    await send('Page.enable');
    await send('DOM.enable');
    await send('Network.enable');
    await send('Page.navigate', { url: TARGET_URL });

    console.log('⏳ Waiting for Customer Clustering DOM to render...');
    await wait(3500);

    // 1. Capture Customer Explorer View
    console.log('🛍️ Capturing Customer Segment Explorer & 2D Manifold Canvas...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    const p1 = path.join(process.cwd(), 'client', 'clustering_explorer_screenshot.png');
    fs.writeFileSync(p1, Buffer.from(shot1.data, 'base64'));
    console.log(`  ✅ Explorer Screenshot saved to: ${p1}`);

    // 2. Open CRISP-DM Report Modal & Capture
    console.log('📄 Opening CRISP-DM Standard Research Report Modal...');
    await send('Runtime.evaluate', {
      expression: `
        const crispBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CRISP-DM'));
        if (crispBtn) crispBtn.click();
      `
    });
    await wait(1500);

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const p2 = path.join(process.cwd(), 'client', 'clustering_crisp_dm_screenshot.png');
    fs.writeFileSync(p2, Buffer.from(shot2.data, 'base64'));
    console.log(`  ✅ CRISP-DM Report Screenshot saved to: ${p2}`);

    // Close Modal
    await send('Runtime.evaluate', {
      expression: `
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Report'));
        if (closeBtn) closeBtn.click();
      `
    });
    await wait(800);

    // 3. Switch to Data Science Admin Console
    console.log('🔬 Switching to Data Science Admin Console...');
    await send('Runtime.evaluate', {
      expression: `
        const adminTab = document.querySelectorAll('.nav-tab-btn')[1];
        if (adminTab) adminTab.click();
      `
    });
    await wait(1500);

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    const p3 = path.join(process.cwd(), 'client', 'clustering_benchmarks_screenshot.png');
    fs.writeFileSync(p3, Buffer.from(shot3.data, 'base64'));
    console.log(`  ✅ Benchmarks & Elbow Screenshot saved to: ${p3}`);

    // 4. Switch to AutoResearch Tab & Click a Step Row
    console.log('⛰️ Switching to AutoResearch Tab & Opening Step Inspector Modal...');
    await send('Runtime.evaluate', {
      expression: `
        const subTabs = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('AutoResearch'));
        if (subTabs.length > 0) subTabs[0].click();
      `
    });
    await wait(1500);

    // Click first inspect button or table row
    await send('Runtime.evaluate', {
      expression: `
        const inspectBtn = document.querySelector('.data-table tbody tr');
        if (inspectBtn) inspectBtn.click();
      `
    });
    await wait(1500);

    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    const p4 = path.join(process.cwd(), 'client', 'clustering_autoresearch_step_screenshot.png');
    fs.writeFileSync(p4, Buffer.from(shot4.data, 'base64'));
    console.log(`  ✅ AutoResearch Step Click-Through Screenshot saved to: ${p4}`);

    // Close step modal
    await send('Runtime.evaluate', {
      expression: `
        const closeStepBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Step'));
        if (closeStepBtn) closeStepBtn.click();
      `
    });
    await wait(800);

    // 5. Switch to Feature Radar Profiles Tab
    console.log('🕸️ Switching to Feature Radar Profiles Tab...');
    await send('Runtime.evaluate', {
      expression: `
        const radarTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Feature Radar'));
        if (radarTab) radarTab.click();
      `
    });
    await wait(1500);

    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    const p5 = path.join(process.cwd(), 'client', 'clustering_radar_screenshot.png');
    fs.writeFileSync(p5, Buffer.from(shot5.data, 'base64'));
    console.log(`  ✅ Feature Radar Profiles Screenshot saved to: ${p5}`);

    // Summary
    console.log('\n========================================');
    console.log('🔍 Customer Clustering DevTools Audit Summary:');
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
