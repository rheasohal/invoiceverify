import React, { useState } from 'react'

export default function LoginPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Email and password are required'); return }
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') await onLogin(email, password)
      else await onRegister(email, password, name)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '52px', height: '52px', background: 'var(--navy)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '22px', color: 'var(--cream)' }}>IV</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>InvoiceVerify</div>
          <div style={{ fontSize: '13px', color: 'var(--ink-light)', marginTop: '4px' }}>AI-powered invoice reconciliation</div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(30,58,95,0.08)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--cream-dark)', borderRadius: '8px', padding: '3px', marginBottom: '1.5rem' }}>
            {[['login', 'Sign In'], ['register', 'Create Account']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(null) }} style={{ flex: 1, padding: '7px', fontSize: '12px', fontFamily: 'DM Mono, monospace', border: 'none', borderRadius: '6px', cursor: 'pointer', background: mode === m ? 'var(--cream)' : 'transparent', color: mode === m ? 'var(--ink)' : 'var(--ink-light)', boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: 'var(--mismatch-bg)', border: '1px solid rgba(153,27,27,0.2)', borderRadius: '7px', padding: '8px 12px', marginBottom: '1rem', fontSize: '12px', color: 'var(--mismatch)' }}>
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '4px' }}>Full Name</div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={{ width: '100%', background: 'var(--cream-dark)', border: '1px solid var(--cream-deep)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--ink)', outline: 'none', fontFamily: 'Geist, sans-serif' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '4px' }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', background: 'var(--cream-dark)', border: '1px solid var(--cream-deep)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--ink)', outline: 'none', fontFamily: 'Geist, sans-serif' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '4px' }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', background: 'var(--cream-dark)', border: '1px solid var(--cream-deep)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--ink)', outline: 'none', fontFamily: 'Geist, sans-serif' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: 'var(--navy)', color: 'var(--cream)', border: 'none', padding: '11px', borderRadius: '8px', fontSize: '13px', fontFamily: 'Geist, sans-serif', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.15s' }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '11px', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace' }}>
          Your data is private and encrypted. No card required.
        </div>
      </div>
    </div>
  )
}