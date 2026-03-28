import express from 'express'
import db from '../db.js'

const router = express.Router()

// Get all POs
router.get('/', (req, res) => {
  try {
    const pos = db.prepare('SELECT * FROM purchase_orders ORDER BY created_at DESC').all()
    const result = pos.map(po => {
      const items = db.prepare('SELECT * FROM po_items WHERE po_number = ?').all(po.po_number)
      return { ...po, items }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single PO by number
router.get('/:poNumber', (req, res) => {
  try {
    const po = db.prepare('SELECT * FROM purchase_orders WHERE po_number = ?').get(req.params.poNumber)
    if (!po) return res.status(404).json({ error: 'PO not found' })
    const items = db.prepare('SELECT * FROM po_items WHERE po_number = ?').all(po.po_number)
    res.json({ ...po, items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create PO
router.post('/', (req, res) => {
  const { po_number, vendor, date, payment_terms, notes, items } = req.body

  if (!po_number || !vendor || !date || !items || items.length === 0) {
    return res.status(400).json({ error: 'po_number, vendor, date and items are required' })
  }

  const existing = db.prepare('SELECT id FROM purchase_orders WHERE po_number = ?').get(po_number)
  if (existing) return res.status(409).json({ error: `PO number ${po_number} already exists` })

  try {
    const total = items.reduce((sum, item) => sum + item.qty * item.rate, 0)

    const insertPO = db.prepare(`
      INSERT INTO purchase_orders (po_number, vendor, date, payment_terms, notes, total)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const insertItem = db.prepare(`
      INSERT INTO po_items (po_number, description, qty, rate, amount)
      VALUES (?, ?, ?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      insertPO.run(po_number, vendor, date, payment_terms || 'Net 30', notes || '', total)
      for (const item of items) {
        insertItem.run(po_number, item.description, item.qty, item.rate, item.qty * item.rate)
      }
    })

    transaction()

    const created = db.prepare('SELECT * FROM purchase_orders WHERE po_number = ?').get(po_number)
    const createdItems = db.prepare('SELECT * FROM po_items WHERE po_number = ?').all(po_number)
    res.status(201).json({ ...created, items: createdItems })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete PO
router.delete('/:poNumber', (req, res) => {
  try {
    db.prepare('DELETE FROM po_items WHERE po_number = ?').run(req.params.poNumber)
    db.prepare('DELETE FROM purchase_orders WHERE po_number = ?').run(req.params.poNumber)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router