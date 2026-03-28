const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export async function getAllPOs() {
  const res = await fetch(`${SERVER_URL}/api/pos`)
  if (!res.ok) throw new Error('Failed to fetch POs')
  return res.json()
}

export async function getPOByNumber(poNumber) {
  const res = await fetch(`${SERVER_URL}/api/pos/${poNumber}`)
  if (!res.ok) return null
  return res.json()
}

export async function createPO(poData) {
  const res = await fetch(`${SERVER_URL}/api/pos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(poData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create PO')
  return data
}

export async function deletePO(poNumber) {
  const res = await fetch(`${SERVER_URL}/api/pos/${poNumber}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete PO')
  return res.json()
}

export async function getAllGRNs() {
  const res = await fetch(`${SERVER_URL}/api/grns`)
  if (!res.ok) throw new Error('Failed to fetch GRNs')
  return res.json()
}

export async function getGRNByPO(poNumber) {
  const res = await fetch(`${SERVER_URL}/api/grns/po/${poNumber}`)
  if (!res.ok) return null
  return res.json()
}

export async function createGRN(grnData) {
  const res = await fetch(`${SERVER_URL}/api/grns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(grnData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create GRN')
  return data
}