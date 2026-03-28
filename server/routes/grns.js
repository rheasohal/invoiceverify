import express from 'express'
import db from '../db.js'

const router = express.Router()

// Get all GRNs
router.get('/', (req, res) => {
  try {
    const grns = db.prepare('SELECT * FROM grn_records ORDER BY created_at DESC').all()
    const result = grns.map(grn => {
      const items = db.prepare('SELECT * FROM grn_items WHERE grn_number = ?').all(grn.grn_number)
      return { ...grn, items }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get GRN by PO number
router.get('/po/:poNumber', (req, res) => {
  try {
    const grn = db.prepare('SELECT * FROM grn_records WHERE po_number = ?').get(req.params.poNumber)
    if (!grn) return res.status(404).json({ error: 'GRN not found for this PO' })
    const items = db.prepare('SELECT * FROM grn_items WHERE grn_number = ?').all(grn.grn_number)
    res.json({ ...grn, items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create GRN
router.post('/', (req, res) => {
  const { grn_number, po_number, date, notes, items } = req.body

  if (!grn_number || !po_number || !date || !items || items.length === 0) {
    return res.status(400).json({ error: 'grn_number, po_number, date and items are required' })
  }

  const po = db.prepare('SELECT id FROM purchase_orders WHERE po_number = ?').get(po_number)
  if (!po) return res.status(404).json({ error: `PO ${po_number} not found` })

  try {
    const insertGRN = db.prepare(`
      INSERT INTO grn_records (grn_number, po_number, date, notes)
      VALUES (?, ?, ?, ?)
    `)
    const insertItem = db.prepare(`
      INSERT INTO grn_items (grn_number, description, qty_ordered, qty_received)
      VALUES (?, ?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      insertGRN.run(grn_number, po_number, date, notes || '')
      for (const item of items) {
        insertItem.run(grn_number, item.description, item.qty_ordered, item.qty_received)
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