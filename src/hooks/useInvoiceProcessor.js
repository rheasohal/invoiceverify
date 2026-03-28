import { useState, useCallback } from 'react'
import { extractInvoiceData, fileToBase64, getMimeType } from '../services/geminiVision.js'
import { sampleInvoices } from '../data/sampleInvoices.js'
import { samplePOs } from '../data/samplePOs.js'
import { sampleGRNs } from '../data/sampleGRNs.js'

const LOADING_STEPS = [
  'Sending invoice to Gemini Vision...',
  'Extracting structured fields...',
  'Identifying line items...',
  'Parsing totals and tax...',
  'Preparing reconciliation...',
]

function sanitizeInvoice(data) {
  return {
    vendor: data.vendor || 'Unknown Vendor',
    invoiceNo: data.invoiceNo || data.invoice_no || data.invoice_number || 'N/A',
    date: data.date || data.invoice_date || 'N/A',
    dueDate: data.dueDate || data.due_date || null,
    poRef: data.poRef || data.po_ref || data.po_number || null,
    paymentTerms: data.paymentTerms || data.payment_terms || 'Net 30',
    taxRate: Number(data.taxRate || data.tax_rate || data.gst_rate || 18),
    isHandwritten: data.isHandwritten || false,
    items: Array.isArray(data.items) ? data.items.map(item => ({
      desc: item.desc || item.description || item.name || 'Item',
      qty: Number(item.qty || item.quantity || 1),
      rate: Number(item.rate || item.unit_price || item.price || 0),
      amount: Number(item.amount || item.total || item.line_total || 0),
    })) : [],
    subtotal: Number(data.subtotal || data.sub_total || 0),
    tax: Number(data.tax || data.tax_amount || data.gst_amount || 0),
    total: Number(data.total || data.grand_total || data.total_amount || 0),
    confidence: data.confidence || { vendor: 90, invoiceNo: 90, date: 90, total: 90 },
  }
}

export function useInvoiceProcessor() {
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
      const raw = await extractInvoiceData(base64, mimeType)
      const extracted = sanitizeInvoice(raw)

      if (!extracted.items || extracted.items.length === 0) {
        throw new Error('Could not extract line items from this invoice. Please try a clearer image.')
      }

      // recalculate if values are missing
      if (extracted.subtotal === 0) {
        extracted.subtotal = extracted.items.reduce((s, i) => s + i.qty * i.rate, 0)
      }
      if (extracted.tax === 0 && extracted.taxRate > 0) {
        extracted.tax = parseFloat((extracted.subtotal * extracted.taxRate / 100).toFixed(2))
      }
      if (extracted.total === 0) {
        extracted.total = parseFloat((extracted.subtotal + extracted.tax).toFixed(2))
      }

      setInvoice(extracted)

      if (extracted.poRef) {
        const matchedPO = samplePOs[extracted.poRef]
        if (matchedPO) {
          setPO(matchedPO)
          const matchedGRN = sampleGRNs[extracted.poRef]
          if (matchedGRN) setGRN(matchedGRN)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

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