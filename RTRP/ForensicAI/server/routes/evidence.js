import express from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import Evidence from '../models/Evidence.js'
import Case from '../models/Case.js'
import User from '../models/User.js'
import { computeFileHash, verifyFileHash } from '../utils/hash.js'
import { parseLogFile } from '../utils/parser.js'
import { optionalAuth } from '../middleware/auth.js'
import { logAudit } from '../middleware/audit.js'

// ─── Access helpers (shared with cases route) ────────────────────────────────
function toId(val) {
  if (!val) return null
  if (val._id) return val._id.toString()
  return val.toString()
}

async function getReqUser(req) {
  if (req.user && req.user.id) return req.user
  if (process.env.NODE_ENV !== 'production') {
    const dbUser = await User.findOne().lean()
    if (dbUser) return { id: dbUser._id.toString(), role: dbUser.role }
  }
  return null
}

function canAccessCase(caseDoc, userId, role) {
  if (role === 'admin') return true
  const creatorId = toId(caseDoc.createdBy)
  if (!creatorId) return false
  if (creatorId === userId.toString()) return true
  return (caseDoc.sharedWith || []).some(entry => toId(entry) === userId.toString())
}

const router = express.Router()

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.log', '.txt', '.csv', '.json', '.xml', '.pcap', '.evtx', '.img', '.dd', '.raw', '.zip', '.gz']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowedExts.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${ext} not allowed. Allowed: ${allowedExts.join(', ')}`), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5368709120') },
})

// POST /api/evidence/upload — Upload evidence with SHA-256 hashing
router.post('/upload', optionalAuth, upload.array('files', 10), async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req)

    // Viewers cannot upload evidence
    if (reqUser && reqUser.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot upload evidence' })
    }

    const { caseId } = req.body

    if (!caseId) {
      return res.status(400).json({ error: 'caseId is required' })
    }

    const caseDoc = await Case.findById(caseId)
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' })
    }

    // Verify current user has access to this case
    if (reqUser && !canAccessCase(caseDoc, reqUser.id, reqUser.role)) {
      return res.status(403).json({ error: 'Access denied to this case' })
    }

    const results = []
    const parseableExts = ['.log', '.txt', '.csv', '.json', '.xml', '.evtx']

    for (const file of req.files) {
      // Compute SHA-256 hash
      const sha256Hash = await computeFileHash(file.path)

      const evidence = await Evidence.create({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        sha256Hash,
        filePath: file.path,
        caseId,
        status: 'verified',
        uploadedBy: req.user?.id,
        verifiedAt: new Date(),
        metadata: {
          fileType: path.extname(file.originalname).replace('.', ''),
        },
      })

      // Auto-parse log files to extract timeline events
      const ext = path.extname(file.originalname).toLowerCase()
      if (parseableExts.includes(ext)) {
        try {
          const parsed = await parseLogFile(file.path)
          if (parsed && parsed.events && parsed.events.length > 0) {
            evidence.parsedData = {
              events: parsed.events.map(e => ({
                timestamp: e.timestamp || '',
                eventType: e.eventType || 'log_entry',
                source: e.source || file.originalname,
                detail: e.detail || '',
                severity: e.severity || 'info',
                raw: e.raw || '',
                threatIntel: e.threatIntel || { score: 0, isMalicious: false, details: '' },
                mitreAttack: e.mitreAttack || { techniqueId: '', techniqueName: '', tactic: '' }
              })),
              summary: parsed.summary,
              anomalies: parsed.events
                .filter(e => e.severity === 'danger' || e.severity === 'critical')
                .map(e => e.detail),
            }
            evidence.metadata.lineCount = parsed.lineCount
            evidence.status = 'parsed'
            await evidence.save()
            console.log(`Parsed ${parsed.parsedCount} events from ${file.originalname}`)
          }
        } catch (parseErr) {
          console.error(`Failed to parse ${file.originalname}:`, parseErr.message)
          // Upload still succeeds even if parsing fails
        }
      }

      // Link evidence to case
      caseDoc.evidence.push(evidence._id)

      await logAudit('evidence_uploaded', 'evidence', evidence._id,
        `Evidence "${file.originalname}" uploaded (SHA-256: ${sha256Hash.substring(0, 16)}...)`, req)

      results.push(evidence)
    }

    await caseDoc.save()

    res.status(201).json({
      message: `${results.length} evidence file(s) uploaded and hashed`,
      evidence: results,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/evidence/:id — Get evidence metadata
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' })
    }
    res.json(evidence)
  } catch (err) {
    next(err)
  }
})

// POST /api/evidence/:id/parse — Parse an evidence file
router.post('/:id/parse', optionalAuth, async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req)
    if (reqUser && reqUser.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot parse evidence' })
    }

    const evidence = await Evidence.findById(req.params.id)
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' })
    }

    // Check case access
    const caseDoc = await Case.findById(evidence.caseId)
    if (caseDoc && reqUser && !canAccessCase(caseDoc, reqUser.id, reqUser.role)) {
      return res.status(403).json({ error: 'Access denied to this case' })
    }

    evidence.status = 'parsing'
    await evidence.save()

    try {
      const parsedResult = await parseLogFile(evidence.filePath)

      evidence.parsedData = {
        events: parsedResult.events.map(e => ({
          timestamp: e.timestamp || '',
          eventType: e.eventType || 'log_entry',
          source: e.source,
          detail: e.detail,
          severity: e.severity,
          raw: e.raw,
          threatIntel: e.threatIntel || { score: 0, isMalicious: false, details: '' },
          mitreAttack: e.mitreAttack || { techniqueId: '', techniqueName: '', tactic: '' }
        })),
        summary: parsedResult.summary,
        anomalies: parsedResult.events
          .filter(e => e.severity === 'danger' || e.severity === 'critical')
          .map(e => e.detail),
      }

      evidence.metadata.lineCount = parsedResult.lineCount
      evidence.status = 'parsed'

      if (parsedResult.events.length > 0) {
        const timestamps = parsedResult.events
          .map(e => new Date(e.timestamp))
          .filter(d => !isNaN(d))
        if (timestamps.length > 0) {
          evidence.metadata.dateRange = {
            start: new Date(Math.min(...timestamps)),
            end: new Date(Math.max(...timestamps)),
          }
        }
      }

      await evidence.save()

      await logAudit('evidence_parsed', 'evidence', evidence._id,
        `Parsed ${parsedResult.parsedCount} events from "${evidence.originalName}"`, req)

      res.json({
        message: 'Evidence parsed successfully',
        summary: parsedResult.summary,
        eventCount: parsedResult.parsedCount,
        anomalies: evidence.parsedData.anomalies.length,
      })
    } catch (parseErr) {
      evidence.status = 'error'
      await evidence.save()
      return res.status(422).json({ error: 'Failed to parse evidence', details: parseErr.message })
    }
  } catch (err) {
    next(err)
  }
})

// POST /api/evidence/:id/verify — Re-verify evidence integrity
router.post('/:id/verify', optionalAuth, async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req)
    if (reqUser && reqUser.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot verify evidence' })
    }

    const evidence = await Evidence.findById(req.params.id)
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' })
    }

    // Check case access
    const caseDoc = await Case.findById(evidence.caseId)
    if (caseDoc && reqUser && !canAccessCase(caseDoc, reqUser.id, reqUser.role)) {
      return res.status(403).json({ error: 'Access denied to this case' })
    }

    const result = await verifyFileHash(evidence.filePath, evidence.sha256Hash)

    evidence.hashVerifications.push({
      verifiedAt: new Date(),
      verifiedBy: req.user?.name || 'System',
      result: result.match ? 'match' : 'mismatch',
    })

    await evidence.save()

    await logAudit('evidence_hash_check', 'evidence', evidence._id,
      `Hash verification: ${result.match ? 'MATCH' : 'MISMATCH'}`, req)

    res.json({
      match: result.match,
      computedHash: result.computedHash,
      storedHash: result.expectedHash,
      verifiedAt: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/evidence/parse-all/:caseId — Force re-parse ALL evidence for a case
router.post('/parse-all/:caseId', optionalAuth, async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req)
    if (reqUser && reqUser.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot re-parse evidence' })
    }

    const caseDoc = await Case.findById(req.params.caseId)
    if (caseDoc && reqUser && !canAccessCase(caseDoc, reqUser.id, reqUser.role)) {
      return res.status(403).json({ error: 'Access denied to this case' })
    }

    // Find ALL evidence for this case (including already-parsed ones)
    const evidenceList = await Evidence.find({ caseId: req.params.caseId })

    if (evidenceList.length === 0) {
      return res.json({ message: 'No evidence found for this case', parsed: 0 })
    }

    const parseableExts = ['.log', '.txt', '.csv', '.json', '.xml', '.evtx']
    let parsed = 0
    const results = []

    for (const evidence of evidenceList) {
      const ext = path.extname(evidence.originalName).toLowerCase()
      if (!parseableExts.includes(ext)) {
        results.push({ file: evidence.originalName, status: 'skipped', reason: 'binary format' })
        continue
      }
      try {
        const parsedResult = await parseLogFile(evidence.filePath)
        evidence.parsedData = {
          events: parsedResult.events.map(e => ({
            timestamp: e.timestamp || '',
            eventType: e.eventType || 'log_entry',
            source: e.source || evidence.originalName,
            detail: e.detail || '',
            severity: e.severity || 'info',
            raw: e.raw || '',
            threatIntel: e.threatIntel || { score: 0, isMalicious: false, details: '' },
            mitreAttack: e.mitreAttack || { techniqueId: '', techniqueName: '', tactic: '' }
          })),
          summary: parsedResult.summary,
          anomalies: parsedResult.events
            .filter(e => e.severity === 'danger' || e.severity === 'critical')
            .map(e => e.detail),
        }
        evidence.metadata.lineCount = parsedResult.lineCount
        evidence.status = parsedResult.events.length > 0 ? 'parsed' : 'verified'
        await evidence.save()
        parsed++
        results.push({ file: evidence.originalName, status: 'ok', events: parsedResult.parsedCount })
        console.log(`✅ Re-parsed ${evidence.originalName}: ${parsedResult.parsedCount} events`)
      } catch (parseErr) {
        console.error(`❌ Failed to re-parse ${evidence.originalName}:`, parseErr.message)
        results.push({ file: evidence.originalName, status: 'error', error: parseErr.message })
      }
    }

    res.json({ message: `Re-parsed ${parsed} of ${evidenceList.length} evidence file(s)`, parsed, results })
  } catch (err) {
    next(err)
  }
})

export default router
