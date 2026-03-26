import React, { useRef, useState } from 'react'

export default function InvoiceUploader({ onFileSelect }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert('Please upload a PDF, PNG, JPEG, or WEBP file.')
      return
    }
    onFileSelect(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        background: dragging ? 'var(--navy-light)' : 'var(--cream)',
        border: `2px dashed ${dragging ? 'var(--navy-mid)' : 'var(--cream-deep)'}`,
        borderRadius: '12px',
        padding: '1.5rem 1rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div style={{
        width: '44px', height: '44px',
        background: 'var(--navy-light)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 0.75rem',
        fontSize: '20px',
      }}>📂</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '14px', fontWeight: 600, marginBottom: '3px' }}>
        Drop invoice here
      </div>
      <div style={{ fontSize: '11px', color: 'var(--ink-light)', lineHeight: 1.5 }}>
        or click to browse your files
      </div>
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
        {['PDF', 'PNG', 'JPEG', 'WEBP'].map(f => (
          <span key={f} style={{
            background: 'var(--cream-deep)',
            fontFamily: 'DM Mono, monospace',
            fontSize: '9px',
            padding: '2px 7px',
            borderRadius: '3px',
            color: 'var(--ink-muted)',
          }}>{f}</span>
        ))}
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--ink-light)', fontFamily: 'DM Mono, monospace' }}>
        Max 10MB · Printed or handwritten
      </div>
    </div>
  )
}