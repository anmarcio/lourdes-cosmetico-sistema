
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let db = null;
let databasePath = null;

async function initializeDatabase(userDataPath) {
  databasePath = path.join(userDataPath, 'lourdes-local.sqlite');

  const wasmPath = path.join(
    path.dirname(require.resolve('sql.js')),
    'sql-wasm.wasm'
  );

  const SQL = await initSqlJs({
    locateFile: () => wasmPath
  });

  if (fs.existsSync(databasePath)) {
    const fileBuffer = fs.readFileSync(databasePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS local_metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

    db.run(`
      CREATE TABLE IF NOT EXISTS local_products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        price REAL NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        data_json TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

  saveDatabase();

  return databasePath;
}

function saveDatabase() {
  if (!db || !databasePath) {
    throw new Error('Banco local ainda não foi inicializado.');
  }

  const data = db.export();
  const buffer = Buffer.from(data);

  fs.writeFileSync(databasePath, buffer);
}

function getDatabase() {
  if (!db) {
    throw new Error('Banco local ainda não foi inicializado.');
  }

  return db;
}

module.exports = {
  initializeDatabase,
  getDatabase,
  saveDatabase
};
