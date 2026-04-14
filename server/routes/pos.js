import express from 'express'
import db from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

router.get('/', (req, res) => {
  try {
    const pos = db.prepare('SELECT * FROM purchase_orders WHERE user_id = ? ORDER BY created_at DESC').all(req.userId)
    const result = pos.map(po => {
      const items = db.prepare('SELECT * FROM po_items WHERE po_number = ? AND user_id = ?').all(po.po_number, req.userId)
      return { ...po, items }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:poNumber', (req, res) => {
  try {
    const poNum = req.params.poNumber.trim()
    const po = db.prepare('SELECT * FROM purchase_orders WHERE po_number = ? COLLATE NOCASE AND user_id = ?').get(poNum, req.userId)
    if (!po) return res.status(404).json({ error: 'PO not found' })
    const items = db.prepare('SELECT * FROM po_items WHERE po_number = ? AND user_id = ?').all(po.po_number, req.userId)
    res.json({ ...po, items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', (req, res) => {
  const { po_number, vendor, date, payment_terms, notes, items } = req.body
  if (!po_number || !vendor || !date || !items || items.length === 0) {
    return res.status(400).json({ error: 'po_number, vendor, date and items are required' })
  }
  const existing = db.prepare('SELECT id FROM purchase_orders WHERE po_number = ? AND user_id = ?').get(po_number, req.userId)
  if (existing) return res.status(409).json({ error: `PO number ${po_number} already exists` })

  try {
    const total = items.reduce((sum, item) => sum + item.qty * item.rate, 0)
    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO purchase_orders (user_id, po_number, vendor, date, payment_terms, notes, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(req.userId, po_number, vendor, date, payment_terms || 'Net 30', notes || '', total)
      for (const item of items) {
        db.prepare(`
          INSERT INTO po_items (po_number, user_id, description, qty, rate, amount)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(po_number, req.userId, item.description, item.qty, item.rate, item.qty * item.rate)
      }
    })
    transaction()
    const created = db.prepare('SELECT * FROM purchase_orders WHERE po_number = ? AND user_id = ?').get(po_number, req.userId)
    const createdItems = db.prepare('SELECT * FROM po_items WHERE po_number = ? AND user_id = ?').all(po_number, req.userId)
    res.status(201).json({ ...created, items: createdItems })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:poNumber', (req, res) => {
  try {
    db.prepare('DELETE FROM po_items WHERE po_number = ? AND user_id = ?').run(req.params.poNumber, req.userId)
    db.prepare('DELETE FROM purchase_orders WHERE po_number = ? AND user_id = ?').run(req.params.poNumber, req.userId)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router