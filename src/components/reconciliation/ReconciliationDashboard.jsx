import React, { useState } from 'react'
import ThreeWayMatch from './ThreeWayMatch.jsx'
import DiscrepancyPanel from './DiscrepancyPanel.jsx'

export default function ReconciliationDashboard({ invoice, po, grn, result }) {
  const [activeTab, setActiveTab] = useState('threeway')

  const tabs = [
    { id: 'threeway', label: 'Three-Way Match' },
    { id: 'audit',    label: 'Audit Trail' },
    { id: 'math',     label: 'Math Check' },
    { id: 'rules',    label: 'Business Rules' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', background: 'var(--cream-dark)', borderRadius: '7px', padding: '3px', marginBottom: '1rem', width: 'fit-content', gap: '2px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '6px 14px', fontSize: '11px',
            fontFamily: 'DM Mono, monospace',
            color: activeTab === t.id ? 'var(--ink)' : 'var(--ink-light)',
            cursor: 'pointer', borderRadius: '5px',
            border: 'none',
            background: activeTab === t.id ? 'var(--cream)' : 'transparent',
            boxShadow: activeTab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.12s',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'threeway' && (
        <ThreeWayMatch invoice={invoice} po={po} grn={grn} lineResults={result.lineResults} />
      )}

      {activeTab === 'audit' && (
        <DiscrepancyPanel discrepancies={result.discrepancies} flags={result.math.results.filter(r => !r.pass).map(r => ({ field: r.label, reason: `Stated: ₹${r.stated.toLocaleString('en-IN')} | Calculated: ₹${r.calculated.toLocaleString('en-IN')}`, correction: `₹${r.calculated.toLocaleString('en-IN')}` }))} />
      )}

      {activeTab === 'math' && (
        <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, marginBottom: '3px' }}>🔢 Mathematical Verification</div>
          <div style={{ fontSize: '11px', color: 'var(--ink-light)', marginBottom: '0.9rem' }}>All arithmetic independently recalculated</div>
          {result.math.results.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--cream-deep)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{m.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>Calculated: ₹{m.calculated.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>₹{m.stated.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '16px' }}>{m.pass ? '✅' : '❌'}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '12px', padding: '10px 12px', background: result.math.allPass ? 'var(--match-bg)' : 'var(--sienna-light)', borderRadius: '8px', borderLeft: result.math.allPass ? 'none' : '3px solid var(--sienna-mid)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: result.math.allPass ? 'var(--match)' : 'var(--sienna)' }}>
              {result.math.allPass ? '✓ All calculations verified' : `⚠ ${result.math.errorCount} arithmetic error${result.math.errorCount > 1 ? 's' : ''} detected — do not approve for payment`}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div>
          <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, marginBottom: '3px' }}>📋 Business Rules</div>
            <div style={{ fontSize: '11px', color: 'var(--ink-light)', marginBottom: '0.9rem' }}>Checked against company policy and master data</div>
            {result.rules.checks.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--cream-deep)' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{r.pass ? '✅' : '❌'}</span>
                <span style={{ fontSize: '12px', color: 'var(--ink)', flex: 1 }}>{r.name}</span>
                <span style={{ fontSize: '10px', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace' }}>{r.detail}</span>
              </div>
            ))}
          </div>
          {result.anomalies.count > 0 && (
            <div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.6rem' }}>Anomalies Detected</div>
              {result.anomalies.anomalies.map((a, i) => (
                <div key={i} style={{ background: 'var(--sienna-light)', border: '1px solid rgba(154,52,18,0.15)', borderLeft: '3px solid var(--sienna-mid)', borderRadius: '8px', padding: '10px 13px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sienna)', marginBottom: '3px' }}>⚠ {a.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}