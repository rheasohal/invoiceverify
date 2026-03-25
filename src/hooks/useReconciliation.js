import { useMemo } from 'react'
import { verifyMath } from '../engine/mathVerifier.js'
import { validateBusinessRules } from '../engine/businessRules.js'
import { detectAnomalies } from '../engine/anomalyDetector.js'
import { checkDuplicate, registerInvoice } from '../engine/duplicateDetector.js'

export function useReconciliation(invoice, po, grn) {
  const result = useMemo(() => {
    if (!invoice) return null

    // Duplicate check
    const { isDuplicate, previousEntry } = checkDuplicate(invoice)
    if (!isDuplicate) registerInvoice(invoice)

    // Math verification
    const math = verifyMath(invoice)

    // Business rules
    const rules = validateBusinessRules(invoice, po)

    // Anomaly detection
    const anomalies = detectAnomalies(invoice)

    // Line item reconciliation
    const lineResults = []
    const discrepancies = []

    if (po && po.items) {
      po.items.forEach((poItem, i) => {
        const invItem = invoice.items[i]

        if (!invItem) {
          lineResults.push({
            desc: poItem.desc,
            status: 'missing',
            invQty: null, poQty: poItem.qty,
            invRate: null, poRate: poItem.rate,
            invAmount: null,
          })
          discrepancies.push({
            field: `Line ${i + 1}: ${poItem.desc}`,
            invoiceVal: 'Item missing from invoice',
            poVal: `Expected qty: ${poItem.qty}`,
            severity: 'high',
          })
          return
        }

        const qtyMatch = invItem.qty === poItem.qty
        const rateMatch = invItem.rate === poItem.rate
        const status = qtyMatch && rateMatch ? 'match' : (!qtyMatch && !rateMatch ? 'mismatch' : 'partial')

        lineResults.push({
          desc: invItem.desc,
          status,
          invQty: invItem.qty, poQty: poItem.qty,
          invRate: invItem.rate, poRate: poItem.rate,
          invAmount: invItem.amount,
        })

        if (!rateMatch) {
          discrepancies.push({
            field: `Unit Price — ${invItem.desc}`,
            invoiceVal: `₹${invItem.rate.toLocaleString('en-IN')}`,
            poVal: `₹${poItem.rate.toLocaleString('en-IN')}`,
            severity: 'high',
          })
        }

        if (!qtyMatch) {
          discrepancies.push({
            field: `Quantity — ${invItem.desc}`,
            invoiceVal: `${invItem.qty} units`,
            poVal: `${poItem.qty} units`,
            severity: 'medium',
          })

          if (grn) {
            const grnItem = grn.receivedItems?.find(g => g.desc === invItem.desc)
            if (grnItem && grnItem.qtyReceived !== invItem.qty) {
              discrepancies.push({
                field: `GRN Mismatch — ${invItem.desc}`,
                invoiceVal: `Invoice: ${invItem.qty} units`,
                poVal: `GRN received: ${grnItem.qtyReceived} units`,
                severity: 'high',
              })
            }
          }
        }
      })
    }

    // Payment terms discrepancy
    if (po && invoice.paymentTerms !== po.paymentTerms) {
      discrepancies.push({
        field: 'Payment Terms',
        invoiceVal: invoice.paymentTerms,
        poVal: po.paymentTerms,
        severity: 'medium',
      })
    }

    // Score calculation
    let matched = 0
    let total = 0

    lineResults.forEach(r => {
      total++
      if (r.status === 'match') matched++
      else if (r.status === 'partial') matched += 0.5
    })

    total += math.results.length
    matched += math.results.filter(r => r.pass).length

    total += rules.checks.length
    matched += rules.passCount

    const score = total > 0 ? Math.round((matched / total) * 100) : 0

    return {
      isDuplicate,
      previousEntry,
      math,
      rules,
      anomalies,
      lineResults,
      discrepancies,
      score,
      matchedCount: Math.floor(matched),
      totalFields: total,
      discrepancyCount: discrepancies.length,
      flagCount: anomalies.count + (isDuplicate ? 1 : 0),
    }
  }, [invoice, po, grn])

  return result
}