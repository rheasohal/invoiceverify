import React from 'react'

export default function DiscrepancyPanel({ discrepancies, flags }) {
  const hasIssues = discrepancies.length > 0 || flags.length > 0

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, marginBottom: '3px' }}>📝 Audit Trail</div>
      <div style={{ fontSize: '11px', color: 'var(--ink-light)', marginBottom: '0.9rem' }}>Every flagged field with source values</div>

      {!hasIssues ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-light)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.4 }}>✓</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '14px', fontStyle: 'italic' }}>No discrepancies found</div>
        </div>
      ) : (
        <>
          {discrepancies.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--cream-deep)' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--mismatch-bg)', color: 'var(--mismatch)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>✕</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{d.field}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-light)', lineHeight: 1.5, marginBottom: '5px' }}>Value mismatch between invoice and purchase order</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: 'var(--mismatch-bg)', color: 'var(--mismatch)', fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>Invoice: {d.invoiceVal}</span>
                  <span style={{ fontSize: '10px', color: 'var(--ink-light)' }}>→</span>
                  <span style={{ background: 'var(--match-bg)', color: 'var(--match)', fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>PO: {d.poVal}</span>
                  <span style={{ background: d.severity === 'high' ? 'var(--mismatch-bg)' : 'var(--partial-bg)', color: d.severity === 'high' ? 'var(--mismatch)' : 'var(--partial)', fontFamily: 'DM Mono, monospace', fontSize: '9px', padding: '2px 6px', borderRadius: '4px' }}>{d.severity}</span>
                </div>
              </div>
            </div>
          ))}
          {flags.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--cream-deep)' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--amber-light)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>{f.icon || '⚠'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{f.field}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-light)', lineHeight: 1.5 }}>{f.reason}</div>
                {f.correction && (
                  <div style={{ marginTop: '5px' }}>
                    <span style={{ background: 'var(--navy-light)', color: 'var(--navy)', fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>Corrected: {f.correction}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}