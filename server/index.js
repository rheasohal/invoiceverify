import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '20mb' }))

app.post('/api/extract', async (req, res) => {
  const { imageBase64, mimeType } = req.body

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'imageBase64 and mimeType are required' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' })
  }

  const EXTRACTION_PROMPT = `You are an expert invoice data extraction system. Analyze this invoice image and extract all data into a structured JSON format.

Extract the following fields:
- vendor: company/person name issuing the invoice
- invoiceNo: invoice number/ID
- date: invoice date (YYYY-MM-DD format)
- dueDate: payment due date (YYYY-MM-DD format, null if not found)
- poRef: purchase order reference number (null if not found)
- paymentTerms: payment terms e.g. "Net 30" (null if not found)
- taxRate: tax/GST percentage as a number e.g. 18
- items: array of line items, each with:
    - desc: item description
    - qty: quantity as a number
    - rate: unit price as a number
    - amount: line total as a number
- subtotal: subtotal before tax as a number
- tax: tax amount as a number
- total: grand total as a number
- isHandwritten: true if handwritten, false if printed
- confidence: object with scores (0-100) for: vendor, invoiceNo, date, total

Rules:
- Return ONLY valid JSON, no markdown, no explanation
- All monetary values must be numbers not strings
- If a field is not found use null`

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
              { text: EXTRACTION_PROMPT },
            ],
          }],
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
    const parsed = JSON.parse(cleaned)

    return res.json(parsed)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`InvoiceVerify server running on port ${PORT}`))