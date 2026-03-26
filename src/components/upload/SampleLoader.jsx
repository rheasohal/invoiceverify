import React from 'react'

const SCENARIOS = [
  { key: 'clean', name: 'Clean Printed Invoice', desc: 'PDF · Perfect match', icon: '📄', bg: '#EBF2FA', badge: 'MATCH', badgeBg: '#DCFCE7', badgeColor: '#166534' },
  { key: 'handwritten', name: 'Handwritten Invoice', desc: 'JPEG · Messy but readable', icon: '✍️', bg: '#EAF3DE', badge: 'MATCH', badgeBg: '#DCFCE7', badgeColor: '#166534' },
  { key: 'mismatch', name: 'PO Mismatch Invoice', desc: 'PDF · Discrepancies found', icon: '⚠️', bg: '#FEF9C3', badge: 'MISMATCH', badgeBg: '#FEE2E2', badgeColor: '#991B1B' },
  { key: 'math', name: 'Math Error Invoice', desc: 'PDF · Incorrect calculations', icon: '🔢', bg: '#FEF0E8', badge: 'ERROR', badgeBg: '#FEF0E8', badgeColor: '#9A3412' },
  { key: 'duplicate', name: 'Duplicate Invoice', desc: 'PDF · Already processed', icon: '🔁', bg: '#F5F0E8', badge: 'DUPLICATE', badgeBg: '#FEF9C3', badgeColor: '#92400E' },
]

export default function SampleLoader({ onLoad }) {
  return (
    <div>
      <div style={{
        fontFamily: 'DM Mono, monospace', fontSize: '10px',
        letterSpacing: '1.5px', textTransform: 'uppercase',
        color: 'var(--ink-light)', marginBottom: '0.6rem',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        Demo Scenarios
        <span style={{ flex: 1, height: '1px', background: 'var(--cream-deep)', display: 'block' }} />
      </div>
      {SCENARIOS.map(s => (
        <button
          key={s.key}
          onClick={() => onLoad(s.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 11px',
            background: 'var(--cream)',
            border: '1px solid var(--cream-deep)',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            marginBottom: '5px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-light)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cream)'}
        >
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>
            {s.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>{s.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace' }}>{s.desc}</div>
          </div>
          <span style={{
            background: s.badgeBg, color: s.badgeColor,
            fontSize: '9px', fontFamily: 'DM Mono, monospace',
            padding: '2px 7px', borderRadius: '4px',
            flexShrink: 0, fontWeight: 500,
          }}>{s.badge}</span>
        </button>
      ))}
    </div>
  )
}