import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Loader, Brain, Globe, Database, X, Trash2 } from 'lucide-react'
import { getCases, sendCaseChatMessage } from '../api'
import { renderMarkdown } from './CaseDetail'

export default function CaseChat() {
  const [cases, setCases] = useState([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [selectedSources, setSelectedSources] = useState(null)

  useEffect(() => {
    getCases({ limit: 50 }).then(data => {
      const c = data.cases || []
      setCases(c)
      if (c.length > 0) setSelectedCaseId(c[0]._id)
    }).catch(() => {})
  }, [])

  // Load chat history if case changes
  useEffect(() => {
    if (!selectedCaseId) {
      setChatMessages([])
      return
    }
    const saved = localStorage.getItem(`forensicai_chat_history_${selectedCaseId}`)
    if (saved) {
      try {
        setChatMessages(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved chat history:', e)
        setChatMessages([])
      }
    } else {
      setChatMessages([])
    }
  }, [selectedCaseId])

  const handleSendChatMessage = async (e, directMessage = '') => {
    if (e) e.preventDefault()
    const msg = directMessage || chatInput
    if (!msg.trim() || chatLoading || !selectedCaseId) return

    const userMsg = { role: 'user', content: msg }
    const updatedMessagesWithUser = [...chatMessages, userMsg]
    setChatMessages(updatedMessagesWithUser)
    localStorage.setItem(`forensicai_chat_history_${selectedCaseId}`, JSON.stringify(updatedMessagesWithUser))
    if (!directMessage) setChatInput('')
    setChatLoading(true)

    try {
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }))
      const res = await sendCaseChatMessage(selectedCaseId, msg, history)
      
      const assistantMsg = {
        role: 'assistant',
        content: res.message,
        sources: res.sources
      }
      const updatedMessagesWithAssistant = [...updatedMessagesWithUser, assistantMsg]
      setChatMessages(updatedMessagesWithAssistant)
      localStorage.setItem(`forensicai_chat_history_${selectedCaseId}`, JSON.stringify(updatedMessagesWithAssistant))
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `⚠️ Failed to query Case Chatbot: ${err.message}`
      }
      const updatedMessagesWithError = [...updatedMessagesWithUser, errorMsg]
      setChatMessages(updatedMessagesWithError)
      localStorage.setItem(`forensicai_chat_history_${selectedCaseId}`, JSON.stringify(updatedMessagesWithError))
    }
    setChatLoading(false)
  }

  const handleClearHistory = () => {
    if (!selectedCaseId) return
    localStorage.removeItem(`forensicai_chat_history_${selectedCaseId}`)
    setChatMessages([])
  }

  return (
    <motion.div className="page-enter" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <h1 className="page-title">Case Chat Assistant</h1>
        <p className="page-description">
          Ask questions directly about IP addresses, brute-force logs, or privilege escalations in your selected case.
        </p>
      </div>

      {/* Case Selector & Clear History */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <select
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'var(--font-primary)',
            minWidth: 300,
            outline: 'none',
          }}
        >
          <option value="">— Select a case —</option>
          {cases.map(c => (
            <option key={c._id} value={c._id}>{c.caseNumber} — {c.title}</option>
          ))}
        </select>

        {selectedCaseId && chatMessages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </div>

      {/* RAG Chat Console */}
      {!selectedCaseId ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <MessageSquare size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>Select a case above to launch the AI Assistant.</p>
        </div>
      ) : (
        <div className="chat-container" style={{ minHeight: '500px' }}>
          <div className="chat-messages" style={{ height: '400px' }}>
            {chatMessages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', gap: 10, padding: 20 }}>
                <Brain size={36} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Interactive Case RAG Copilot</div>
                  <div style={{ fontSize: '0.82rem', marginTop: 4, maxWidth: 360 }}>Ask about IP connections, system command lines, or security events in this case.</div>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="chat-message-meta">{msg.role === 'user' ? 'Investigator' : 'Forensic Copilot'}</div>
                  <div className="chat-message-content">{renderMarkdown(msg.content)}</div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div className="chat-sources-header">Retrieved Evidence Citations ({msg.sources.length})</div>
                      <div className="chat-sources-list">
                        {msg.sources.map((src, si) => (
                          <div key={si} className="chat-source-badge" onClick={() => setSelectedSources(src)} title={src.detail}>
                            {src.mitreAttack?.techniqueId ? `${src.mitreAttack.techniqueId} ` : ''}{src.source} · {src.timestamp?.split(' ')[1] || 'log'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {chatLoading && (
              <div className="chat-message assistant" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing case files...
              </div>
            )}
          </div>
          
          {chatMessages.length === 0 && (
            <div className="chat-suggested">
              {[
                'Did you detect any brute force logins?',
                'Show all events with high threat scores',
                'Find any privilege escalation commands',
                'Give me a summary of the timeline'
              ].map((chip, ci) => (
                <div key={ci} className="chat-suggested-chip" onClick={() => handleSendChatMessage(null, chip)}>
                  {chip}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSendChatMessage} className="chat-input-container">
            <input
              className="form-input"
              style={{ flex: 1, marginBottom: 0 }}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask about logins, IPs, specific tools..."
              disabled={chatLoading}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }} disabled={chatLoading}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {selectedSources && (
        <div className="modal-backdrop" onClick={() => setSelectedSources(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="glow-card" style={{ maxWidth: 600, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="glow-card-inner" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Evidence Citation Details</h3>
                <button className="btn btn-secondary btn-sm" style={{ padding: 4 }} onClick={() => setSelectedSources(null)}><X size={16} /></button>
              </div>
              <div style={{ display: 'grid', gap: 12, fontSize: '0.85rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Evidence File:</strong> {selectedSources.evidenceName}
                </div>
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Source / Host:</strong> {selectedSources.source}
                </div>
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Timestamp:</strong> {selectedSources.timestamp}
                </div>
                {selectedSources.severity && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>Severity:</strong> <span className="tag">{selectedSources.severity}</span>
                  </div>
                )}
                {selectedSources.mitreAttack?.techniqueId && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>MITRE ATT&CK:</strong> <span style={{ color: '#d1b3ff', background: 'rgba(136,0,255,0.08)', padding: '2px 8px', borderRadius: 4 }}>{selectedSources.mitreAttack.techniqueId} - {selectedSources.mitreAttack.techniqueName} ({selectedSources.mitreAttack.tactic})</span>
                  </div>
                )}
                {selectedSources.threatIntel?.score > 0 && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>Threat Intelligence:</strong> <span className="tag danger">Score {selectedSources.threatIntel.score}% - {selectedSources.threatIntel.details}</span>
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Event Log Detail:</strong>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-primary)', padding: 12, borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                    {selectedSources.detail}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
