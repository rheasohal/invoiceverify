import React from 'react'

export default function Header({ activePage, setActivePage, historyCount, poCount, user, onLogout }) {
  const pages = [
    { key: 'process', label: 'Process Invoice' },
    { key: 'history', label: `History${historyCount > 0 ? ` (${historyCount})` : ''}` },
    { key: 'pos', label: `POs${poCount > 0 ? ` (${poCount})` : ''}` },
    { key: 'settings', label: 'Settings' },
  ]

  return (
    <header style={{ background: 'var(--navy)', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--cream)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '15px', color: 'var(--navy)' }}>IV</div>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '17px', fontWeight: 600, color: 'var(--cream)', letterSpacing: '-0.3px' }}>InvoiceVerify</div>
          <div style={{ fontSize: '9px', color: 'rgba(245,240,232,0.45)', fontFamily: 'DM Mono, monospace', letterSpacing: '1px' }}>AI RECONCILIATION</div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {pages.map(({ key, label }) => (
          <button key={key} onClick={() => setActivePage(key)} style={{ background: activePage === key ? 'var(--cream)' : 'rgba(245,240,232,0.1)', border: '1px solid rgba(245,240,232,0.15)', color: activePage === key ? 'var(--navy)' : 'rgba(245,240,232,0.7)', fontSize: '11px', fontFamily: 'DM Mono, monospace', padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: activePage === key ? 500 : 400 }}>
            {label}
          </button>
        ))}

        <div style={{ width: '1px', height: '20px', background: 'rgba(245,240,232,0.2)', margin: '0 6px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'rgba(245,240,232,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--cream)', fontFamily: 'Fraunces, serif' }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(245,240,232,0.7)', fontFamily: 'DM Mono, monospace', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
          <button onClick={onLogout} style={{ background: 'rgba(245,240,232,0.1)', border: '1px solid rgba(245,240,232,0.15)', color: 'rgba(245,240,232,0.6)', fontSize: '10px', fontFamily: 'DM Mono, monospace', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>
    </header>
  )
}