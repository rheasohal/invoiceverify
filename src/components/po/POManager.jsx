import React, { useState } from 'react'

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const EMPTY_ITEM = { description: '', qty: '', rate: '' }

function Label({ children }) {
  return (
    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '4px' }}>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ width: '100%', background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', fontFamily: type === 'number' ? 'DM Mono, monospace' : 'Geist, sans-serif', color: 'var(--ink)', outline: 'none' }}
    />
  )
}

function POForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    po_number: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    payment_terms: 'Net 30',
    notes: '',
  })
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const updateItem = (i, field, value) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }])
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!form.po_number || !form.vendor || !form.date) {
      setError('PO number, vendor and date are required')
      return
    }
    const parsedItems = items.map(item => ({
      description: item.description,
      qty: parseFloat(item.qty),
      rate: parseFloat(item.rate),
    }))
    if (parsedItems.some(i => !i.description || isNaN(i.qty) || isNaN(i.rate))) {
      setError('All line items must have description, quantity and rate')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ ...form, items: parsedItems })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0)

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 600, marginBottom: '1rem' }}>
        Create Purchase Order
      </div>

      {error && (
        <div style={{ background: 'var(--mismatch-bg)', border: '1px solid rgba(153,27,27,0.2)', borderRadius: '7px', padding: '8px 12px', marginBottom: '1rem', fontSize: '12px', color: 'var(--mismatch)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <Label>PO Number *</Label>
          <Input value={form.po_number} onChange={e => setForm(p => ({ ...p, po_number: e.target.value }))} placeholder="e.g. PO-1001" />
        </div>
        <div>
          <Label>Vendor Name *</Label>
          <Input value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} placeholder="e.g. TechSupply Co." />
        </div>
        <div>
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>
        <div>
          <Label>Payment Terms</Label>
          <select
            value={form.payment_terms}
            onChange={e => setForm(p => ({ ...p, payment_terms: e.target.value }))}
            style={{ width: '100%', background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', color: 'var(--ink)', outline: 'none' }}
          >
            {['Net 30', 'Net 45', 'Net 60', 'Net 15', 'Immediate'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
      </div>

      <div style={{ margin: '1rem 0 0.5rem', fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)' }}>
        Line Items *
      </div>

      <div style={{ background: 'var(--cream-dark)', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 40px', gap: '1px', background: 'var(--navy)', padding: '6px 10px' }}>
          {['Description', 'Qty', 'Rate (₹)', ''].map(h => (
            <div key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--cream)' }}>{h}</div>
          ))}
        </div>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 40px', gap: '6px', padding: '6px 8px', background: i % 2 === 0 ? 'var(--cream)' : 'var(--cream-dark)', alignItems: 'center' }}>
            <input
              value={item.description}
              onChange={e => updateItem(i, 'description', e.target.value)}
              placeholder="Item description"
              style={{ background: 'transparent', border: '1px solid var(--cream-deep)', borderRadius: '5px', padding: '5px 8px', fontSize: '11px', color: 'var(--ink)', outline: 'none', width: '100%' }}
            />
            <input
              type="number"
              value={item.qty}
              onChange={e => updateItem(i, 'qty', e.target.value)}
              placeholder="0"
              style={{ background: 'transparent', border: '1px solid var(--cream-deep)', borderRadius: '5px', padding: '5px 8px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--ink)', outline: 'none', width: '100%' }}
            />
            <input
              type="number"
              value={item.rate}
              onChange={e => updateItem(i, 'rate', e.target.value)}
              placeholder="0.00"
              style={{ background: 'transparent', border: '1px solid var(--cream-deep)', borderRadius: '5px', padding: '5px 8px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--ink)', outline: 'none', width: '100%' }}
            />
            <button
              onClick={() => removeItem(i)}
              disabled={items.length === 1}
              style={{ background: 'transparent', border: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer', color: 'var(--sienna-mid)', fontSize: '14px', opacity: items.length === 1 ? 0.3 : 1 }}
            >✕</button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        style={{ background: 'transparent', border: '1px dashed var(--cream-deep)', borderRadius: '7px', padding: '7px 14px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--ink-light)', cursor: 'pointer', width: '100%', marginBottom: '1rem' }}
      >+ Add Line Item</button>

      {subtotal > 0 && (
        <div style={{ background: 'var(--navy-light)', borderRadius: '7px', padding: '10px 12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Estimated Total (incl. 18% GST)</span>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: 600, color: 'var(--navy)' }}>{fmt(subtotal * 1.18)}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ background: 'var(--navy)', color: 'var(--cream)', border: 'none', padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Geist, sans-serif', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
        >{submitting ? 'Saving...' : 'Save Purchase Order'}</button>
        <button
          onClick={onCancel}
          style={{ background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--cream-deep)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Geist, sans-serif', cursor: 'pointer' }}
        >Cancel</button>
      </div>
    </div>
  )
}

function GRNForm({ po, onSubmit, onCancel }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState(
    po.items.map(i => ({ description: i.description, qty_ordered: i.qty, qty_received: i.qty }))
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const updateReceived = (i, val) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, qty_received: parseFloat(val) || 0 } : item))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const grn_number = `GRN-${Date.now().toString().slice(-6)}`
      await onSubmit({ grn_number, po_number: po.po_number, date, notes, items })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: 'var(--forest-light)', border: '1px solid rgba(45,80,22,0.15)', borderRadius: '10px', padding: '1.25rem', marginTop: '10px' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '14px', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--forest)' }}>
        Create GRN for {po.po_number}
      </div>
      {error && <div style={{ background: 'var(--mismatch-bg)', borderRadius: '6px', padding: '6px 10px', marginBottom: '8px', fontSize: '11px', color: 'var(--mismatch)' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div><Label>Receipt Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" /></div>
      </div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '6px' }}>Quantities Received</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid rgba(45,80,22,0.1)' }}>
          <div style={{ flex: 1, fontSize: '12px', color: 'var(--ink)' }}>{item.description}</div>
          <div style={{ fontSize: '11px', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace' }}>Ordered: {item.qty_ordered}</div>
          <input
            type="number"
            value={item.qty_received}
            onChange={e => updateReceived(i, e.target.value)}
            style={{ width: '70px', background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '5px', padding: '4px 8px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--ink)', outline: 'none' }}
          />
        </div>
      ))}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button onClick={handleSubmit} disabled={submitting} style={{ background: 'var(--forest-mid)', color: 'var(--cream)', border: 'none', padding: '8px 16px', borderRadius: '7px', fontSize: '12px', fontFamily: 'Geist, sans-serif', cursor: 'pointer' }}>
          {submitting ? 'Saving...' : 'Save GRN'}
        </button>
        <button onClick={onCancel} style={{ background: 'transparent', border: '1px solid var(--cream-deep)', color: 'var(--ink-muted)', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

export default function POManager({ pos, grns, onAddPO, onDeletePO, onAddGRN, loading }) {
  const [showForm, setShowForm] = useState(false)
  const [grnPO, setGrnPO] = useState(null)

  const handleAddPO = async (data) => {
    await onAddPO(data)
    setShowForm(false)
  }

  const handleAddGRN = async (data) => {
    await onAddGRN(data)
    setGrnPO(null)
  }

  const getGRN = (poNumber) => grns.find(g => g.po_number === poNumber)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Purchase Orders
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ background: 'var(--navy)', color: 'var(--cream)', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Geist, sans-serif', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >+ New PO</button>
        )}
      </div>

      {showForm && <POForm onSubmit={handleAddPO} onCancel={() => setShowForm(false)} />}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>
          Loading...
        </div>
      )}

      {!loading && pos.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-light)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.35 }}>📋</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontStyle: 'italic', marginBottom: '8px' }}>No purchase orders yet</div>
          <div style={{ fontSize: '12px', color: 'var(--ink-light)' }}>Create a PO first, then upload an invoice with the same PO reference number to reconcile</div>
        </div>
      )}

      {pos.map(po => {
        const grn = getGRN(po.po_number)
        return (
          <div key={po.po_number} style={{ background: 'var(--cream)', border: '1px solid var(--cream-deep)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500, color: 'var(--navy)' }}>{po.po_number}</span>
                  {grn ? (
                    <span style={{ background: 'var(--match-bg)', color: 'var(--match)', fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 7px', borderRadius: '4px' }}>GRN ATTACHED</span>
                  ) : (
                    <span style={{ background: 'var(--partial-bg)', color: 'var(--partial)', fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 7px', borderRadius: '4px' }}>NO GRN</span>
                  )}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '2px' }}>{po.vendor}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace' }}>{po.date} · {po.payment_terms}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '16px', fontWeight: 500, color: 'var(--navy)', marginBottom: '8px' }}>
                  {fmt(po.total)}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {!grn && (
                    <button
                      onClick={() => setGrnPO(grnPO?.po_number === po.po_number ? null : po)}
                      style={{ background: 'var(--forest-light)', color: 'var(--forest-mid)', border: '1px solid rgba(45,80,22,0.2)', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}
                    >+ GRN</button>
                  )}
                  <button
                    onClick={() => onDeletePO(po.po_number)}
                    style={{ background: 'var(--sienna-light)', color: 'var(--sienna)', border: '1px solid rgba(154,52,18,0.2)', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}
                  >Delete</button>
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  {['Item', 'Qty', 'Rate', 'Amount'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Item' ? 'left' : 'right', padding: '5px 8px', background: 'var(--cream-dark)', fontFamily: 'DM Mono, monospace', fontSize: '8px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink-light)', fontWeight: 400, borderBottom: '1px solid var(--cream-deep)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {po.items?.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--cream-deep)' }}>{item.description}</td>
                    <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{item.qty}</td>
                    <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{fmt(item.rate)}</td>
                    <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--cream-deep)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {grn && (
              <div style={{ marginTop: '10px', background: 'var(--forest-light)', borderRadius: '7px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--forest-mid)', marginBottom: '4px' }}>GRN: {grn.grn_number} · {grn.date}</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {grn.items?.map((item, i) => (
                    <span key={i} style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                      {item.description}: <span style={{ fontFamily: 'DM Mono, monospace', color: item.qty_received === item.qty_ordered ? 'var(--match)' : 'var(--sienna-mid)' }}>{item.qty_received}/{item.qty_ordered}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {grnPO?.po_number === po.po_number && (
              <GRNForm po={po} onSubmit={handleAddGRN} onCancel={() => setGrnPO(null)} />
            )}
          </div>
        )
      })}
    </div>
  )
}