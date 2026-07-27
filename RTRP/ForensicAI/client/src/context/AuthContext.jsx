import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { getSecuritySettings } from '../api'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('forensic_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('forensic_token') || null)
  const [sessionTimeout, setSessionTimeout] = useState(30) // minutes
  const timerRef = useRef(null)

  const isAuthenticated = !!token && !!user

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('forensic_token')
    localStorage.removeItem('forensic_user')
    setToken(null)
    setUser(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    window.location.href = '/login'
  }, [])

  // Login
  const login = useCallback((tokenVal, userData, timeout) => {
    localStorage.setItem('forensic_token', tokenVal)
    localStorage.setItem('forensic_user', JSON.stringify(userData))
    setToken(tokenVal)
    setUser(userData)
    if (timeout) setSessionTimeout(timeout)
  }, [])

  // ─── Auto-logout based on inactivity ───
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isAuthenticated || sessionTimeout <= 0) return
    timerRef.current = setTimeout(() => {
      logout()
    }, sessionTimeout * 60 * 1000)
  }, [isAuthenticated, sessionTimeout, logout])

  // Fetch session timeout from security settings on mount
  useEffect(() => {
    if (!isAuthenticated) return
    getSecuritySettings()
      .then(data => {
        if (data.sessionTimeout) setSessionTimeout(data.sessionTimeout)
      })
      .catch(() => {})
  }, [isAuthenticated])

  // Listen for user activity
  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    const handler = () => resetTimer()

    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    resetTimer() // Start initial timer

    return () => {
      events.forEach(e => window.removeEventListener(e, handler))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAuthenticated, resetTimer])

  // Update User profile details in state and localStorage
  const updateUser = useCallback((userData, newToken) => {
    setUser(prev => {
      const newUser = { ...prev, ...userData }
      localStorage.setItem('forensic_user', JSON.stringify(newUser))
      return newUser
    })
    if (newToken) {
      setToken(newToken)
      localStorage.setItem('forensic_token', newToken)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, sessionTimeout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
