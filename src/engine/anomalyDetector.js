export function detectAnomalies(invoice, userRules) {
  const anomalies = []

  const roundThreshold = Number(userRules?.round_number_threshold || 1000)
  const maxUnitPrice = Number(userRules?.max_unit_price || 100000)

  // Round number total — only flag if significantly large
  if (invoice.total > 10000 && invoice.total % roundThreshold === 0) {
    anomalies.push({
      type: 'round_number',
      severity: 'medium',
      title: 'Suspiciously Round Total Amount',
      desc: `Grand total of ₹${invoice.total.toLocaleString('en-IN')} is an exact round number — a common pattern in fraudulent invoices.`,
    })
  }

  // High unit price
  invoice.items?.forEach(item => {
    if (item.rate > maxUnitPrice) {
      anomalies.push({
        type: 'high_unit_price',
        severity: 'high',
        title: `High Unit Price: ${item.desc}`,
        desc: `Unit price of ₹${item.rate.toLocaleString('en-IN')} exceeds the ₹${maxUnitPrice.toLocaleString('en-IN')} threshold.`,
      })
    }
  })

  // Missing PO reference — only flag if truly missing
  if (!invoice.poRef || invoice.poRef === 'N/A' || invoice.poRef === 'null') {
    anomalies.push({
      type: 'missing_po',
      severity: 'high',
      title: 'No Purchase Order Reference',
      desc: 'Invoice has no PO reference number. All invoices must be linked to an approved purchase order.',
    })
  }

  return {
    anomalies,
    count: anomalies.length,
    hasHighSeverity: anomalies.some(a => a.severity === 'high'),
  }
}