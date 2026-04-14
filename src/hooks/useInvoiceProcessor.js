import { useState, useCallback } from 'react'
import { extractInvoiceData, fileToBase64, getMimeType } from '../services/geminiVision.js'
import { sampleInvoices } from '../data/sampleInvoices.js'
import { samplePOs } from '../data/samplePOs.js'
import { sampleGRNs } from '../data/sampleGRNs.js'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

const LOADING_STEPS = [
  'Sending invoice to Gemini Vision...',
  'Extracting structured fields...',
  'Identifying line items...',
  'Parsing totals and tax...',
  'Preparing reconciliation...',
]

// Safely convert a value to a number, treating null/undefined as 0
function toNum(val) {
  if (val === null || val === undefined) return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function sanitizeInvoice(data) {
  // Get the raw taxRate — only default to 18 if Gemini didn't return it at all
  const rawTaxRate = data.taxRate ?? data.tax_rate ?? data.gst_rate ?? null
  const taxRate = rawTaxRate !== null ? toNum(rawTaxRate) : 18

  return {
    vendor: data.vendor || 'Unknown Vendor',
    invoiceNo: data.invoiceNo || data.invoice_no || data.invoice_number || 'N/A',
    date: data.date || data.invoice_date || 'N/A',
    dueDate: data.dueDate || data.due_date || null,
    poRef: data.poRef || data.po_ref || data.po_number || data.po_reference || data.purchase_order || null,
    paymentTerms: data.paymentTerms || data.payment_terms || 'Net 30',
    taxRate,
    isHandwritten: data.isHandwritten || data.is_handwritten || false,
    items: Array.isArray(data.items) ? data.items.map(item => ({
      desc: item.desc || item.description || item.name || 'Item',
      qty: toNum(item.qty || item.quantity || 1),
      rate: toNum(item.rate || item.unit_price || item.price),
      amount: toNum(item.amount || item.total || item.line_total),
    })) : [],
    subtotal: toNum(data.subtotal ?? data.sub_total),
    tax: toNum(data.tax ?? data.tax_amount ?? data.gst_amount),
    total: toNum(data.total ?? data.grand_total ?? data.total_amount),
    confidence: data.confidence || { vendor: 90, invoiceNo: 90, date: 90, total: 90 },
  }
}

export function useInvoiceProcessor(token, loadedPOs = [], loadedGRNs = []) {
  const [invoice, setInvoice] = useState(null)
  const [po, setPO] = useState(null)
  const [grn, setGRN] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)
  const [scenarioKey, setScenarioKey] = useState(null)

  const stepThrough = async (steps) => {
    for (const msg of steps) {
      setLoadingMsg(msg)
      await new Promise(r => setTimeout(r, 400))
    }
  }

  const processFile = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    setInvoice(null)
    setPO(null)
    setGRN(null)
    setScenarioKey(null)

    try {
      await stepThrough(LOADING_STEPS)
      const base64 = await fileToBase64(file)
      const mimeType = getMimeType(file)
      const raw = await extractInvoiceData(base64, mimeType, token)
      console.log('[InvoiceVerify] Raw Gemini response keys:', Object.keys(raw))
      console.log('[InvoiceVerify] Raw Gemini monetary values:', { subtotal: raw.subtotal, tax: raw.tax, total: raw.total, taxRate: raw.taxRate })
      console.log('[InvoiceVerify] Raw poRef-like fields:', { poRef: raw.poRef, po_ref: raw.po_ref, po_number: raw.po_number, po_reference: raw.po_reference, purchase_order: raw.purchase_order })
      const extracted = sanitizeInvoice(raw)
      console.log('[InvoiceVerify] Sanitized values:', { subtotal: extracted.subtotal, tax: extracted.tax, total: extracted.total, taxRate: extracted.taxRate })
      console.log('[InvoiceVerify] Sanitized poRef:', extracted.poRef)

      if (!extracted.items || extracted.items.length === 0) {
        throw new Error('Could not extract line items from this invoice. Please try a clearer image.')
      }

      // Save Gemini's raw extracted values for math verification comparison
      extracted.statedSubtotal = extracted.subtotal
      extracted.statedTax = extracted.tax
      extracted.statedTotal = extracted.total

      // Always recompute from line items to avoid Gemini misreads
      const computedSubtotal = extracted.items.reduce((s, i) => s + i.qty * i.rate, 0)
      const computedTax = extracted.taxRate > 0
        ? parseFloat((computedSubtotal * extracted.taxRate / 100).toFixed(2))
        : 0
      const computedTotal = parseFloat((computedSubtotal + computedTax).toFixed(2))

      // Use extracted values if they exist, otherwise use computed
      extracted.subtotal = extracted.subtotal || computedSubtotal
      extracted.tax = extracted.tax || computedTax
      extracted.total = computedTotal // Always use computed total — Gemini misreads handwriting too often

      console.log('[InvoiceVerify] Final values:', { subtotal: extracted.subtotal, tax: extracted.tax, total: extracted.total })

      setInvoice(extracted)

      if (extracted.poRef) {
        // Normalize: "PO - 7325" → "PO-7325" (Gemini adds spaces around hyphens from handwriting)
        const poRef = extracted.poRef.trim().replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ')
        extracted.poRef = poRef
        console.log('[InvoiceVerify] Looking up PO for ref:', JSON.stringify(poRef))
        console.log('[InvoiceVerify] Loaded POs count:', loadedPOs.length)
        console.log('[InvoiceVerify] Loaded PO numbers:', loadedPOs.map(p => p.po_number))

        let matched = false

        // Strategy 1: Match from already-loaded POs (inline, no stale closure)
        const refLower = poRef.toLowerCase()
        for (const lpo of loadedPOs) {
          if (lpo.po_number?.toLowerCase() === refLower) {
            console.log('[InvoiceVerify] ✅ MATCHED PO from loaded data:', lpo.po_number)
            setPO({
              poNo: lpo.po_number,
              vendor: lpo.vendor,
              date: lpo.date,
              paymentTerms: lpo.payment_terms,
              items: lpo.items.map(i => ({ desc: i.description, qty: i.qty, rate: i.rate })),
              total: lpo.total,
            })
            matched = true

            // Find matching GRN
            for (const lg of loadedGRNs) {
              if (lg.po_number?.toLowerCase() === refLower) {
                console.log('[InvoiceVerify] ✅ MATCHED GRN from loaded data:', lg.grn_number)
                setGRN({
                  grnNo: lg.grn_number,
                  poRef: lg.po_number,
                  receivedItems: lg.items.map(i => ({ desc: i.description, qtyReceived: i.qty_received })),
                })
                break
              }
            }
            break
          }
        }

        // Strategy 2: Fetch from server API
        if (!matched) {
          console.log('[InvoiceVerify] Not found locally, trying server API...')
          try {
            const poRes = await fetch(`${SERVER_URL}/api/pos/${encodeURIComponent(poRef)}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            console.log('[InvoiceVerify] Server PO lookup status:', poRes.status)
            if (poRes.ok) {
              const dbPO = await poRes.json()
              console.log('[InvoiceVerify] ✅ MATCHED PO from server:', dbPO.po_number)
              setPO({
                poNo: dbPO.po_number,
                vendor: dbPO.vendor,
                date: dbPO.date,
                paymentTerms: dbPO.payment_terms,
                items: dbPO.items.map(i => ({ desc: i.description, qty: i.qty, rate: i.rate })),
                total: dbPO.total,
              })
              matched = true
              const grnRes = await fetch(`${SERVER_URL}/api/grns/po/${encodeURIComponent(poRef)}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              if (grnRes.ok) {
                const dbGRN = await grnRes.json()
                setGRN({
                  grnNo: dbGRN.grn_number,
                  poRef: dbGRN.po_number,
                  receivedItems: dbGRN.items.map(i => ({ desc: i.description, qtyReceived: i.qty_received })),
                })
              }
            } else {
              const errBody = await poRes.text()
              console.log('[InvoiceVerify] Server PO lookup failed:', errBody)
            }
          } catch (err) {
            console.warn('[InvoiceVerify] Server PO fetch error:', err.message)
          }
        }

        // Strategy 3: Check sample POs (demo fallback)
        if (!matched) {
          console.log('[InvoiceVerify] Trying sample POs...')
          const matchedPO = samplePOs[poRef]
          if (matchedPO) {
            setPO(matchedPO)
            const matchedGRN = sampleGRNs[poRef]
            if (matchedGRN) setGRN(matchedGRN)
          } else {
            console.log('[InvoiceVerify] ❌ PO not found anywhere for ref:', JSON.stringify(poRef))
          }
        }
      } else {
        console.log('[InvoiceVerify] ⚠️ No PO reference extracted from invoice')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, loadedPOs, loadedGRNs])

  const loadSample = useCallback(async (key) => {
    setLoading(true)
    setError(null)
    setInvoice(null)
    setPO(null)
    setGRN(null)

    try {
      await stepThrough(LOADING_STEPS)
      const inv = sampleInvoices[key]
      if (!inv) throw new Error(`Sample scenario "${key}" not found`)
      setInvoice(inv)
      setScenarioKey(key)

      if (inv.poRef) {
        const matchedPO = samplePOs[inv.poRef]
        if (matchedPO) setPO(matchedPO)
        const matchedGRN = sampleGRNs[inv.poRef]
        if (matchedGRN) setGRN(matchedGRN)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setInvoice(null)
    setPO(null)
    setGRN(null)
    setError(null)
    setScenarioKey(null)
    setLoadingMsg('')
  }, [])

  return {
    invoice, po, grn,
    loading, loadingMsg,
    error, scenarioKey,
    processFile, loadSample, reset,
  }
}