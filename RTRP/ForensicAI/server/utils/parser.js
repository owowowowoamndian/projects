import fs from 'fs'
import path from 'path'
import { getIpReputation, getHashReputation } from '../services/threatIntelService.js'
import { mapLogToAttack } from './attackMapper.js'

/**
 * Parse a log/evidence file and extract timestamped events.
 * Supports: syslog, auth.log, Apache/Nginx, JSON, CSV (any extension),
 *           key-value structured logs, and Windows Event format.
 */
export async function parseLogFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const content = fs.readFileSync(filePath, 'utf-8')

  let parsed;
  if (ext === '.json') {
    parsed = parseJsonLog(content)
  } else if (ext === '.csv' || isCsvContent(content)) {
    parsed = parseCsvLog(content)
  } else if (isKeyValueLog(content)) {
    parsed = parseKeyValueLog(content)
  } else {
    parsed = parseTextLog(content)
  }

  // Enrich events with Threat Intel & MITRE mapping
  if (parsed && parsed.events) {
    const cache = { ip: {}, hash: {} }
    
    for (let i = 0; i < parsed.events.length; i++) {
      const event = parsed.events[i]
      
      // 1. MITRE ATT&CK Mapping
      const attack = mapLogToAttack(event.detail || event.raw)
      if (attack) {
        event.mitreAttack = attack
      }

      // 2. Threat Intel IOC Extraction (IPs)
      const ipMatches = (event.detail || event.raw || '').match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g)
      if (ipMatches) {
        for (const ip of ipMatches) {
          if (cache.ip[ip] === undefined) {
            if (Object.keys(cache.ip).length < 50) {
              cache.ip[ip] = await getIpReputation(ip)
            } else {
              cache.ip[ip] = { score: 0, isMalicious: false, details: '' }
            }
          }
          const rep = cache.ip[ip]
          if (rep && rep.score > 0) {
            if (!event.threatIntel || rep.score > event.threatIntel.score) {
              event.threatIntel = rep
            }
          }
        }
      }

      // 3. Threat Intel IOC Extraction (Hashes)
      const hashMatches = (event.detail || event.raw || '').match(/\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{64}\b/g)
      if (hashMatches) {
        for (const hash of hashMatches) {
          if (cache.hash[hash] === undefined) {
            if (Object.keys(cache.hash).length < 50) {
              cache.hash[hash] = await getHashReputation(hash)
            } else {
              cache.hash[hash] = { score: 0, isMalicious: false, details: '' }
            }
          }
          const rep = cache.hash[hash]
          if (rep && rep.score > 0) {
            if (!event.threatIntel || rep.score > event.threatIntel.score) {
              event.threatIntel = rep
            }
          }
        }
      }
    }
  }

  return parsed
}

/** Detect CSV content regardless of file extension */
function isCsvContent(content) {
  const firstLine = content.split('\n').find(l => l.trim())
  if (!firstLine) return false
  const cols = firstLine.split(',')
  // Has multiple comma-separated columns AND first column looks like a timestamp header
  return cols.length >= 3 && /timestamp|time|date/i.test(cols[0])
}

/** Detect key-value block log format: lines like "Timestamp: 2026-02-18 09:16:05" */
function isKeyValueLog(content) {
  return /^\s*Timestamp\s*:/im.test(content)
}

// ─── Text Log Parser ────────────────────────────────────────────────────────

function parseTextLog(content) {
  const lines = content.split('\n').filter(l => l.trim())
  const events = []

  const patterns = [
    // Forensic: "2026-02-18 09:12:03 INFO  User login" (one or more spaces between level and message)
    {
      regex: /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(INFO|WARN|WARNING|ERROR|DEBUG|CRITICAL|FATAL)\s+(.*)/i,
      extract: (m) => ({ timestamp: m[1].trim(), source: m[2].trim().toUpperCase(), detail: m[3].trim() }),
    },
    // Syslog: "Feb 19 03:42:11 hostname service[pid]: message"
    {
      regex: /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.*)/,
      extract: (m) => ({ timestamp: m[1], source: m[2], detail: m[3] }),
    },
    // ISO timestamp: "2026-02-19T03:42:11Z message" or "2026-02-19T03:42:11.000Z message"
    {
      regex: /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\s+(.*)/,
      extract: (m) => ({ timestamp: m[1], source: 'log', detail: m[2] }),
    },
    // Apache/Nginx: "[19/Feb/2026:03:42:11 +0000] ..."
    {
      regex: /\[(\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s*[+-]\d{4})\]\s*(.*)/,
      extract: (m) => ({ timestamp: m[1], source: 'http', detail: m[2] }),
    },
    // Windows Event: "02/19/2026 03:42:11 ..."
    {
      regex: /^(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})\s+(.*)/,
      extract: (m) => ({ timestamp: m[1], source: 'windows', detail: m[2] }),
    },
    // Auth.log style: "2026-02-18 09:12:03 hostname kernel: message"
    {
      regex: /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\S+):\s+(.*)/,
      extract: (m) => ({ timestamp: m[1], source: m[2], detail: m[3] }),
    },
  ]

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern.regex)
      if (match) {
        const extracted = pattern.extract(match)
        events.push({
          timestamp: extracted.timestamp,
          source: extracted.source || 'log',
          detail: extracted.detail || line,
          severity: detectSeverity(line),
          raw: line,
          eventType: detectEventType(line),
        })
        break
      }
    }
  }

  return {
    events,
    lineCount: lines.length,
    parsedCount: events.length,
    summary: `Parsed ${events.length} events from ${lines.length} log lines`,
  }
}

// ─── CSV Log Parser ──────────────────────────────────────────────────────────

function parseCsvLog(content) {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length < 2) return { events: [], lineCount: 0, parsedCount: 0, summary: 'Empty CSV' }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const events = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const entry = {}
    headers.forEach((h, idx) => {
      entry[h] = values[idx]?.trim() || ''
    })

    // Build a meaningful detail string from all CSV columns
    const detail = headers
      .filter(h => h !== 'timestamp' && h !== 'time' && h !== 'date')
      .map(h => `${h}=${entry[h]}`)
      .join(' | ')

    const rawDetail = entry.message || entry.description || entry.event ||
      entry.action || detail || lines[i]

    events.push({
      timestamp: entry.timestamp || entry.time || entry.date || '',
      source: entry['source ip'] || entry.source || entry.host || entry.protocol || 'csv',
      detail: rawDetail,
      severity: detectSeverity(lines[i]),
      raw: lines[i],
      eventType: detectEventType(lines[i]),
    })
  }

  return {
    events,
    lineCount: lines.length - 1,
    parsedCount: events.length,
    summary: `Parsed ${events.length} CSV records`,
  }
}

// ─── Key-Value Block Log Parser ───────────────────────────────────────────────
// Handles formats like:
//   Event ID: 44821
//   Timestamp: 2026-02-18 09:16:05
//   Module: UserManagement
//   Description: User role modified from 'student' to 'admin'
//   Performed By: admin

function parseKeyValueLog(content) {
  // Split into blocks separated by blank lines or separator lines
  const blocks = content.split(/\n\s*\n/)
  const events = []

  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim())
    const entry = {}

    for (const line of lines) {
      const kvMatch = line.match(/^([^:]+):\s*(.*)/)
      if (kvMatch) {
        const key = kvMatch[1].trim().toLowerCase().replace(/\s+/g, '_')
        entry[key] = kvMatch[2].trim()
      }
    }

    // Must have a timestamp to be a valid event
    const timestamp = entry.timestamp || entry.time || entry.date
    if (!timestamp || !/\d{4}-\d{2}-\d{2}/.test(timestamp)) continue

    const detail =
      entry.description ||
      entry.message ||
      entry.event ||
      Object.entries(entry)
        .filter(([k]) => k !== 'timestamp' && k !== 'time' && k !== 'date')
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')

    const source = entry.module || entry.source || entry.performed_by || entry.host || 'system'

    events.push({
      timestamp,
      source,
      detail,
      severity: detectSeverity(block),
      raw: block.replace(/\n/g, ' | '),
      eventType: detectEventType(block),
    })
  }

  return {
    events,
    lineCount: content.split('\n').length,
    parsedCount: events.length,
    summary: `Parsed ${events.length} structured log events`,
  }
}

// ─── JSON Log Parser ──────────────────────────────────────────────────────────

function parseJsonLog(content) {
  try {
    const data = JSON.parse(content)
    const entries = Array.isArray(data) ? data : [data]

    const events = entries.map(entry => ({
      timestamp: entry.timestamp || entry.time || entry.date || entry['@timestamp'] || '',
      source: entry.source || entry.logger || entry.facility || 'json',
      detail: entry.message || entry.msg || entry.description || JSON.stringify(entry),
      severity: entry.level || entry.severity || detectSeverity(JSON.stringify(entry)),
      raw: JSON.stringify(entry),
      eventType: entry.type || entry.event_type || detectEventType(JSON.stringify(entry)),
    }))

    return {
      events,
      lineCount: entries.length,
      parsedCount: events.length,
      summary: `Parsed ${events.length} JSON log entries`,
    }
  } catch {
    return { events: [], lineCount: 0, parsedCount: 0, summary: 'Failed to parse JSON' }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectSeverity(text) {
  const lower = text.toLowerCase()
  if (/critical|fatal|emergency|panic/.test(lower)) return 'critical'
  if (/error|fail|denied|refused|attack|malicious|exfiltrat|multiple.*fail|brute/.test(lower)) return 'danger'
  if (/warn|alert|suspicious|unusual|escalat|restricted|blocked/.test(lower)) return 'warning'
  return 'info'
}

function detectEventType(text) {
  const lower = text.toLowerCase()
  if (/login|auth|password|credential|ssh|session/.test(lower)) return 'authentication'
  if (/network|tcp|udp|port|scan|connection|ip=|source ip|dest/.test(lower)) return 'network'
  if (/file|read|write|access|permission|directory|path/.test(lower)) return 'file_access'
  if (/sudo|root|admin|privilege|escalat|role.*admin/.test(lower)) return 'privilege_escalation'
  if (/exfiltrat|transfer|upload|download|scp/.test(lower)) return 'data_transfer'
  if (/malware|virus|trojan|ransomware/.test(lower)) return 'malware'
  return 'system'
}

// ─── Timeline Builder ─────────────────────────────────────────────────────────

/**
 * Build a unified timeline from multiple evidence sources
 */
export function buildTimeline(evidenceList) {
  const allEvents = []

  for (const evidence of evidenceList) {
    if (evidence.parsedData && evidence.parsedData.events) {
      for (const event of evidence.parsedData.events) {
        // .toObject() converts Mongoose subdocument to plain JS object
        // Without this, spread operator loses all schema-defined properties
        const plainEvent = typeof event.toObject === 'function' ? event.toObject() : { ...event }
        allEvents.push({
          ...plainEvent,
          evidenceId: evidence._id,
          evidenceName: evidence.originalName,
        })
      }
    }
  }

  // Sort by timestamp
  allEvents.sort((a, b) => {
    const dateA = new Date(a.timestamp)
    const dateB = new Date(b.timestamp)
    if (isNaN(dateA) && isNaN(dateB)) return 0
    if (isNaN(dateA)) return 1
    if (isNaN(dateB)) return -1
    return dateA - dateB
  })

  // Group by date
  const grouped = {}
  for (const event of allEvents) {
    let dateKey = 'Unknown'
    if (event.timestamp) {
      const ts = String(event.timestamp).trim()
      if (ts.includes('T')) {
        dateKey = ts.split('T')[0]
      } else if (ts.includes(' ')) {
        dateKey = ts.split(' ')[0]
      } else if (/^\d{4}-\d{2}-\d{2}/.test(ts)) {
        dateKey = ts.substring(0, 10)
      }
    }
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(event)
  }

  return {
    totalEvents: allEvents.length,
    dateGroups: Object.entries(grouped).map(([date, events]) => ({ date, events })),
    events: allEvents,
  }
}
