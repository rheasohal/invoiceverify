import React, { useState, useEffect } from 'react'
import { getRules, updateRule, getVendors, addVendor, deleteVendor } from '../../services/settingsService.js'

const RULE_LABELS = {
  gst_rate: { label: 'GST Rate (%)', desc: 'Standard GST rate applied to all invoices', type: 'number' },
  max_unit_price: { label: 'Max Unit Price (₹)', desc: 'Flag line items above this unit price', type: 'number' },
  round_number_threshold: { label: 'Round Number Threshold (₹)', desc: 'Flag totals that are exact multiples of this value', type: 'number' },
  allowed_payment_terms: { label: 'Allowed Payment Terms', desc: 'Comma separated list e.g. Net 30,Net 45,Net 60', type: 'text' },
  price_deviation_threshold: { label: 'Price Deviation Threshold (%)', desc: 'Flag prices that deviate more than this % from rate card', type: 'number' },
}

export default function SettingsPage({ token }) {
  const [rules, setRules] = useState({})
  const [vendors, setVendors] = useState([])
  const [editingRule, setEditingRule] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [newVendor, setNewVendor] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    Promise.all([getRules(token), getVendors(token)])
      .then(([r, v]) => { setRules(r); setVendors(v) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const showSuccess = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 2000)
  }

  const handleSaveRule = async (key) => {
    setSaving(true)
    try {
      await updateRule(token, key, editValue)
      setRules(prev => ({ ...prev, [key]: editValue }))
      setEditingRule(null)
      showSuccess('Rule updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddVendor = async () => {
    if (!newVendor.trim()) return
    try {
      const created = await addVendor(token, newVendor.trim())
      setVendors(prev => [...prev, created])
      setNewVendor('')
      showSuccess('Vendor added')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteVendor = async (id) => {
    try {
      await deleteVendor(token, id)
      setVendors(prev => prev.filter(v => v.id !== id))
      showSuccess('Vendor removed')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--ink-light)' }}>Loading settings...</div>
  )

  return (
    <div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '1.5rem' }}>Settings</div>

      {error && <div style={{ background: 'var(--mismatch-bg)', border: '1px solid rgba(153,27,27,0.2)', borderRadius: '7px', padding: '8px 12px', marginBottom: '1rem', fontSize: '12px', color: 'var(--mismatch)' }}>{error}</div>}
      {success && <div style={{ background: 'var(--match-bg)', border: '1px solid rgba(22,101,52,0.2)', borderRadius: '7px', padding: '8px 12px', marginBottom: '1rem', fontSize: '12px', color: 'var(--match)' }}>✓ {success}</div>}

      {/* Business Rules */}
      <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 600, marginBottom: '3px' }}>Business Rules</div>
        <div style={{ fontSize: '11px', color: 'var(--ink-light)', marginBottom: '1rem' }}>These rules are applied when validating invoices for your account</div>

        {Object.entries(RULE_LABELS).map(([key, meta]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--cream-deep)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '2px' }}>{meta.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--ink-light)' }}>{meta.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '1rem' }}>
              {editingRule === key ? (
                <>
                  <input
                    type={meta.type}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    style={{ width: '160px', background: 'var(--cream-dark)', border: '1px solid var(--navy-mid)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--ink)', outline: 'none' }}
                    autoFocus
                  />
                  <button onClick={() => handleSaveRule(key)} disabled={saving} style={{ background: 'var(--navy)', color: 'var(--cream)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    {saving ? '...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingRule(null)} style={{ background: 'transparent', border: '1px solid var(--cream-deep)', color: 'var(--ink-muted)', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--navy)', background: 'var(--navy-light)', padding: '4px 10px', borderRadius: '5px' }}>
                    {rules[key] || '—'}
                  </span>
                  <button onClick={() => { setEditingRule(key); setEditValue(rules[key] || '') }} style={{ background: 'transparent', border: '1px solid var(--cream-deep)', color: 'var(--ink-muted)', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Vendor Master List */}
      <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 600, marginBottom: '3px' }}>Approved Vendor List</div>
        <div style={{ fontSize: '11px', color: 'var(--ink-light)', marginBottom: '1rem' }}>Invoices from vendors not on this list will be flagged</div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
          <input
            value={newVendor}
            onChange={e => setNewVendor(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddVendor()}
            placeholder="Enter vendor name..."
            style={{ flex: 1, background: 'var(--cream-dark)', border: '1px solid var(--cream-deep)', borderRadius: '7px', padding: '8px 12px', fontSize: '12px', color: 'var(--ink)', outline: 'none', fontFamily: 'Geist, sans-serif' }}
          />
          <button onClick={handleAddVendor} style={{ background: 'var(--navy)', color: 'var(--cream)', border: 'none', padding: '8px 16px', borderRadius: '7px', fontSize: '12px', fontFamily: 'Geist, sans-serif', cursor: 'pointer' }}>
            + Add
          </button>
        </div>

        {vendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--ink-light)', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '14px' }}>No vendors added yet</div>
        ) : (
          vendors.map(v => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--cream-dark)', borderRadius: '7px', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{v.vendor_name}</span>
              <button onClick={() => handleDeleteVendor(v.id)} style={{ background: 'var(--sienna-light)', color: 'var(--sienna)', border: '1px solid rgba(154,52,18,0.2)', padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}