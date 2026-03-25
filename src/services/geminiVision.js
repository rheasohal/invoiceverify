const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

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
- isHandwritten: true if the invoice appears handwritten, false if printed
- confidence: object with confidence scores (0-100) for: vendor, invoiceNo, date, total

Rules:
- Return ONLY valid JSON, no markdown, no explanation
- All monetary values must be numbers, not strings
- If a field is not found, use null
- For handwritten invoices, still extract what you can and mark lower confidence scores`

export async function extractInvoiceData(imageBase64, mimeType = 'image/jpeg') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key not found. Add VITE_GEMINI_API_KEY to your .env file.')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
          {
            text: EXTRACTION_PROMPT,
          },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message || 'Gemini API request failed')
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) throw new Error('No response from Gemini API')

  try {
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return parsed
  } catch {
    throw new Error('Failed to parse Gemini response as JSON')
  }
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function getMimeType(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const map = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  }
  return map[ext] || file.type || 'image/jpeg'
}