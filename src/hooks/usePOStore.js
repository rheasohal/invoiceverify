import { useState, useEffect, useCallback } from 'react'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export function usePOStore(token) {
  const [pos, setPOs] = useState([])
  const [grns, setGRNs] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [poRes, grnRes] = await Promise.all([
        fetch(`${SERVER_URL}/api/pos`, { headers: authHeaders(token) }),
        fetch(`${SERVER_URL}/api/grns`, { headers: authHeaders(token) }),
      ])
      if (poRes.ok) setPOs(await poRes.json())
      if (grnRes.ok) setGRNs(await grnRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addPO = useCallback(async (poData) => {
    const res = await fetch(`${SERVER_URL}/api/pos`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(poData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create PO')
    setPOs(prev => [data, ...prev])
    return data
  }, [token])

  const removePO = useCallback(async (poNumber) => {
    await fetch(`${SERVER_URL}/api/pos/${poNumber}`, { method: 'DELETE', headers: authHeaders(token) })
    setPOs(prev => prev.filter(p => p.po_number !== poNumber))
  }, [token])

  const addGRN = useCallback(async (grnData) => {
    const res = await fetch(`${SERVER_URL}/api/grns`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(grnData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create GRN')
    setGRNs(prev => [data, ...prev])
    return data
  }, [token])

  const getPOByNumber = useCallback((poNumber) => {
    return pos.find(p => p.po_number === poNumber) || null
  }, [pos])

  return { pos, grns, loading, fetchAll, addPO, removePO, addGRN, getPOByNumber }
}