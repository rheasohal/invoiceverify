import React, { useState } from 'react'
import Header from './components/layout/Header.jsx'
import InvoiceUploader from './components/upload/InvoiceUploader.jsx'
import SampleLoader from './components/upload/SampleLoader.jsx'
import ExtractionResult from './components/extraction/ExtractionResult.jsx'
import MatchScoreCard from './components/reconciliation/MatchScoreCard.jsx'
import ReconciliationDashboard from './components/reconciliation/ReconciliationDashboard.jsx'
import ExportReport from './components/export/ExportReport.jsx'
import POManager from './components/po/POManager.jsx'
import SettingsPage from './components/settings/SettingsPage.jsx'
import LoginPage from './components/auth/LoginPage.jsx'
import { useInvoiceProcessor } from './hooks/useInvoiceProcessor.js'
import { useReconciliation } from './hooks/useReconciliation.js'
import { usePOStore } from './hooks/usePOStore.js'
import { useAuth } from './hooks/useAuth.js'
import { useSettings } from './hooks/useSettings.js'
import { getProcessedInvoices, clearHistory } from './engine/duplicateDetector.js'

export default function App() {
  const [activePage, setActivePage] = useState('process')
  const [processedSet, setProcessedSet] = useState(new Set())

  const { user, token, loading: authLoading, login, register, logout } = useAuth()
  const { rules, vendors } = useSettings(token)
  const { pos, grns, loading: poLoading, addPO, removePO, addGRN } = usePOStore(token)
  const { invoice, po, grn, loading, loadingMsg, error, scenarioKey, processFile, loadSample, reset } = useInvoiceProcessor(token, pos, grns)

  const enrichedRules = rules ? { ...rules, _vendors: vendors.map(v => v.vendor_name) } : null
  const result = useReconciliation(invoice, po, grn, enrichedRules, processedSet, setProcessedSet)
  const history = getProcessedInvoices()

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '38px', height: '38px', border: '3px solid var(--cream-deep)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!user) return <LoginPage onLogin={login} onRegister={register} />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        historyCount={history.length}
        poCount={pos.length}
        user={user}
        onLogout={() => { setProcessedSet(new Set()); logout(); }}
      />

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

        {/* MAIN */}
        <div style={{ padding: '2rem', overflowY: 'auto' }}>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
              <div style={{ width: '38px', height: '38px', border: '3px solid var(--cream-deep)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--ink-light)' }}>{loadingMsg}</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {!loading && error && (
            <div style={{ background: 'var(--mismatch-bg)', border: '1px solid rgba(153,27,27,0.2)', borderLeft: '3px solid var(--mismatch)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mismatch)', marginBottom: '4px' }}>Error</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{error}</div>
              <button onClick={reset} style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--mismatch)', color: 'var(--mismatch)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Try Again</button>
            </div>
          )}

          {!loading && !error && !invoice && activePage === 'process' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '1rem' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '32px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-1px', maxWidth: '460px' }}>
                Welcome back, <em style={{ fontStyle: 'italic', color: 'var(--navy)' }}>{user.name}.</em>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--ink-muted)', maxWidth: '360px', lineHeight: 1.6 }}>
                Upload an invoice or pick a demo scenario to begin reconciliation.
              </div>
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '13px', color: 'var(--ink-light)' }}>
                ← pick a scenario to begin
              </div>
            </div>
          )}

          {!loading && !error && invoice && result && activePage === 'process' && (
            <div>
              {result.isDuplicate && (
                <div style={{ background: 'var(--amber-light)', border: '1px solid rgba(146,64,14,0.2)', borderLeft: '3px solid var(--amber-mid)', borderRadius: '8px', padding: '11px 13px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>🔁</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--amber)', marginBottom: '2px' }}>Duplicate Invoice Detected</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>Invoice <strong>{invoice.invoiceNo}</strong> has already been processed this session.</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
                {[['1','Upload','done'],['2','Extract','done'],['3','Reconcile','done'],['4','Review','active']].map(([n,l,s],i,arr) => (
                  <React.Fragment key={n}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: s==='done'?'var(--navy)':s==='active'?'var(--forest-mid)':'var(--cream-deep)', color: s==='done'||s==='active'?'var(--cream)':'var(--ink-light)', fontFamily: 'DM Mono, monospace', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {s==='done'?'✓':n}
                      </div>
                      <span style={{ fontSize: '10px', color: s==='active'?'var(--ink)':'var(--ink-light)', fontWeight: s==='active'?500:400 }}>{l}</span>
                    </div>
                    {i < arr.length-1 && <div style={{ flex: 1, height: '1px', background: s==='done'?'var(--navy)':'var(--cream-deep)', margin: '0 6px' }} />}
                  </React.Fragment>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Total Fields', value: result.totalFields, color: 'var(--navy)' },
                  { label: 'Matched', value: result.matchedCount, color: 'var(--forest-mid)' },
                  { label: 'Discrepancies', value: result.discrepancyCount, color: 'var(--sienna-mid)' },

                ].map(c => (
                  <div key={c.label} style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center', borderTop: `3px solid ${c.color}` }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '24px', fontWeight: 500, lineHeight: 1, marginBottom: '3px', color: c.color }}>{c.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-light)' }}>{c.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
                <div>
                  <MatchScoreCard score={result.score} invoice={invoice} scenarioKey={scenarioKey} />
                  <ExtractionResult invoice={invoice} scenarioKey={scenarioKey} />
                </div>
                <div>
                  <ReconciliationDashboard invoice={invoice} po={po} grn={grn} result={result} userRules={enrichedRules} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                <ExportReport invoice={invoice} po={po} result={result} />
                <button onClick={() => { setProcessedSet(new Set()); reset(); }}style={{ background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--cream-deep)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Geist, sans-serif', cursor: 'pointer' }}>
                ↩ Process Another
              </button>
              </div>
            </div>
          )}

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
                      <tr>{['Invoice No.','Vendor','Total','Processed At'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '7px 10px', background: 'var(--cream-dark)', fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink-light)', fontWeight: 400, borderBottom: '1px solid var(--cream-deep)' }}>{h}</th>
                      ))}</tr>
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

          {activePage === 'pos' && (
            <POManager
              pos={pos || []}
              grns={grns || []}
              loading={poLoading}
              onAddPO={addPO}
              onDeletePO={removePO}
              onAddGRN={addGRN}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage token={token} />
          )}
        </div>
      </div>
    </div>
  )
}