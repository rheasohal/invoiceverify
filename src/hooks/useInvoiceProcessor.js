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
      const extracted = await extractInvoiceData(base64, mimeType)
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