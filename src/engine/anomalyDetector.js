import { RATE_CARD, BUSINESS_RULES } from '../data/masterData.js'

export function detectAnomalies(invoice) {
  const anomalies = []

  // Round number total
  if (invoice.total % BUSINESS_RULES.roundNumberThreshold === 0) {
    anomalies.push({
      type: 'round_number',
      severity: 'medium',
      title: 'Suspiciously Round Total Amount',
      desc: `Grand total of ₹${invoice.total.toLocaleString('en-IN')} is an exact round number — a common pattern in fraudulent invoices. Recommend manual review.`,
    })
  }

  // Unit price deviation from rate card
  invoice.items.forEach(item => {
    const standard = RATE_CARD[item.desc]
    if (standard) {
      const deviation = Math.abs(item.rate - standard) / standard
      if (deviation > 0.15) {
        anomalies.push({
          type: 'price_deviation',
          severity: deviation > 0.3 ? 'high' : 'medium',
          title: `Price Deviation: ${item.desc}`,
          desc: `Invoiced at ₹${item.rate.toLocaleString('en-IN')} vs rate card ₹${standard.toLocaleString('en-IN')} — ${Math.round(deviation * 100)}% difference.`,
        })
      }
    }
  })

  // High unit price
  invoice.items.forEach(item => {
    if (item.rate > BUSINESS_RULES.maxUnitPrice) {
      anomalies.push({
        type: 'high_unit_price',
        severity: 'high',
        title: `High Unit Price: ${item.desc}`,
        desc: `Unit price of ₹${item.rate.toLocaleString('en-IN')} exceeds the ₹${BUSINESS_RULES.maxUnitPrice.toLocaleString('en-IN')} threshold. Cross-check with procurement.`,
      })
    }
  })

  // Missing PO reference
  if (!invoice.poRef) {
    anomalies.push({
      type: 'missing_po',
      severity: 'high',
      title: 'No Purchase Order Reference',
      desc: 'Invoice has no PO reference number. All invoices must be linked to an approved purchase order before payment.',
    })
  }

  // Large number of line items
  if (invoice.items.length > 10) {
    anomalies.push({
      type: 'many_line_items',
      severity: 'low',
      title: 'High Line Item Count',
      desc: `Invoice contains ${invoice.items.length} line items. Large invoices have higher risk of errors — recommend detailed review.`,
    })
  }

  return {
    anomalies,
    count: anomalies.length,
    hasHighSeverity: anomalies.some(a => a.severity === 'high'),
  }
}