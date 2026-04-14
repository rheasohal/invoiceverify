import express from 'express'
import db from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

router.get('/', (req, res) => {
  try {
    const grns = db.prepare('SELECT * FROM grn_records WHERE user_id = ? ORDER BY created_at DESC').all(req.userId)
    const result = grns.map(grn => {
      const items = db.prepare('SELECT * FROM grn_items WHERE grn_number = ? AND user_id = ?').all(grn.grn_number, req.userId)
      return { ...grn, items }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/po/:poNumber', (req, res) => {
  try {
    const poNum = req.params.poNumber.trim()
    const grn = db.prepare('SELECT * FROM grn_records WHERE po_number = ? COLLATE NOCASE AND user_id = ?').get(poNum, req.userId)
    if (!grn) return res.status(404).json({ error: 'GRN not found' })
    const items = db.prepare('SELECT * FROM grn_items WHERE grn_number = ? AND user_id = ?').all(grn.grn_number, req.userId)
    res.json({ ...grn, items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', (req, res) => {
  const { grn_number, po_number, date, notes, items } = req.body
  if (!grn_number || !po_number || !date || !items || items.length === 0) {
    return res.status(400).json({ error: 'grn_number, po_number, date and items are required' })
  }
  try {
    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO grn_records (user_id, grn_number, po_number, date, notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.userId, grn_number, po_number, date, notes || '')
      for (const item of items) {
        db.prepare(`
          INSERT INTO grn_items (grn_number, user_id, description, qty_ordered, qty_received)
          VALUES (?, ?, ?, ?, ?)
        `).run(grn_number, req.userId, item.description, item.qty_ordered, item.qty_received)
      }
    })
    transaction()
    const created = db.prepare('SELECT * FROM grn_records WHERE grn_number = ?').get(grn_number)
    const createdItems = db.prepare('SELECT * FROM grn_items WHERE grn_number = ?').all(grn_number)
    res.status(201).json({ ...created, items: createdItems })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router