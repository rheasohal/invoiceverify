export function verifyMath(invoice) {
  const results = []

  // Check each line item: qty × rate = amount
  invoice.items.forEach((item, i) => {
    const calculated = parseFloat((item.qty * item.rate).toFixed(2))
    const stated = parseFloat(item.amount.toFixed(2))
    const pass = Math.abs(calculated - stated) < 0.01
    results.push({
      label: `Line ${i + 1}: ${item.desc}`,
      type: 'line_item',
      stated,
      calculated,
      pass,
      difference: parseFloat(Math.abs(calculated - stated).toFixed(2)),
    })
  })

  // Check subtotal = sum of line amounts
  const calcSubtotal = parseFloat(
    invoice.items.reduce((sum, item) => sum + item.qty * item.rate, 0).toFixed(2)
  )
  const statedSubtotal = parseFloat(invoice.subtotal.toFixed(2))
  results.push({
    label: 'Sum of line items → Subtotal',
    type: 'subtotal',
    stated: statedSubtotal,
    calculated: calcSubtotal,
    pass: Math.abs(calcSubtotal - statedSubtotal) < 0.01,
    difference: parseFloat(Math.abs(calcSubtotal - statedSubtotal).toFixed(2)),
  })

  // Check tax = subtotal × taxRate / 100
  const calcTax = parseFloat((calcSubtotal * (invoice.taxRate / 100)).toFixed(2))
  const statedTax = parseFloat(invoice.tax.toFixed(2))
  results.push({
    label: `GST @ ${invoice.taxRate}% on Subtotal`,
    type: 'tax',
    stated: statedTax,
    calculated: calcTax,
    pass: Math.abs(calcTax - statedTax) < 1,
    difference: parseFloat(Math.abs(calcTax - statedTax).toFixed(2)),
  })

  // Check total = subtotal + tax
  const calcTotal = parseFloat((calcSubtotal + calcTax).toFixed(2))
  const statedTotal = parseFloat(invoice.total.toFixed(2))
  results.push({
    label: 'Subtotal + GST → Grand Total',
    type: 'total',
    stated: statedTotal,
    calculated: calcTotal,
    pass: Math.abs(calcTotal - statedTotal) < 0.01,
    difference: parseFloat(Math.abs(calcTotal - statedTotal).toFixed(2)),
  })

  const allPass = results.every(r => r.pass)
  const errorCount = results.filter(r => !r.pass).length

  return { results, allPass, errorCount, correctedTotal: calcTotal }
}