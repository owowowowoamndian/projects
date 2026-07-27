import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Eye, EyeOff, LogIn, UserPlus, Mail, Lock, User, Building2, ChevronRight, Fingerprint } from 'lucide-react'
import { loginUser, registerUser, getPasskeyAuthOptions, authenticatePasskey } from '../api'
import { useAuth } from '../context/AuthContext'
import { startAuthentication } from '@simplewebauthn/browser'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  // Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [role, setRole] = useState('investigator')

  const [info, setInfo] = useState('')

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false)
  const [loginToken, setLoginToken] = useState('')
  const [verifying2FA, setVerifying2FA] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (isSignup) {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }

      setLoading(true)
      try {
        const data = await registerUser({ name, email, password, role, organization })
        login(data.token, data.user, data.sessionTimeout)
        navigate('/')
      } catch (err) {
        setError(err.message || 'Registration failed')
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        const data = await loginUser(email, password)

        // Check if 2FA is required
        if (data.requires2FA) {
          setLoginToken(data.loginToken)
          setRequires2FA(true)
          setLoading(false)
          return
        }

        login(data.token, data.user, data.sessionTimeout)
        navigate('/')
      } catch (err) {
        setError(err.message || 'Authentication failed')
      } finally {
        setLoading(false)
      }
    }
  }

  const handle2FAVerify = async () => {
    setError('')
    setVerifying2FA(true)
    try {
      // Get authentication options from server
      const options = await getPasskeyAuthOptions(loginToken)
      // Trigger browser WebAuthn prompt (fingerprint, Face ID, etc.)
      const credential = await startAuthentication({ optionsJSON: options })
      // Send credential to server for verification
      const data = await authenticatePasskey(loginToken, credential)
      login(data.token, data.user, data.sessionTimeout)
      navigate('/')
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
        setError('Passkey verification was cancelled. Please try again.')
      } else {
        setError(err.message || 'Passkey verification failed')
      }
    } finally {
      setVerifying2FA(false)
    }
  }

  return (
    <div className="login-page">
      {/* Floating background particles */}
      <div className="login-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="login-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 10}s`,
          }} />
        ))}
      </div>

      <motion.div
        className="login-card-wrapper"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* RGB animated border */}
        <div className="rgb-border-container">
          <div className="rgb-border-glow" />

          <div className="login-card">
            {/* Header */}
            <div className="login-header">
              <div className="login-logo">
                <Shield size={28} />
              </div>
              <h1 className="login-title">ForensicAI</h1>
              <p className="login-subtitle">Digital Forensics Intelligence Platform</p>
            </div>

            <AnimatePresence mode="wait">
              {requires2FA ? (
                /* ─── 2FA Passkey Verification Screen ─── */
                <motion.div
                  key="2fa"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{ textAlign: 'center', padding: '8px 0' }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, rgba(0,224,255,0.15), rgba(124,58,237,0.15))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(0,224,255,0.3)',
                  }}>
                    <Fingerprint size={36} style={{ color: '#00e0ff' }} />
                  </div>

                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: '#fff' }}>
                    Two-Factor Authentication
                  </h2>
                  <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.5 }}>
                    Your account requires passkey verification.<br />
                    Use your fingerprint, Face ID, or security key.
                  </p>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="login-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginBottom: 14 }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    className="login-submit-btn"
                    onClick={handle2FAVerify}
                    disabled={verifying2FA}
                    style={{ marginBottom: 12 }}
                  >
                    {verifying2FA ? (
                      <div className="login-spinner" />
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Verify with Passkey
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRequires2FA(false); setLoginToken(''); setError('') }}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.8rem', cursor: 'pointer', padding: '8px 0',
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </motion.div>
              ) : (
                /* ─── Normal Login/Signup Form ─── */
                <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Toggle */}
                  <div className="login-toggle">
                    <button
                      className={`login-toggle-btn ${!isSignup ? 'active' : ''}`}
                      onClick={() => { setIsSignup(false); setError(''); setInfo('') }}
                      type="button"
                    >
                      <LogIn size={14} /> Sign In
                    </button>
                    <button
                      className={`login-toggle-btn ${isSignup ? 'active' : ''}`}
                      onClick={() => { setIsSignup(true); setError(''); setInfo('') }}
                      type="button"
                    >
                      <UserPlus size={14} /> Sign Up
                    </button>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="login-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Info / Success */}
                  <AnimatePresence>
                    {info && (
                      <motion.div
                        className="login-info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          background: 'rgba(0, 224, 255, 0.1)',
                          border: '1px solid rgba(0, 224, 255, 0.35)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          color: '#00e0ff',
                          fontSize: '0.84rem',
                          lineHeight: '1.45',
                          marginBottom: '15px',
                          textAlign: 'left',
                        }}
                      >
                        {info}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="login-form">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isSignup ? 'signup' : 'login'}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isSignup && (
                          <div className="login-field">
                            <div className="login-field-icon"><User size={16} /></div>
                            <input type="text" placeholder="Full Name" value={name}
                              onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                          </div>
                        )}

                        <div className="login-field">
                          <div className="login-field-icon"><Mail size={16} /></div>
                          <input type="email" placeholder="Email Address" value={email}
                            onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                        </div>

                        <div className="login-field">
                          <div className="login-field-icon"><Lock size={16} /></div>
                          <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            required autoComplete={isSignup ? 'new-password' : 'current-password'} />
                          <button type="button" className="login-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {isSignup && (
                          <>
                            <div className="login-field">
                              <div className="login-field-icon"><Lock size={16} /></div>
                              <input type="password" placeholder="Confirm Password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                            </div>

                            <div className="login-field">
                              <div className="login-field-icon"><Building2 size={16} /></div>
                              <input type="text" placeholder="Organization (optional)" value={organization}
                                onChange={(e) => setOrganization(e.target.value)} autoComplete="organization" />
                            </div>

                            <div className="login-field" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                              <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
                                <div className="login-field-icon"><Shield size={16} /></div>
                                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ paddingLeft: '40px', width: '100%' }}>
                                  <option value="investigator">Investigator</option>
                                  <option value="analyst">Analyst</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                              </div>
                              <div className="role-footnote" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px', textAlign: 'left', paddingLeft: '8px' }}>
                                For Administrator Please Contact System Admin
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                      {loading ? (
                        <div className="login-spinner" />
                      ) : (
                        <>
                          {isSignup ? 'Sign Up' : 'Sign In'}
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="login-footer">
              <div className="login-footer-line" />
              <span>Secured with AES-256 encryption</span>
              <div className="login-footer-line" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
