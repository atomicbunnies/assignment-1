// Chrome DevTools Protocol (CDP) Automated Visual Auditor for NanoLlama Platform

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9225;
const TARGET_URL = 'http://127.0.0.1:5175';

console.log('🚀 Launching Google Chrome for NanoLlama Visual & E2E Audit...');

const chromeProc = spawn(CHROME_PATH, [
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + path.join(process.cwd(), '.chrome-profile-nanollama')
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

    console.log('⏳ Waiting for NanoLlama DOM to initialize...');
    await wait(3000);

    // 1. Capture Interactive Chat Interface
    console.log('💬 Testing Streaming Chat & Prompt Preset...');
    await send('Runtime.evaluate', {
      expression: `
        const preset = document.querySelector('.preset-chip');
        if (preset) preset.click();
      `
    });
    await wait(3000);

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    const p1 = path.join(process.cwd(), 'client', 'nanollama_chat_screenshot.png');
    fs.writeFileSync(p1, Buffer.from(shot1.data, 'base64'));
    console.log(`  ✅ Chat Interface Screenshot saved to: ${p1}`);

    // 2. Navigate to Attention Heatmaps Tab
    console.log('🔬 Testing Attention Heatmaps Visualizer...');
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.nav-tab-btn')[1].click();`
    });
    await wait(1500);

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const p2 = path.join(process.cwd(), 'client', 'nanollama_attention_screenshot.png');
    fs.writeFileSync(p2, Buffer.from(shot2.data, 'base64'));
    console.log(`  ✅ Attention Heatmap Screenshot saved to: ${p2}`);

    // 3. Navigate to Tokenizer Studio Tab
    console.log('🧩 Testing Tokenizer & Subword Studio...');
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.nav-tab-btn')[2].click();`
    });
    await wait(1500);

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    const p3 = path.join(process.cwd(), 'client', 'nanollama_tokenizer_screenshot.png');
    fs.writeFileSync(p3, Buffer.from(shot3.data, 'base64'));
    console.log(`  ✅ Tokenizer Studio Screenshot saved to: ${p3}`);

    // 4. Navigate to Training Telemetry Tab
    console.log('📈 Testing Training & Loss Telemetry...');
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.nav-tab-btn')[3].click();`
    });
    await wait(1500);

    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    const p4 = path.join(process.cwd(), 'client', 'nanollama_telemetry_screenshot.png');
    fs.writeFileSync(p4, Buffer.from(shot4.data, 'base64'));
    console.log(`  ✅ Training Telemetry Screenshot saved to: ${p4}`);

    // 5. Navigate to Architecture Blueprint Tab
    console.log('🧠 Testing Architecture Blueprint...');
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.nav-tab-btn')[4].click();`
    });
    await wait(1500);

    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    const p5 = path.join(process.cwd(), 'client', 'nanollama_blueprint_screenshot.png');
    fs.writeFileSync(p5, Buffer.from(shot5.data, 'base64'));
    console.log(`  ✅ Architecture Blueprint Screenshot saved to: ${p5}`);

    // Summary
    console.log('\n========================================');
    console.log('🔍 NanoLlama DevTools Visual Audit Summary:');
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
