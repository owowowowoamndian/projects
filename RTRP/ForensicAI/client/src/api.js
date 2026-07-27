/**
 * Centralized API helper for frontend → backend communication.
 * Uses Vite proxy (/api → http://localhost:5000/api).
 */

const BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('forensic_token') || ''
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) {
      // Token expired or invalid — force logout
      localStorage.removeItem('forensic_token')
      localStorage.removeItem('forensic_user')
      window.location.href = '/login'
      throw new Error('Session expired')
    }
    const err = await res.json().catch(() => ({ error: res.statusText }))
    const msg = err.error || err.message || (Array.isArray(err.errors) ? err.errors.map(e => e.msg || e.message).join(', ') : null) || `API error ${res.status}`
    throw new Error(msg)
  }
  return res.json()
}

// ─── Auth ───
export const loginUser = (email, password) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
})
export const registerUser = (data) => request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(data),
})


// ─── Dashboard ───
export const getDashboardStats = () => request('/dashboard/stats')
export const getDashboardActivity = () => request('/dashboard/activity')
export const getNotifications = () => request('/dashboard/notifications')
export const globalSearch = (q) => request(`/dashboard/search?q=${encodeURIComponent(q)}`)
export const getThreatIocs = () => request('/dashboard/iocs')

// ─── Cases ───
export const getCases = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/cases${q ? '?' + q : ''}`)
}
export const getCase = (id) => request(`/cases/${id}`)
export const createCase = (data) => request('/cases', {
  method: 'POST',
  body: JSON.stringify(data),
})
export const updateCase = (id, data) => request(`/cases/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
})
export const shareCase = (id, email) => request(`/cases/${id}/share`, {
  method: 'POST',
  body: JSON.stringify({ email }),
})
export const revokeCaseShare = (id, userId) => request(`/cases/${id}/share/${userId}`, {
  method: 'DELETE',
})


// ─── Reports ───
export const getReports = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/reports${q ? '?' + q : ''}`)
}
export const getReport = (id) => request(`/reports/${id}`)
export const generateReport = (caseId) => request('/reports/generate', {
  method: 'POST',
  body: JSON.stringify({ caseId }),
})
export const updateReport = (id, data) => request(`/reports/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
})

// ─── Evidence ───
export const uploadEvidence = (caseId, files) => {
  const formData = new FormData()
  formData.append('caseId', caseId)
  files.forEach(f => formData.append('files', f))
  const token = getToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`${BASE}/evidence/upload`, { method: 'POST', body: formData, headers }).then(r => {
    if (!r.ok) throw new Error('Upload failed')
    return r.json()
  })
}
export const parseEvidence = (evidenceId) => request(`/evidence/${evidenceId}/parse`, { method: 'POST' })
export const parseAllEvidence = (caseId) => request(`/evidence/parse-all/${caseId}`, { method: 'POST' })

// ─── Timeline ───
export const getTimeline = (caseId, params = {}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/timeline/${caseId}${q ? '?' + q : ''}`)
}

// ─── Audit ───
export const getAuditLogs = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/audit${q ? '?' + q : ''}`)
}

// ─── Settings ───
export const getProfile = () => request('/settings/profile')
export const updateProfile = (data) => request('/settings/profile', {
  method: 'PUT',
  body: JSON.stringify(data),
})
export const changePassword = (data) => request('/settings/password', {
  method: 'PUT',
  body: JSON.stringify(data),
})
export const getSecuritySettings = () => request('/settings/security')
export const updateSecuritySettings = (data) => request('/settings/security', {
  method: 'PUT',
  body: JSON.stringify(data),
})
export const getAiSettings = () => request('/settings/ai')
export const updateAiSettings = (data) => request('/settings/ai', {
  method: 'PUT',
  body: JSON.stringify(data),
})
export const getNotificationSettings = () => request('/settings/notifications')
export const updateNotificationSettings = (data) => request('/settings/notifications', {
  method: 'PUT',
  body: JSON.stringify(data),
})

// ─── Passkeys ───
export const getPasskeyRegisterOptions = () => request('/auth/passkey/register-options', { method: 'POST' })
export const registerPasskey = (credential) => request('/auth/passkey/register', {
  method: 'POST',
  body: JSON.stringify(credential),
})
export const getPasskeys = () => request('/auth/passkeys')
export const deletePasskey = (credentialId) => request(`/auth/passkey/${encodeURIComponent(credentialId)}`, {
  method: 'DELETE',
})
export const getPasskeyAuthOptions = (loginToken) => request('/auth/passkey/auth-options', {
  method: 'POST',
  body: JSON.stringify({ loginToken }),
})
export const authenticatePasskey = (loginToken, credential) => request('/auth/passkey/authenticate', {
  method: 'POST',
  body: JSON.stringify({ loginToken, credential }),
})

// ─── Case Chat Chatbot (RAG) ───
export const sendCaseChatMessage = (caseId, message, history) => request(`/cases/${caseId}/chat`, {
  method: 'POST',
  body: JSON.stringify({ message, history }),
})

// ─── System Health ───
export const getHealthStatus = () => request('/health')

