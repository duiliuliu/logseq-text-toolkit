const { app, BrowserWindow } = require('electron');

app.commandLine.appendSwitch('allow-file-access-from-files');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('remote-allow-origins', '*');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-crash-reporter');

const url = process.env.E2E_URL;

if (!url) {
  console.error('[e2e] E2E_URL is required');
  app.quit();
  process.exit(1);
}

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1440,
    height: 1000,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadURL(url);

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[e2e] renderer gone:', details);
    app.quit();
  });

  win.webContents.on('console-message', (event) => {
    if (process.env.E2E_VERBOSE && event?.level === 'error') {
      console.error('[renderer]', event.message);
    }
  });

  win.webContents.on('did-fail-load', (_event, code, description, failedUrl) => {
    console.error('[e2e] did-fail-load:', code, description, failedUrl);
  });
});

app.on('window-all-closed', () => app.quit());
