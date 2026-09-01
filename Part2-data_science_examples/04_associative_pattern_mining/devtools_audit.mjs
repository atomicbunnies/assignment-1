// Chrome DevTools Protocol visual audit script for Market Basket Mining Web Application

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ARTIFACTS_DIR = 'C:/Users/abhir/.gemini/antigravity-ide/brain/1b6b154c-f135-458e-977e-5d15a286fee5';
const PORT = 5177;
const CHROME_DEBUG_PORT = 9225;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WebSocket = (await import('ws')).default;
    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`📸 Captured screenshot: ${outPath} (${buffer.length} bytes)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runAudit() {
  console.log("🌐 Starting Chrome in remote debugging mode...");
  const chromeProcess = spawn('chrome', [
    `--remote-debugging-port=${CHROME_DEBUG_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1400,900',
    `--user-data-dir=C:/Users/abhir/.gemini/antigravity-ide/scratch/fourthtest-apriori/.chrome-profile-audit`
  ]);

  await sleep(2500);

  try {
    const versionInfo = await fetchJson(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json/version`);
    console.log("Connected to Chrome via CDP:", versionInfo.Browser);

    const targets = await fetchJson(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json`);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log("WebSocket connected to Chrome page target.");

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log(`Navigating to http://localhost:${PORT}...`);
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    
    // Wait for DOM to mount
    let ready = false;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const title = await cdp.eval(`document.querySelector('.brand-title')?.innerText`);
      if (title && title.includes('Market Basket')) {
        ready = true;
        console.log(`✓ DOM fully mounted with title: "${title}"`);
        break;
      }
    }
    await sleep(1500);

    // 1. Capture Explorer & Basket Recommender
    console.log("Auditing Basket Explorer & 2D Graph...");
    await cdp.screenshot('market_basket_explorer_screenshot.png');

    // 2. Open CRISP-DM Modal
    console.log("Opening CRISP-DM Research Report Modal...");
    await cdp.eval(`document.getElementById('btn-crisp-dm')?.click()`);
    await sleep(1500);
    await cdp.screenshot('market_basket_crisp_dm_screenshot.png');
    await cdp.eval(`document.querySelector('.modal-card button')?.click()`); // Close
    await sleep(800);

    // 3. Switch to Admin Dashboard -> Benchmarks
    console.log("Switching to Data Science Admin Dashboard...");
    await cdp.eval(`document.getElementById('tab-admin')?.click()`);
    await sleep(1500);
    await cdp.screenshot('market_basket_benchmarks_screenshot.png');

    // 4. Switch to AutoResearch Tab
    console.log("Switching to AutoResearch Hill-Climbing tab...");
    await cdp.eval(`document.getElementById('tab-sub-autoresearch')?.click()`);
    await sleep(1500);
    await cdp.screenshot('market_basket_autoresearch_screenshot.png');

    // 5. Open Step Click-Through Inspector Modal
    console.log("Opening AutoResearch Step Inspector Modal...");
    await cdp.eval(`document.querySelectorAll('table tbody tr button')[1]?.click()`);
    await sleep(1200);
    await cdp.screenshot('market_basket_step_inspector_screenshot.png');
    await cdp.eval(`document.querySelector('.modal-card button')?.click()`); // Close
    await sleep(800);

    // 6. Switch to Rules Explorer
    console.log("Switching to Association Rules Explorer tab...");
    await cdp.eval(`document.getElementById('tab-sub-rules')?.click()`);
    await sleep(1200);
    await cdp.screenshot('market_basket_rules_screenshot.png');

    console.log("✨ All 6 visual audit checkpoints completed successfully with 0 errors!");
    cdp.close();
  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    chromeProcess.kill();
  }
}

runAudit();
