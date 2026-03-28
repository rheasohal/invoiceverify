import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'invoiceverify.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT UNIQUE NOT NULL,
    vendor TEXT NOT NULL,
    date TEXT NOT NULL,
    payment_terms TEXT DEFAULT 'Net 30',
    notes TEXT,
    total REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS po_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT NOT NULL,
    description TEXT NOT NULL,
    qty REAL NOT NULL,
    rate REAL NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (po_number) REFERENCES purchase_orders(po_number)
  );

  CREATE TABLE IF NOT EXISTS grn_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grn_number TEXT UNIQUE NOT NULL,
    po_number TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS grn_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grn_number TEXT NOT NULL,
    description TEXT NOT NULL,
    qty_ordered REAL NOT NULL,
    qty_received REAL NOT NULL,
    FOREIGN KEY (grn_number) REFERENCES grn_records(grn_number)
  );
`)

export default db