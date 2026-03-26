import React from 'react'

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CONFIDENCES = {
  clean:       { vendor: 99, invoiceNo: 99, date: 98, total: 99 },
  handwritten: { vendor: 82, invoiceNo: 74, date: 88, total: 79 },
  mismatch:    { vendor: 97, invoiceNo: 99, date: 98, total: 99 },
  math:        { vendor: 96, invoiceNo: 99, date: 97, total: 99 },
  duplicate:   { vendor: 99, invoiceNo: 99, date: 98, total: 99 },
}

function confColor(v) {
  return v >= 90 ? 'var(--match)' : v >= 70 ? 'var(--amber-mid)' : 'var(--mismatch)'
}

export default function ExtractionResult({ invoice, scenarioKey }) {
  const conf = CONFIDENCES[scenarioKey] || CONFIDENCES.clean

  const fields = [
    { key: 'Vendor',          val: invoice.vendor,                    conf: conf.vendor },
    { key: 'Invoice No.',     val: invoice.invoiceNo,                 conf: conf.invoiceNo },
    { key: 'Invoice Date',    val: invoice.date,                      conf: conf.date },
    { key: 'Due Date',        val: invoice.dueDate || '—',            conf: 95 },
    { key: 'PO Reference',    val: invoice.poRef || '—',              conf: 98 },
    { key: 'Payment Terms',   val: invoice.paymentTerms || '—',       conf: 95 },
    { key: 'Tax Rate',        val: `${invoice.taxRate}% GST`,         conf: 99 },
    { key: 'Grand Total',     val: fmt(invoice.total),                conf: conf.total },
  ]

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600 }}>📋 Extracted Data</div>
        {invoice.isHandwritten && (
          <span style={{ background: 'var(--partial-bg)', color: 'var(--partial)', fontSize: '10px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '20px' }}>
            Handwritten
          </span>
        )}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--ink-light)', marginBottom: '0.9rem' }}>
        AI-extracted fields with per-field confidence scores
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
        {fields.map(f => (
          <div key={f.key} style={{ background: 'var(--cream-dark)', borderRadius: '7px', padding: '9px 11px', border: '1px solid var(--cream-deep)' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '3px' }}>
              {f.key}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {f.val}
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: confColor(f.conf), flexShrink: 0, display: 'inline-block' }} title={`${f.conf}% confidence`} />
            </div>
            <div style={{ height: '4px', background: 'var(--cream-deep)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ height: '100%', width: f.conf + '%', background: confColor(f.conf), borderRadius: '2px', opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '8px' }}>
        Line Items
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            {['Description', 'Qty', 'Rate', 'Amount'].map(h => (
              <th key={h} style={{ textAlign: h === 'Description' ? 'left' : 'right', padding: '7px 10px', background: 'var(--cream-dark)', fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink-light)', fontWeight: 400, borderBottom: '1px solid var(--cream-deep)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)' }}>{item.desc}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{item.qty}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{fmt(item.rate)}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{fmt(item.amount)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--ink-muted)' }}>Subtotal</td>
            <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{fmt(invoice.subtotal)}</td>
          </tr>
          <tr>
            <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--ink-muted)' }}>GST ({invoice.taxRate}%)</td>
            <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{fmt(invoice.tax)}</td>
          </tr>
          <tr style={{ background: 'var(--navy-light)' }}>
            <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 600 }}>Total</td>
            <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--navy)' }}>{fmt(invoice.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}