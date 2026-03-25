import { APPROVED_VENDORS, BUSINESS_RULES } from '../data/masterData.js'

export function validateBusinessRules(invoice, po) {
  const checks = []

  // Vendor in approved list
  const vendorApproved = APPROVED_VENDORS.some(v =>
    invoice.vendor.toLowerCase().includes(v.split(' ')[0].toLowerCase())
  )
  checks.push({
    name: 'Vendor in approved master list',
    pass: vendorApproved,
    detail: vendorApproved ? invoice.vendor : `"${invoice.vendor}" not found in master list`,
    severity: 'high',
  })

  // GST rate is correct
  const gstCorrect = invoice.taxRate === BUSINESS_RULES.gstRate
  checks.push({
    name: `GST rate is ${BUSINESS_RULES.gstRate}%`,
    pass: gstCorrect,
    detail: gstCorrect ? `${invoice.taxRate}% ✓` : `Found ${invoice.taxRate}%, expected ${BUSINESS_RULES.gstRate}%`,
    severity: 'high',
  })

  // PO reference exists
  const hasPO = !!invoice.poRef && !!po
  checks.push({
    name: 'Purchase Order reference present',
    pass: hasPO,
    detail: hasPO ? invoice.poRef : 'No matching PO found',
    severity: 'high',
  })

  // Invoice date is valid
  const hasDate = !!invoice.date
  const dateValid = hasDate && new Date(invoice.date) <= new Date()
  checks.push({
    name: 'Invoice date is valid',
    pass: dateValid,
    detail: dateValid ? invoice.date : 'Invalid or future date',
    severity: 'medium',
  })

  // Invoice date not before PO date
  if (po && po.date) {
    const invoiceAfterPO = new Date(invoice.date) >= new Date(po.date)
    checks.push({
      name: 'Invoice date is after PO date',
      pass: invoiceAfterPO,
      detail: invoiceAfterPO
        ? `Invoice: ${invoice.date} | PO: ${po.date}`
        : `Invoice (${invoice.date}) predates PO (${po.date})`,
      severity: 'high',
    })
  }

  // Payment terms within policy
  const termsValid = BUSINESS_RULES.allowedPaymentTerms.includes(invoice.paymentTerms)
  checks.push({
    name: 'Payment terms within policy',
    pass: termsValid,
    detail: termsValid
      ? invoice.paymentTerms
      : `"${invoice.paymentTerms}" not in allowed terms: ${BUSINESS_RULES.allowedPaymentTerms.join(', ')}`,
    severity: 'medium',
  })

  // Payment terms match PO
  if (po) {
    const termsMatch = invoice.paymentTerms === po.paymentTerms
    checks.push({
      name: 'Payment terms match PO',
      pass: termsMatch,
      detail: termsMatch
        ? invoice.paymentTerms
        : `Invoice: ${invoice.paymentTerms} | PO: ${po.paymentTerms}`,
      severity: 'medium',
    })
  }

  // No unit price exceeds max
  const highPrice = invoice.items.find(i => i.rate > BUSINESS_RULES.maxUnitPrice)
  checks.push({
    name: 'Unit prices within acceptable range',
    pass: !highPrice,
    detail: highPrice
      ? `${highPrice.desc} at ₹${highPrice.rate.toLocaleString('en-IN')} exceeds limit`
      : 'All unit prices within range',
    severity: 'low',
  })

  const passCount = checks.filter(c => c.pass).length
  const failCount = checks.filter(c => !c.pass).length

  return { checks, passCount, failCount, allPass: failCount === 0 }
}