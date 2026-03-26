import React from 'react'

export default function MatchScoreCard({ score, invoice, scenarioKey }) {
  const color = score >= 80 ? 'var(--match)' : score >= 50 ? 'var(--amber-mid)' : 'var(--mismatch)'
  const label = score >= 80 ? 'Approved for Review' : score >= 50 ? 'Partial Match' : 'Requires Attention'
  const badgeBg = score >= 80 ? 'var(--match-bg)' : score >= 50 ? 'var(--partial-bg)' : 'var(--mismatch-bg)'

  const r = 44
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
          {invoice.vendor}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--ink-light)', marginBottom: '8px', fontFamily: 'DM Mono, monospace' }}>
          {invoice.invoiceNo} · {invoice.date}
        </div>
        <span style={{ background: badgeBg, color, fontSize: '10px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '20px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
          <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--cream-deep)" strokeWidth="8" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
              strokeDasharray={c} strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: '18px', fontWeight: 500, color }}>
            {score}%
          </div>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--ink-light)', textAlign: 'center', marginTop: '4px', lineHeight: 1.4 }}>
          Reconciliation<br />Score
        </div>
      </div>
    </div>
  )
}