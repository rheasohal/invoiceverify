import { useState, useEffect, useCallback } from 'react'
import { getRules, getVendors } from '../services/settingsService.js'

export function useSettings(token) {
  const [rules, setRules] = useState(null)
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    if (!token) return
    try {
      const [r, v] = await Promise.all([getRules(token), getVendors(token)])
      setRules(r)
      setVendors(v)
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  return { rules, vendors, loading, refetch: fetchSettings }
}