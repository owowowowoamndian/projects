import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Activity, Loader, AlertTriangle } from 'lucide-react'
import { getCases, getCase } from '../api'

export default function MitreAttack() {
  const [cases, setCases] = useState([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [evidence, setEvidence] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCases({ limit: 50 }).then(data => {
      const c = data.cases || []
      setCases(c)
      if (c.length > 0) setSelectedCaseId(c[0]._id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedCaseId) {
      setEvidence([])
      return
    }
    setLoading(true)
    getCase(selectedCaseId).then(data => {
      setEvidence(data.evidence || [])
    }).catch(err => {
      console.error('MITRE fetch error:', err)
      setEvidence([])
    }).finally(() => setLoading(false))
  }, [selectedCaseId])

  return (
    <motion.div className="page-enter" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <h1 className="page-title">MITRE ATT&CK Matrix</h1>
        <p className="page-description">
          Cross-evidence correlation mapping threat activity to tactics and techniques. Select a case below to analyze.
        </p>
      </div>

      {/* Case Selector */}
      <div style={{ marginBottom: 24 }}>
        <select
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'var(--font-primary)',
            minWidth: 300,
          }}
        >
          <option value="">— Select a case —</option>
          {cases.map(c => (
            <option key={c._id} value={c._id}>{c.caseNumber} — {c.title}</option>
          ))}
        </select>
      </div>

      {/* MITRE Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--text-muted)', gap: 10 }}>
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading MITRE ATT&CK matrix...
        </div>
      ) : !selectedCaseId ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <Shield size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>Select a case above to visualize threat mapping.</p>
        </div>
      ) : evidence.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <Shield size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No evidence files found in this case. Upload logs to see MITRE mappings.</p>
        </div>
      ) : (
        <div className="mitre-matrix-grid">
          {(() => {
            const activeTechniques = {}
            evidence.forEach(ev => {
              if (ev.parsedData?.events) {
                ev.parsedData.events.forEach(e => {
                  if (e.mitreAttack?.techniqueId) {
                    activeTechniques[e.mitreAttack.techniqueId] = {
                      id: e.mitreAttack.techniqueId,
                      name: e.mitreAttack.techniqueName,
                      tactic: e.mitreAttack.tactic,
                      count: (activeTechniques[e.mitreAttack.techniqueId]?.count || 0) + 1
                    }
                  }
                })
              }
            })

            const tactics = [
              { name: 'Execution', techniques: [{ id: 'T1059', name: 'Command & Scripting Interpreter' }] },
              { name: 'Privilege Escalation', techniques: [{ id: 'T1548.001', name: 'Sudo/Su Abuse' }] },
              { name: 'Credential Access', techniques: [{ id: 'T1110', name: 'Brute Force' }] },
              { name: 'Defense Evasion', techniques: [{ id: 'T1078', name: 'Valid Accounts' }] },
              { name: 'Discovery', techniques: [{ id: 'T1033', name: 'System Owner Discovery' }, { id: 'T1046', name: 'Network Service Discovery' }] },
              { name: 'Command & Control', techniques: [{ id: 'T1105', name: 'Ingress Tool Transfer' }] },
              { name: 'Exfiltration', techniques: [{ id: 'T1041', name: 'Exfiltration over C2' }] }
            ]

            return tactics.map((tac, ti) => (
              <div key={ti} className="mitre-tactic-column">
                <div className="mitre-tactic-header">{tac.name}</div>
                {tac.techniques.map((tech, tei) => {
                  const active = activeTechniques[tech.id]
                  return (
                    <div key={tei} className={`mitre-technique-card ${active ? 'active' : ''}`}>
                      <span className="mitre-technique-id">{tech.id}</span>
                      <div style={{ fontWeight: active ? 600 : 400 }}>{tech.name}</div>
                      {active && (
                        <div style={{ fontSize: '0.68rem', color: '#d1b3ff', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                          {active.count} matches detected
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          })()}
        </div>
      )}
    </motion.div>
  )
}
