#!/usr/bin/env node
/**
 * Logseq Text Toolkit - Electron functional E2E runner.
 *
 * This is intentionally a Host mock, not a real Logseq profile:
 * - loads the real built dist/index.js
 * - exercises the real React UI / DOM / SDK selection paths
 * - keeps the test isolated and repeatable
 *
 * Requirements:
 * - Node 22+ (global WebSocket) or Node with a global WebSocket polyfill
 * - Electron installed locally, or ELECTRON_BIN pointing at an Electron binary
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, rmSync } from 'node:fs';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import net from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const DIST = join(ROOT, 'dist');
const E2E_DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fail(message) {
  console.error(`\n[e2e] ${message}`);
  process.exit(1);
}

function assertNodeRuntime() {
  if (typeof WebSocket !== 'function') {
    fail('This runner needs a global WebSocket (Node 22+).');
  }
}

function findElectron() {
  if (process.env.ELECTRON_BIN) {
    if (!existsSync(process.env.ELECTRON_BIN)) {
      fail(`ELECTRON_BIN does not exist: ${process.env.ELECTRON_BIN}`);
    }
    return process.env.ELECTRON_BIN;
  }

  try {
    const require = createRequire(import.meta.url);
    const electron = require('electron');
    if (typeof electron === 'string' && existsSync(electron)) return electron;
  } catch {
    // electron is an optional local dependency for e2e only
  }

  const candidates = [
    join(ROOT, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),
    join(ROOT, 'node_modules/electron/dist/electron'),
    join(ROOT, 'node_modules/electron/dist/electron.exe'),
    join(E2E_DIR, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),
    join(E2E_DIR, 'node_modules/electron/dist/electron'),
    join(E2E_DIR, 'node_modules/electron/dist/electron.exe'),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (found) return found;

  fail(
    'Electron was not found. Install it with "npm i -D electron", ' +
    'or set ELECTRON_BIN to an existing Electron binary.'
  );
}

async function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
  });
}

function buildSettings() {
  const defaults = JSON.parse(
    readFileSync(join(ROOT, 'src/settings/defaultSettings.json'), 'utf8')
  );
  return {
    ...defaults,
    disabled: false,
    toolbar: true,
    theme: 'light',
    language: 'zh-CN',
    ToolbarItems: [
      {
        id: 'bold',
        label: 'Bold',
        icon: 'B',
        invoke: 'replace',
        invokeParams: '**${selectedText}**',
      },
      {
        id: 'comment',
        label: 'Comment',
        icon: 'C',
        invoke: 'invoke',
        invokeParams: 'inlineComment',
      },
    ],
    blockView: {
      ...(defaults.blockView || {}),
      enabled: true,
      defaultView: 'list',
      defaultTheme: 'default',
      hideViewBar: false,
      inline: false,
    },
    taskProgress: {
      ...(defaults.taskProgress || {}),
      enabled: true,
      defaultDisplayType: 'mini-circle',
    },
    heatmap: {
      ...(defaults.heatmap || {}),
      enabled: true,
      defaultViewType: 'month',
    },
    milestone: {
      ...(defaults.milestone || {}),
      enabled: true,
      defaultDisplayStyle: 'compact',
    },
  };
}

function startServer(settings) {
  const settingsScript = `window.__LTT_SETTINGS__ = ${JSON.stringify(settings)};\n`;
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === '/' || pathname === '/index.html') {
      const body = await readFile(join(E2E_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
      res.end(body);
      return;
    }

    if (pathname === '/settings.js') {
      res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-store' });
      res.end(settingsScript);
      return;
    }

    if (pathname === '/host.js') {
      const body = await readFile(join(E2E_DIR, 'host.js'));
      res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-store' });
      res.end(body);
      return;
    }

    if (pathname.startsWith('/assets/')) {
      const file = resolve(join(E2E_DIR, 'assets'), pathname.slice('/assets/'.length));
      const assetsRoot = join(E2E_DIR, 'assets');
      if (!file.startsWith(assetsRoot) || !existsSync(file)) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      createReadStream(file).pipe(res);
      return;
    }

    if (pathname.startsWith('/dist/')) {
      const file = resolve(DIST, pathname.slice('/dist/'.length));
      if (!file.startsWith(DIST) || !existsSync(file)) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      const info = await stat(file);
      if (!info.isFile()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      createReadStream(file).pipe(res);
      return;
    }

    res.writeHead(404);
    res.end('not found');
  });

  return new Promise((resolveServer, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolveServer({ server, port });
    });
  });
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.exceptions = [];
    this.consoleErrors = [];
    this.events = [];
    ws.addEventListener('message', (event) => this.onMessage(event));
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolveOpen, reject) => {
      ws.addEventListener('open', resolveOpen, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });
    return new CDP(ws);
  }

  onMessage(event) {
    let message;
    try {
      message = JSON.parse(String(event.data));
    } catch {
      return;
    }

    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || 'CDP error'));
      else resolve(message.result);
      return;
    }

    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params?.exceptionDetails;
      this.exceptions.push(
        details?.exception?.description || details?.text || 'Runtime exception'
      );
    }

    if (message.method === 'Runtime.consoleAPICalled') {
      const type = message.params?.type;
      if (type === 'error') {
        const text = (message.params.args || [])
          .map((arg) => arg.value ?? arg.description ?? '')
          .join(' ');
        this.consoleErrors.push(text);
      }
    }

    this.events.push(message);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolveSend, reject) => {
      this.pending.set(id, { resolve: resolveSend, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      const description =
        result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text ||
        'Evaluation failed';
      throw new Error(description);
    }
    return result.result?.value;
  }

  resetDiagnostics() {
    this.exceptions = [];
    this.consoleErrors = [];
  }

  close() {
    try {
      this.ws.close();
    } catch {
      // ignore
    }
  }
}

async function waitForDebugger(port, timeoutMs = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // not ready
    }
    await sleep(100);
  }
  throw new Error(`DevTools did not become ready on port ${port}`);
}

async function getPageTarget(port, timeoutMs = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      // not ready
    }
    await sleep(100);
  }
  throw new Error('No debuggable page target found');
}

async function waitForPlugin(cdp, timeoutMs = 15_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ready = await cdp.evaluate('Boolean(window.__state?.ready)');
    if (ready) return;
    await sleep(100);
  }
  throw new Error('Plugin did not become ready in the page');
}

async function runScript(cdp, file, label) {
  const source = await readFile(join(E2E_DIR, file), 'utf8');
  const results = await cdp.evaluate(source);
  if (!Array.isArray(results)) {
    throw new Error(`${label}: runner did not return a result array`);
  }
  return results;
}

function printResults(phase, results) {
  console.log(`\n=== ${phase} ===`);
  for (const result of results) {
    console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}`);
    if (!result.pass && result.detail) {
      console.log(`      ${JSON.stringify(result.detail)}`);
    }
  }
  const passed = results.filter((result) => result.pass).length;
  console.log(`${passed}/${results.length} passed`);
  return passed === results.length;
}

async function main() {
  assertNodeRuntime();

  if (!existsSync(join(DIST, 'index.js'))) {
    fail('dist/index.js not found. Run "npm run build:plugin" first.');
  }

  const electronBin = findElectron();
  const settings = buildSettings();
  const { server, port: serverPort } = await startServer(settings);
  const debugPort = await freePort();
  const userDataDir = await mkdtemp(join(tmpdir(), 'ltt-e2e-'));
  const baseUrl = `http://127.0.0.1:${serverPort}/index.html`;
  const env = { ...process.env, E2E_URL: baseUrl };
  delete env.ELECTRON_RUN_AS_NODE;

  const child = spawn(
    electronBin,
    [
      E2E_DIR,
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      '--no-sandbox',
      '--disable-gpu',
      '--disable-crash-reporter',
    ],
    { env, stdio: ['ignore', 'pipe', 'pipe'] }
  );

  let stderr = '';
  child.stderr?.on('data', (chunk) => {
    stderr += String(chunk);
    if (process.env.E2E_VERBOSE) process.stderr.write(chunk);
  });
  child.stdout?.on('data', (chunk) => {
    if (process.env.E2E_VERBOSE) process.stdout.write(chunk);
  });

  let cdp;
  let allPassed = true;

  try {
    await waitForDebugger(debugPort);
    const page = await getPageTarget(debugPort);
    cdp = await CDP.connect(page.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Network.enable');
    await cdp.send('Network.clearBrowserCache');
    await cdp.send('Page.navigate', { url: `${baseUrl}?phase=main&v=${Date.now()}` });
    await waitForPlugin(cdp);

    allPassed = printResults('main functional suite', await runScript(cdp, 'runner.js', 'main')) && allPassed;

    // Summary-specific logic: custom range, yearly template/page name, replacement safety.
    await cdp.send('Page.navigate', { url: `${baseUrl}?phase=summary&v=${Date.now()}` });
    await waitForPlugin(cdp);
    allPassed = printResults('summary logic suite', await runScript(cdp, 'summary_runner.js', 'summary')) && allPassed;

    // HTML attachment viewer: asset list, selection, annotation, panel controls, persistence.
    await cdp.send('Page.navigate', { url: `${baseUrl}?phase=html&v=${Date.now()}` });
    await waitForPlugin(cdp);
    allPassed = printResults('html viewer suite', await runScript(cdp, 'html_runner.js', 'html')) && allPassed;

    // Native fallback: old host with no onInputSelectionEnd.
    await cdp.send('Page.navigate', { url: `${baseUrl}?native=1&v=${Date.now()}` });
    await waitForPlugin(cdp);
    allPassed = printResults('native fallback suite', await runScript(cdp, 'native_runner.js', 'native')) && allPassed;

    // SDK hook exists but never emits: native fallback must still work.
    await cdp.send('Page.navigate', { url: `${baseUrl}?silent=1&v=${Date.now()}` });
    await waitForPlugin(cdp);
    allPassed = printResults('silent SDK fallback suite', await runScript(cdp, 'silent_sdk_runner.js', 'silent')) && allPassed;

    if (cdp.exceptions.length > 0) {
      allPassed = false;
      console.error('\nUnhandled renderer exceptions:');
      for (const exception of cdp.exceptions) console.error(`- ${exception}`);
    } else if (cdp.consoleErrors.length > 0) {
      console.log('\nRenderer console errors (non-fatal):');
      for (const message of cdp.consoleErrors) console.log(`- ${message}`);
    }
  } catch (error) {
    allPassed = false;
    console.error(`\n[e2e] ${error.stack || error}`);
    if (stderr.trim()) console.error('\nElectron stderr:\n' + stderr.trim().slice(-4000));
  } finally {
    cdp?.close();
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
    await new Promise((resolveClose) => {
      server.close(resolveClose);
      server.closeAllConnections?.();
    });
    await sleep(200);
    try {
      rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  if (!allPassed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
