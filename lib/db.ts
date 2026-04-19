import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('inventory.db');

function ensureItemColumns() {
  const rows = db.getAllSync('PRAGMA table_info(items)') as { name: string }[];
  if (!rows.length) return;

  const names = new Set(rows.map((r) => r.name));
  if (!names.has('location')) {
    db.execSync('ALTER TABLE items ADD COLUMN location TEXT');
  }
  if (!names.has('category')) {
    db.execSync('ALTER TABLE items ADD COLUMN category TEXT');
  }
}

/* ---------------- INIT ---------------- */
export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE,
      name TEXT,
      quantity INTEGER,
      location TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT,
      action TEXT,
      quantity_change INTEGER,
      timestamp TEXT
    );
  `);

  ensureItemColumns();

  db.execSync(`UPDATE items SET quantity = 0 WHERE quantity < 0`);
}

/* ---------------- ITEMS ---------------- */
export function getItem(barcode: string) {
  return db.getFirstSync('SELECT * FROM items WHERE barcode = ?', [barcode]);
}

export function getAllItems() {
  return db.getAllSync(`SELECT * FROM items ORDER BY (name IS NULL), name ASC, barcode ASC`);
}

export function createItem(barcode: string, name: string, location = '', category = '') {
  db.runSync(
    `INSERT OR IGNORE INTO items (barcode, name, quantity, location, category)
     VALUES (?, ?, 1, ?, ?)`,
    [barcode, name, location, category]
  );

  addHistory(barcode, 'CREATE', 1);
}

export function updateItemDetails(
  barcode: string,
  fields: { name: string; location: string; category: string }
) {
  db.runSync(
    `UPDATE items SET name = ?, location = ?, category = ? WHERE barcode = ?`,
    [fields.name, fields.location, fields.category, barcode]
  );
}

function readQtyValue(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.floor(n));
}

/** Applies a stock change but never lets quantity drop below zero. History matches the actual change. */
export function updateQuantity(barcode: string, delta: number) {
  const row = db.getFirstSync('SELECT quantity FROM items WHERE barcode = ?', [barcode]) as {
    quantity: unknown;
  } | null;

  if (!row) return;

  const current = readQtyValue(row.quantity);
  const next = Math.max(0, current + delta);
  const appliedDelta = next - current;
  if (appliedDelta === 0) return;

  db.runSync('UPDATE items SET quantity = ? WHERE barcode = ?', [next, barcode]);

  addHistory(barcode, appliedDelta > 0 ? 'ADD' : 'REMOVE', appliedDelta);
}

/* ---------------- HISTORY ---------------- */
export function addHistory(barcode: string, action: string, quantityChange: number) {
  const time = new Date().toISOString();

  db.runSync(
    `INSERT INTO history (barcode, action, quantity_change, timestamp)
     VALUES (?, ?, ?, ?)`,
    [barcode, action, quantityChange, time]
  );
}

/* ---------------- CATEGORIES ---------------- */
export function getUniqueCategories() {
  const result = db.getAllSync(`
    SELECT DISTINCT category 
    FROM items 
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category ASC
  `) as { category: string }[];
  
  return result.map(row => row.category);
}

/* ---------------- READ HISTORY ---------------- */
export function getHistory() {
  return db.getAllSync(`
    SELECT
      h.id,
      h.barcode,
      h.action,
      h.quantity_change,
      h.timestamp,
      i.name AS item_name
    FROM history h
    LEFT JOIN items i ON i.barcode = h.barcode
    ORDER BY h.id DESC
  `);
}
