const processedInvoices = new Map()

export function checkDuplicate(invoice) {
  const key = invoice.invoiceNo?.trim().toLowerCase()

  if (!key) {
    return { isDuplicate: false, previousEntry: null }
  }

  if (processedInvoices.has(key)) {
    return {
      isDuplicate: true,
      previousEntry: processedInvoices.get(key),
    }
  }

  return { isDuplicate: false, previousEntry: null }
}

export function registerInvoice(invoice) {
  const key = invoice.invoiceNo?.trim().toLowerCase()
  if (key) {
    processedInvoices.set(key, {
      invoiceNo: invoice.invoiceNo,
      vendor: invoice.vendor,
      total: invoice.total,
      processedAt: new Date().toISOString(),
    })
  }
}

export function getProcessedInvoices() {
  return Array.from(processedInvoices.values())
}

export function clearHistory() {
  processedInvoices.clear()
}