const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function getRules(token) {
  const res = await fetch(`${SERVER_URL}/api/settings/rules`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Failed to fetch rules')
  return res.json()
}

export async function updateRule(token, key, value) {
  const res = await fetch(`${SERVER_URL}/api/settings/rules/${key}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ value: String(value) }),
  })
  if (!res.ok) throw new Error('Failed to update rule')
  return res.json()
}

export async function getVendors(token) {
  const res = await fetch(`${SERVER_URL}/api/settings/vendors`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Failed to fetch vendors')
  return res.json()
}

export async function addVendor(token, vendor_name) {
  const res = await fetch(`${SERVER_URL}/api/settings/vendors`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ vendor_name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to add vendor')
  return data
}

export async function deleteVendor(token, id) {
  const res = await fetch(`${SERVER_URL}/api/settings/vendors/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Failed to delete vendor')
  return res.json()
}