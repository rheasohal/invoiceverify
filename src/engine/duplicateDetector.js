let processedInvoices = new Map()

export function checkDuplicate(invoice) {
  const key = invoice.invoiceNo?.trim().toLowerCase()
  if (!key || key === 'n/a' || key === 'null') {
    return { isDuplicate: false, previousEntry: null }
  }
  if (processedInvoices.has(key)) {
    return { isDuplicate: true, previousEntry: processedInvoices.get(key) }
  }
  return { isDuplicate: false, previousEntry: null }
}

export function registerInvoice(invoice) {
  let key = invoice.invoiceNo?.trim().toLowerCase()
  // For invoices without a number, generate a deterministic key from vendor + total
  if (!key || key === 'n/a' || key === 'null') {
    key = `${(invoice.vendor || 'unknown').toLowerCase()}_${invoice.total || 0}`
  }
  processedInvoices.set(key, {
    invoiceNo: invoice.invoiceNo !== 'N/A' ? invoice.invoiceNo : `${invoice.vendor} (no #)`,
    vendor: invoice.vendor,
    total: invoice.total,
    processedAt: new Date().toISOString(),
  })
}

export function getProcessedInvoices() {
  return Array.from(processedInvoices.values())
}

export function clearHistory() {
  processedInvoices = new Map()
}