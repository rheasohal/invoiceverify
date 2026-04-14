import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db, { seedDefaultRules, seedDefaultVendors } from '../db.js'

const router = express.Router()
const SECRET = process.env.JWT_SECRET || 'invoiceverify_secret_key'

// Register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `).run(email.toLowerCase(), hash, name || email.split('@')[0])

    const userId = result.lastInsertRowid
    seedDefaultRules(userId)
    seedDefaultVendors(userId)

    const token = jwt.sign({ userId, email: email.toLowerCase() }, SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: userId, email: email.toLowerCase(), name: name || email.split('@')[0] } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

// Get current user
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token' })
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, SECRET)
    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(decoded.userId)
    res.json(user)
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router