import React from 'react'

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ExportReport({ invoice, po, result }) {
  const handleExport = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFillColor(30, 58, 95)
    doc.rect(0, 0, pageWidth, 28, 'F')
    doc.setTextColor(245, 240, 232)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('InvoiceVerify — Reconciliation Report', 14, 12)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 22)

    // Score badge
    const scoreColor = result.score >= 80 ? [22, 101, 52] : result.score >= 50 ? [146, 64, 14] : [153, 27, 27]
    doc.setFillColor(...scoreColor)
    doc.roundedRect(pageWidth - 50, 6, 36, 16, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`${result.score}%`, pageWidth - 32, 17, { align: 'center' })

    // Invoice details
    doc.setTextColor(28, 25, 23)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Invoice Details', 14, 40)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const details = [
      ['Vendor', invoice.vendor],
      ['Invoice No.', invoice.invoiceNo],
      ['Invoice Date', invoice.date],
      ['PO Reference', invoice.poRef || '—'],
      ['Payment Terms', invoice.paymentTerms],
      ['Grand Total', fmt(invoice.total)],
    ]
    details.forEach(([label, value], i) => {
      const y = 48 + i * 7
      doc.setTextColor(120, 113, 108)
      doc.text(label, 14, y)
      doc.setTextColor(28, 25, 23)
      doc.text(value, 70, y)
    })

    // Summary
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(28, 25, 23)
    doc.text('Reconciliation Summary', 14, 100)

    autoTable(doc, {
      startY: 106,
      head: [['Metric', 'Value']],
      body: [
        ['Reconciliation Score', `${result.score}%`],
        ['Total Fields Checked', result.totalFields],
        ['Matched Fields', result.matchedFields],
        ['Discrepancies Found', result.discrepancyCount],
        ['Math Errors', result.math.errorCount],
        ['Business Rule Failures', result.rules.failCount],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [30, 58, 95], textColor: [245, 240, 232] },
      alternateRowStyles: { fillColor: [237, 230, 214] },
    })

    // Line items
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Line Item Reconciliation', 14, doc.lastAutoTable.finalY + 14)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Description', 'Inv Qty', 'PO Qty', 'Inv Rate', 'PO Rate', 'Status']],
      body: result.lineResults.map(r => [
        r.desc,
        r.invQty ?? '—',
        r.poQty,
        r.invRate != null ? fmt(r.invRate) : '—',
        fmt(r.poRate),
        r.status.toUpperCase(),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 58, 95], textColor: [245, 240, 232] },
      alternateRowStyles: { fillColor: [237, 230, 214] },
      columnStyles: { 5: { fontStyle: 'bold' } },
    })

    // Discrepancies
    if (result.discrepancies.length > 0) {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Discrepancies', 14, doc.lastAutoTable.finalY + 14)

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Field', 'Invoice Value', 'Expected Value', 'Severity']],
        body: result.discrepancies.map(d => [d.field, d.invoiceVal, d.poVal, d.severity.toUpperCase()]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [154, 52, 18], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [254, 240, 232] },
      })
    }

    // Math verification
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Mathematical Verification', 14, doc.lastAutoTable.finalY + 14)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Check', 'Stated Amount', 'Calculated Amount', 'Pass']],
      body: result.math.results.map(m => [
        m.label,
        fmt(m.stated),
        fmt(m.calculated),
        m.pass ? 'PASS ✓' : 'FAIL ✗',
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [45, 80, 22], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [234, 243, 222] },
    })

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(120, 113, 108)
      doc.text(`InvoiceVerify AI Reconciliation · Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' })
    }

    doc.save(`reconciliation-${invoice.invoiceNo}-${Date.now()}.pdf`)
  }

  return (
    <button onClick={handleExport} style={{
      background: 'var(--navy)', color: 'var(--cream)',
      border: 'none', padding: '9px 18px',
      borderRadius: '8px', fontSize: '12px',
      fontFamily: 'Geist, sans-serif', fontWeight: 500,
      cursor: 'pointer', display: 'inline-flex',
      alignItems: 'center', gap: '6px',
    }}>
      📥 Export Report
    </button>
  )
}