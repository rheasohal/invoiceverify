import express from 'express'
import db from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

// Get all rules for user
router.get('/rules', (req, res) => {
  try {
    const rules = db.prepare('SELECT rule_key, rule_value FROM business_rules WHERE user_id = ?').all(req.userId)
    const result = {}
    rules.forEach(r => result[r.rule_key] = r.rule_value)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update a rule
router.put('/rules/:key', (req, res) => {
  const { value } = req.body
  if (!value) return res.status(400).json({ error: 'Value is required' })
  try {
    db.prepare(`
      INSERT INTO business_rules (user_id, rule_key, rule_value)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, rule_key) DO UPDATE SET rule_value = excluded.rule_value
    `).run(req.userId, req.params.key, value)
    res.json({ key: req.params.key, value })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all vendors for user
router.get('/vendors', (req, res) => {
  try {
    const vendors = db.prepare('SELECT id, vendor_name, created_at FROM vendor_list WHERE user_id = ? ORDER BY vendor_name').all(req.userId)
    res.json(vendors)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add vendor
router.post('/vendors', (req, res) => {
  const { vendor_name } = req.body
  if (!vendor_name) return res.status(400).json({ error: 'Vendor name is required' })
  try {
    const result = db.prepare('INSERT INTO vendor_list (user_id, vendor_name) VALUES (?, ?)').run(req.userId, vendor_name)
    res.status(201).json({ id: result.lastInsertRowid, vendor_name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete vendor
router.delete('/vendors/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM vendor_list WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router