import { useState, useEffect, useCallback } from 'react'
import { getAllPOs, createPO, deletePO, getAllGRNs, createGRN } from '../services/poService.js'

export function usePOStore() {
  const [pos, setPOs] = useState([])
  const [grns, setGRNs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [poData, grnData] = await Promise.all([getAllPOs(), getAllGRNs()])
      setPOs(poData)
      setGRNs(grnData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
  fetchAll().catch(() => {
    setPOs([])
    setGRNs([])
    setLoading(false)
  })
}, [])

  const addPO = useCallback(async (poData) => {
    const created = await createPO(poData)
    setPOs(prev => [created, ...prev])
    return created
  }, [])

  const removePO = useCallback(async (poNumber) => {
    await deletePO(poNumber)
    setPOs(prev => prev.filter(p => p.po_number !== poNumber))
  }, [])

  const addGRN = useCallback(async (grnData) => {
    const created = await createGRN(grnData)
    setGRNs(prev => [created, ...prev])
    return created
  }, [])

  const getPOByNumber = useCallback((poNumber) => {
    return pos.find(p => p.po_number === poNumber) || null
  }, [pos])

  const getGRNByPO = useCallback((poNumber) => {
    return grns.find(g => g.po_number === poNumber) || null
  }, [grns])

  return {
    pos, grns,
    loading, error,
    fetchAll,
    addPO, removePO,
    addGRN,
    getPOByNumber,
    getGRNByPO,
  }
}