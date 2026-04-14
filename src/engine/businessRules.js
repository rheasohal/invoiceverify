export function validateBusinessRules(invoice, po, userRules) {
  const checks = []

// Vendor approval check — only run if user has vendors configured
if (userRules?._vendors && userRules._vendors.length > 0) {
  const vendorApproved = userRules._vendors.some(v =>
    invoice.vendor?.toLowerCase().includes(v.toLowerCase().split(' ')[0])
  )
  checks.push({
    name: 'Vendor in approved list',
    pass: vendorApproved,
    detail: vendorApproved ? invoice.vendor : `"${invoice.vendor}" not in approved vendor list`,
    severity: 'high',
  })
}

  // Get rules from user settings or use defaults
  const gstRate = Number(userRules?.gst_rate || 18)
  const allowedTerms = (userRules?.allowed_payment_terms || 'Net 30,Net 45,Net 60').split(',').map(t => t.trim())
  const maxUnitPrice = Number(userRules?.max_unit_price || 100000)

  // GST rate check
  const gstCorrect = invoice.taxRate === gstRate
  checks.push({
    name: `GST rate is ${gstRate}%`,
    pass: gstCorrect,
    detail: gstCorrect ? `${invoice.taxRate}% ✓` : `Found ${invoice.taxRate}%, expected ${gstRate}%`,
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
  const dateValid = !!invoice.date && invoice.date !== 'N/A'
  checks.push({
    name: 'Invoice date is valid',
    pass: dateValid,
    detail: dateValid ? invoice.date : 'Invalid or missing date',
    severity: 'medium',
  })

  // Invoice date not before PO date
  if (po && po.date && invoice.date && invoice.date !== 'N/A') {
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
  const termsValid = !invoice.paymentTerms || allowedTerms.includes(invoice.paymentTerms)
  checks.push({
    name: 'Payment terms within policy',
    pass: termsValid,
    detail: termsValid
      ? invoice.paymentTerms || 'N/A'
      : `"${invoice.paymentTerms}" not in allowed terms`,
    severity: 'medium',
  })

  // Payment terms match PO
  if (po && invoice.paymentTerms && po.paymentTerms) {
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

  // Unit price check
  const highPrice = invoice.items?.find(i => i.rate > maxUnitPrice)
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