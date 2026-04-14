import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import posRouter from './routes/pos.js'
import grnsRouter from './routes/grns.js'
import settingsRouter from './routes/settings.js'
import { authenticate } from './middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '20mb' }))

app.use('/api/auth', authRouter)
app.use('/api/pos', posRouter)
app.use('/api/grns', grnsRouter)
app.use('/api/settings', settingsRouter)

app.post('/api/extract', authenticate, async (req, res) => {
  const { imageBase64, mimeType } = req.body
  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'imageBase64 and mimeType are required' })
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' })

  const EXTRACTION_PROMPT = `You are an expert invoice data extraction system. Analyze this invoice image and extract ONLY the data that is explicitly written/printed on the invoice.

CRITICAL RULES:
- Extract ONLY values that are physically present on the invoice. Do NOT calculate, infer, or compute any missing values.
- If a field (like tax amount, total, subtotal) is NOT explicitly written on the invoice, return null for that field.
- Do NOT compute tax from a tax rate. Do NOT compute totals by adding subtotal + tax. Only return what you can actually read.
- For the taxRate field: extract if a percentage is mentioned (e.g. "18% GST"), otherwise use null.

Extract the following fields:
- vendor: company/person name issuing the invoice
- invoiceNo: invoice number/ID
- date: invoice date (YYYY-MM-DD format)
- dueDate: payment due date (YYYY-MM-DD format, null if not found)
- poRef: purchase order reference number (null if not found)
- paymentTerms: payment terms e.g. "Net 30" (null if not found)
- taxRate: tax/GST percentage as a number e.g. 18 (null if no tax rate mentioned)
- items: array of line items, each with desc, qty, rate, amount as numbers
- subtotal: subtotal before tax as a number (null if not explicitly on the invoice)
- tax: tax/GST amount as a number (null if not explicitly on the invoice)
- total: grand total as a number (null if not explicitly on the invoice)
- isHandwritten: true if handwritten, false if printed
- confidence: object with scores 0-100 for vendor, invoiceNo, date, total

Return ONLY valid JSON, no markdown, no explanation. All monetary values must be numbers. If a field is not found or not explicitly written on the invoice, use null.`

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
            { text: EXTRACTION_PROMPT },
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    )
    if (!geminiRes.ok) {
      const err = await geminiRes.json()
      return res.status(geminiRes.status).json({ error: err?.error?.message || 'Gemini API error' })
    }
    const data = await geminiRes.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) return res.status(500).json({ error: 'Empty response from Gemini' })
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    return res.json(JSON.parse(cleaned))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.listen(PORT, () => console.log(`InvoiceVerify server running on port ${PORT}`))