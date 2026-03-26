import React from 'react'

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ThreeWayMatch({ invoice, po, grn, lineResults }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'var(--cream-deep)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
        {[
          { label: 'Invoice', color: 'var(--navy)', items: invoice.items.map(i => ({ name: i.desc, val: `${i.qty} × ${fmt(i.rate)}` })) },
          { label: 'Purchase Order', color: 'var(--forest-mid)', items: po?.items.map((i, idx) => {
            const inv = invoice.items[idx]
            const match = inv && inv.qty === i.qty && inv.rate === i.rate
            return { name: i.desc, val: `${i.qty} × ${fmt(i.rate)}`, match }
          }) || [] },
          { label: 'GRN', color: 'var(--amber-mid)', items: grn?.receivedItems.map(i => ({ name: i.desc, val: `${i.qtyReceived} received` })) || null },
        ].map(col => (
          <div key={col.label} style={{ background: 'var(--cream)', padding: '0.9rem' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.color, display: 'inline-block' }} />
              {col.label}
            </div>
            {col.items === null ? (
              <div style={{ fontSize: '11px', color: 'var(--ink-light)', fontStyle: 'italic' }}>No GRN linked</div>
            ) : col.items.map((item, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--ink)', fontWeight: 500, marginBottom: '2px' }}>{item.name}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: item.match === false ? 'var(--sienna-mid)' : item.match === true ? 'var(--match)' : 'var(--ink-muted)' }}>
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, marginBottom: '0.9rem' }}>
          Line Item Status
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              {['Item', 'Inv Qty', 'PO Qty', 'Inv Rate', 'PO Rate', 'Status'].map(h => (
                <th key={h} style={{ textAlign: h === 'Item' ? 'left' : 'right', padding: '7px 10px', background: 'var(--cream-dark)', fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink-light)', fontWeight: 400, borderBottom: '1px solid var(--cream-deep)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineResults.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', maxWidth: '160px', fontSize: '11px' }}>{r.desc}</td>
                <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{r.invQty ?? '—'}</td>
                <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{r.poQty}</td>
                <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{