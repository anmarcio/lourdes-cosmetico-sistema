const { app, BrowserWindow, ipcMain } = require('electron');

const {
  initializeDatabase,
  getDatabase
} = require('./database.cjs');

const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Lourdes Cosmético e Utilidades',
    webPreferences: {
     contextIsolation: true,
     nodeIntegration: false,
     preload: path.join(__dirname, 'preload.cjs')
   }
  });

  win.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
}

ipcMain.handle('local:get-products', () => {
  const database = getDatabase();

  const result = database.exec(`
    SELECT id, name, code, price, stock, data_json
    FROM local_products
    ORDER BY name
  `);

  if (!result.length) {
    return [];
  }

  return result[0].values.map(row => {
    return JSON.parse(row[5]);
  });
});

app.whenReady().then(async () => {
  try {
    const databasePath = await initializeDatabase(app.getPath('userData'));

    console.log('Banco local inicializado:', databasePath);

    createWindow();
  } catch (error) {
    console.error('Erro ao inicializar banco local:', error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
