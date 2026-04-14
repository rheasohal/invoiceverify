import { useState, useEffect, useCallback } from 'react'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('iv_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${SERVER_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data)
        else { localStorage.removeItem('iv_token'); setToken(null) }
      })
      .catch(() => { localStorage.removeItem('iv_token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    localStorage.setItem('iv_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (email, password, name) => {
    const res = await fetch(`${SERVER_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    localStorage.setItem('iv_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('iv_token')
    setToken(null)
    setUser(null)
  }, [])

  return { user, token, loading, login, register, logout }
}