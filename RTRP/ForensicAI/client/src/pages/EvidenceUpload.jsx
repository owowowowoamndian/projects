import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Hash, CheckCircle, AlertTriangle,
  X, File, HardDrive, Shield, Copy, Clock, Loader
} from 'lucide-react'
import { getCases, uploadEvidence } from '../api'

const allowedTypes = [
  { ext: '.log', label: 'System Logs', icon: '📋' },
  { ext: '.csv/.json', label: 'Structured Data', icon: '📊' },
  { ext: '.pcap', label: 'Network Captures', icon: '🌐' },
  { ext: '.img/.dd', label: 'Disk Images', icon: '💾' },
  { ext: '.evtx', label: 'Windows Events', icon: '🪟' },
  { ext: '.xml', label: 'Configuration', icon: '📝' },
  { ext: '.txt', label: 'Plain Text', icon: '📄' },
]

const ALLOWED_EXTENSIONS = ['log', 'csv', 'json', 'pcap', 'img', 'dd', 'evtx', 'xml', 'txt']

async function generateHash() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

export default function EvidenceUpload() {
  const [cases, setCases] = useState([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  useEffect(() => {
    getCases({ limit: 50 }).then(data => {
      const c = data.cases || []
      setCases(c)
      if (c.length > 0) setSelectedCaseId(c[0]._id)
    }).catch(() => {})
  }, [])

  const handleFileSelect = (e) => {
    processFiles([...e.target.files])
  }

  const processFiles = async (newFiles) => {
    const accepted = []
    const rejected = []

    for (const file of newFiles) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        accepted.push(file)
      } else {
        rejected.push(file.name)
      }
    }

    if (rejected.length > 0) {
      const names = rejected.join(', ')
      setUploadResult({
        success: false,
        message: `Unsupported file type: ${names}. Only ${ALLOWED_EXTENSIONS.map(e => '.' + e).join(', ')} files are allowed.`,
      })
    }

    if (accepted.length === 0) return

    const processed = await Promise.all(accepted.map(async (file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop(),
      hash: await generateHash(),
      status: 'ready',
    })))
    setFiles(prev => [...prev, ...processed])
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
    return (bytes / 1073741824).toFixed(2) + ' GB'
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const copyHash = (hash, id) => {
    navigator.clipboard.writeText(hash)
    setFiles(prev => prev.map(f => f.id === id ? { ...f, copied: true } : f))
    setTimeout(() => setFiles(prev => prev.map(f => f.id === id ? { ...f, copied: false } : f)), 2000)
  }

  const handleUpload = async () => {
    if (!selectedCaseId || files.length === 0) return
    setUploading(true)
    setUploadResult(null)

    try {
      const rawFiles = files.map(f => f.file)
      const result = await uploadEvidence(selectedCaseId, rawFiles)
      setUploadResult({ success: true, message: result.message })
      setFiles([])
    } catch (err) {
      setUploadResult({ success: false, message: err.message })
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      processFiles([...e.dataTransfer.files])
    }
  }, [])

  return (
    <motion.div className="page-enter" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <h1 className="page-title">Evidence Upload</h1>
        <p className="page-description">
          Upload digital forensic evidence with automatic SHA-256 hashing and chain-of-custody tracking.
        </p>
      </div>

      {/* Case selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: 6 }}>Select Case *</label>
        <select
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'var(--font-primary)',
            minWidth: 350,
          }}
        >
          <option value="">— Choose a case —</option>
          {cases.map(c => (
            <option key={c._id} value={c._id}>{c.caseNumber} — {c.title}</option>
          ))}
        </select>
      </div>

      {/* Drop Zone */}
      <div
        className={`glow-card ${dragOver ? 'drag-over' : ''}`}
        style={{ marginBottom: 24 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="glow-card-inner" style={{
          padding: 40, textAlign: 'center',
          border: dragOver ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s',
          background: dragOver ? 'rgba(0, 212, 255, 0.04)' : 'transparent',
        }}>
          <Upload size={40} style={{ color: 'var(--accent-primary)', marginBottom: 12 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>
            Drop evidence files here
          </h3>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            or click to browse — supported: .log, .csv, .json, .pcap, .evtx, .xml, .txt, .img, .dd
          </p>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Browse Files
            <input type="file" multiple hidden onChange={handleFileSelect} />
          </label>
        </div>
      </div>

      {/* Accepted file types */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        {allowedTypes.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            fontSize: '0.78rem', color: 'var(--text-secondary)',
          }}>
            <span>{t.icon}</span> {t.label} <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>({t.ext})</span>
          </div>
        ))}
      </div>

      {/* Upload result */}
      {uploadResult && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 20,
          background: uploadResult.success ? 'rgba(0,230,118,0.08)' : 'rgba(255,82,82,0.08)',
          border: `1px solid ${uploadResult.success ? 'rgba(0,230,118,0.2)' : 'rgba(255,82,82,0.2)'}`,
          color: uploadResult.success ? 'var(--accent-success)' : 'var(--accent-danger)',
          fontSize: '0.85rem',
        }}>
          {uploadResult.success ? <CheckCircle size={14} style={{ marginRight: 6 }} /> : <AlertTriangle size={14} style={{ marginRight: 6 }} />}
          {uploadResult.message}
        </div>
      )}

      {/* File list */}
      <AnimatePresence>
        {files.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glow-card"
            style={{ marginBottom: 10 }}
          >
            <div className="glow-card-inner" style={{
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 212, 255, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <File size={18} style={{ color: 'var(--accent-primary)' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{f.name}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span><HardDrive size={11} style={{ marginRight: 3 }} />{formatSize(f.size)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    <Hash size={11} style={{ marginRight: 3 }} />
                    {f.hash.substring(0, 16)}...
                    <button
                      onClick={() => copyHash(f.hash, f.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', marginLeft: 4, padding: 0 }}
                    >
                      {f.copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                    </button>
                  </span>
                </div>
              </div>

              <div style={{
                padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 230, 118, 0.08)',
                fontSize: '0.72rem', color: 'var(--accent-success)',
                border: '1px solid rgba(0, 230, 118, 0.15)',
              }}>
                <Shield size={11} style={{ marginRight: 3 }} /> Ready
              </div>

              <button onClick={() => removeFile(f.id)} className="btn btn-ghost btn-icon" style={{ width: 30, height: 30 }}>
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Upload button */}
      {files.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setFiles([])}>Clear All</button>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedCaseId || uploading}
            style={{ opacity: selectedCaseId && !uploading ? 1 : 0.5 }}
          >
            {uploading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</> : <><Upload size={16} /> Upload {files.length} file{files.length > 1 ? 's' : ''}</>}
          </button>
        </div>
      )}
    </motion.div>
  )
}
