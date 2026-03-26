import React, { useState } from 'react'
import Header from './components/layout/Header.jsx'
import InvoiceUploader from './components/upload/InvoiceUploader.jsx'
import SampleLoader from './components/upload/SampleLoader.jsx'
import ExtractionResult from './components/extraction/ExtractionResult.jsx'
import MatchScoreCard from './components/reconciliation/MatchScoreCard.jsx'
import ReconciliationDashboard from './components/reconciliation/ReconciliationDashboard.jsx'
import ExportReport from './components/export/ExportReport.jsx'
import { useInvoiceProcessor } from './hooks/useInvoiceProcessor.js'
import { useReconciliation } from './hooks/useReconciliation.js'
import { getProcessedInvoices } from './engine/duplicateDetector.js'

export default function App() {
  const [activePage, setActivePage] = useState('process')
  const { invoice, po, grn, loading, loadingMsg, error, scenarioKey, processFile, loadSample, reset } = useInvoiceProcessor()
  const result = useReconciliation(invoice, po, grn)
  const history = getProcessedInvoices()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Header activePage={activePage} setActivePage={setActivePage} historyCount={history.length} />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 'calc(100vh - 60px)' }}>

        {/* SIDEBAR */}
        <div style={{ background: 'var(--cream-dark)', borderRight: '1px solid var(--cream-deep)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          <InvoiceUploader onFileSelect={processFile} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--cream-deep)' }} />
            <span style={{ fontSize: '10px', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace' }}>or try a demo</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--cream-deep)' }} />
          </div>

          <SampleLoader onLoad={loadSample} />

          {history.length > 0 && (
            <div style={{ padding: '10px 12px', background: 'var(--navy-light)', borderRadius: '8px', border: '1px solid rgba(30,58,95,0.1)' }}>
              <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: 'var(--navy)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Session History</div>
              {history.map((h, i) => (
                <div key={i} style={{ fontSize: '10px', color: 'var(--ink-muted)', padding: '2px 0', fontFamily: 'DM Mono, monospace' }}>{h.invoiceNo}</div>
              ))}
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ padding: '2rem', overflowY: 'auto' }}>

          {/* LOADING */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
              <div style={{ width: '38px', height: '38px', border: '3px solid var(--cream-deep)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--ink-light)', letterSpacing: '0.5px' }}>{loadingMsg}</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div style={{ background: 'var(--mismatch-bg)', border: '1px solid rgba(153,27,27,0.2)', borderLeft: '3px solid var(--mismatch)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mismatch)', marginBottom: '4px' }}>Error</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{error}</div>
              <button onClick={reset} style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--mismatch)', color: 'var(--mismatch)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Try Again</button>
            </div>
          )}

          {/* WELCOME */}
          {!loading && !error && !invoice && activePage === 'process' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '1rem' }}>
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none" style={{ opacity: 0.12 }}>
                <path d="M10 60 C30 40 70 20 100 30" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
                <path d="M90 22 L102 32 L90 36" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20 C18 20 16 22 16 30 L16 38 C16 43 14 45 14 45 C14 45 16 47 16 52 L16 58 C16 62 18 62 20 62" stroke="#2D5016" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '32px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-1px', maxWidth: '460px' }}>
                Invoice reconciliation,<br /><em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>finally intelligent.</em>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--ink-muted)', maxWidth: '360px', lineHeight: 1.6 }}>
                Upload a physical invoice or pick a demo scenario to see AI-powered three-way matching, math verification, and fraud detection in action.
              </div>
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '13px', color: 'var(--ink-light)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.5rem' }}>
                ← pick a scenario to begin
              </div>
            </div>
          )}

          {/* RESULTS */}
          {!loading && !error && invoice && result && activePage === 'process' && (
            <div>
              {/* DUPLICATE ALERT */}
              {result.isDuplicate && (
                <div style={{ background: 'var(--amber-light)', border: '1px solid rgba(146,64,14,0.2)', borderLeft: '3px solid var(--amber-mid)', borderRadius: '8px', padding: '11px 13px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>🔁</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--amber)', marginBottom: '2px' }}>Duplicate Invoice Detected</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                      Invoice <strong>{invoice.invoiceNo}</strong> has already been processed this session. Flag for human review before approving payment.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP INDICATOR */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
                {[['1', 'Upload', 'done'], ['2', 'Extract', 'done'], ['3', 'Reconcile', 'done'], ['4', 'Review', 'active']].map(([n, l, s], i, arr) => (
                  <React.Fragment key={n}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: s === 'done' ? 'var(--navy)' : s === 'active' ? 'var(--forest-mid)' : 'var(--cream-deep)', color: s === 'done' || s === 'active' ? 'var(--cream)' : 'var(--ink-light)', fontFamily: 'DM Mono, monospace', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {s === 'done' ? '✓' : n}
                      </div>
                      <span style={{ fontSize: '10px', color: s === 'active' ? 'var(--ink)' : 'var(--ink-light)', fontWeight: s === 'active' ? 500 : 400 }}>{l}</span>
                    </div>
                    {i < arr.length - 1 && <div style={{ flex: 1, height: '1px', background: s === 'done' ? 'var(--navy)' : 'var(--cream-deep)', margin: '0 6px' }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* SCORE CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Total Fields', value: result.totalFields, color: 'var(--navy)' },
                  { label: 'Matched', value: result.matchedCount, color: 'var(--forest-mid)' },
                  { label: 'Discrepancies', value: result.discrepancyCount, color: 'var(--sienna-mid)' },
                  { label: 'Flags', value: result.flagCount, color: 'var(--amber-mid)' },
                ].map(c => (
                  <div key={c.label} style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center', borderTop: `3px solid ${c.color}` }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '24px', fontWeight: 500, lineHeight: 1, marginBottom: '3px', color: c.color }}>{c.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-light)' }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* TWO COLUMN LAYOUT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
                <div>
                  <MatchScoreCard score={result.score} invoice={invoice} scenarioKey={scenarioKey} />
                  <ExtractionResult invoice={invoice} scenarioKey={scenarioKey} />
                </div>
                <div>
                  <ReconciliationDashboard invoice={invoice} po={po} grn={grn} result={result} />
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                <ExportReport invoice={invoice} po={po} result={result} />
                <button onClick={reset} style={{ background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--cream-deep)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Geist, sans-serif', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  ↩ Process Another
                </button>
              </div>
            </div>
          )}

          {/* HISTORY PAGE */}
          {activePage === 'history' && !loading && (
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Session History</div>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-light)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.35 }}>📋</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontStyle: 'italic' }}>No invoices processed yet</div>
                </div>
              ) : (
                <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        {['Invoice No.', 'Vendor', 'Total', 'Processed At'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '7px 10px', background: 'var(--cream-dark)', fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink-light)', fontWeight: 400, borderBottom: '1px solid var(--cream-deep)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i}>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', fontFamily: 'DM Mono, monospace' }}>{h.invoiceNo}</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)' }}>{h.vendor}</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', fontFamily: 'DM Mono, monospace' }}>₹{h.total?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--cream-deep)', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace', fontSize: '10px' }}>{new Date(h.processedAt).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}