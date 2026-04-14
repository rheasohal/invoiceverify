import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'invoiceverify.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vendor_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vendor_name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS business_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    rule_key TEXT NOT NULL,
    rule_value TEXT NOT NULL,
    UNIQUE(user_id, rule_key),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    po_number TEXT NOT NULL,
    vendor TEXT NOT NULL,
    date TEXT NOT NULL,
    payment_terms TEXT DEFAULT 'Net 30',
    notes TEXT,
    total REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, po_number)
  );

  CREATE TABLE IF NOT EXISTS po_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT NOT NULL,
    user_id INTEGER,
    description TEXT NOT NULL,
    qty REAL NOT NULL,
    rate REAL NOT NULL,
    amount REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS grn_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    grn_number TEXT NOT NULL,
    po_number TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS grn_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grn_number TEXT NOT NULL,
    user_id INTEGER,
    description TEXT NOT NULL,
    qty_ordered REAL NOT NULL,
    qty_received REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invoice_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    invoice_no TEXT NOT NULL,
    vendor TEXT,
    total REAL,
    score INTEGER,
    discrepancies INTEGER,
    flags INTEGER,
    processed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

// Insert default business rules for a user
export function seedDefaultRules(userId) {
  const defaults = [
    { key: 'gst_rate', value: '18' },
    { key: 'max_unit_price', value: '100000' },
    { key: 'round_number_threshold', value: '1000' },
    { key: 'allowed_payment_terms', value: 'Net 30,Net 45,Net 60' },
    { key: 'price_deviation_threshold', value: '15' },
  ]
  const insert = db.prepare(`
    INSERT OR IGNORE INTO business_rules (user_id, rule_key, rule_value)
    VALUES (?, ?, ?)
  `)
  for (const rule of defaults) {
    insert.run(userId, rule.key, rule.value)
  }
}

// Insert default vendors for a user
export function seedDefaultVendors(userId) {
  const defaults = [
    'TechSupply Co. Pvt. Ltd.',
    'Ravi Electricals',
    'OfficeWorld Supplies',
    'PrintZone India',
    'Global Tech Solutions',
    'Prime Office Mart',
  ]
  const insert = db.prepare(`
    INSERT OR IGNORE INTO vendor_list (user_id, vendor_name)
    VALUES (?, ?)
  `)
  for (const vendor of defaults) {
    insert.run(userId, vendor)
  }
}

export default db