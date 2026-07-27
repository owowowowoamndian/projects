/**
 * MITRE ATT&CK Mapping & Rule Mapper
 * Maps forensic events to specific adversary Tactics & Techniques
 */

const RULES = [
  // 1. Brute Force
  {
    pattern: /failed\s+password|authentication\s+failure|login\s+failed|invalid\s+user|logon\s+failure|incorrect\s+password|event\s*id\s*:\s*4625|event_id=4625/i,
    techniqueId: 'T1110',
    techniqueName: 'Brute Force',
    tactic: 'Credential Access'
  },
  // 2. Valid Accounts
  {
    pattern: /accepted\s+password|session\s+opened|successful\s+logon|login\s+successful|event\s*id\s*:\s*4624|event_id=4624/i,
    techniqueId: 'T1078',
    techniqueName: 'Valid Accounts',
    tactic: 'Defense Evasion / Persistence'
  },
  // 3. Sudo / Su Elevation
  {
    pattern: /sudo\s+:|su\s+-\s+|privilege\s+escalation|root\s+login|run\s+as\s+admin|elevated\s+privileges/i,
    techniqueId: 'T1548.001',
    techniqueName: 'Abuse Elevation Control Mechanism: Sudo/Su',
    tactic: 'Privilege Escalation'
  },
  // 4. Discovery: System Owner/User
  {
    pattern: /whoami|id\s+|cat\s+\/etc\/passwd|uname\s+-a|sysinfo|hostname/i,
    techniqueId: 'T1033',
    techniqueName: 'System Owner/User Discovery',
    tactic: 'Discovery'
  },
  // 5. Discovery: Network Service
  {
    pattern: /nmap|port\s*scan|masscan|netstat|ifconfig|ipconfig|ping\s+/i,
    techniqueId: 'T1046',
    techniqueName: 'Network Service Discovery',
    tactic: 'Discovery'
  },
  // 6. Ingress Tool Transfer / Downloaders
  {
    pattern: /wget\s+|curl\s+|scp\s+|sftp\s+|ftp\s+|download\s+file|curl\s+-O/i,
    techniqueId: 'T1105',
    techniqueName: 'Ingress Tool Transfer',
    tactic: 'Command and Control'
  },
  // 7. Data Exfiltration
  {
    pattern: /exfiltrat|scp\s+.*@|tar\s+-czf|zip\s+-r|transfer\s+data/i,
    techniqueId: 'T1041',
    techniqueName: 'Exfiltration Over C2 Channel',
    tactic: 'Exfiltration'
  },
  // 8. Command and Scripting Interpreter
  {
    pattern: /\/bin\/bash|\/bin\/sh|powershell\.exe|cmd\.exe/i,
    techniqueId: 'T1059',
    techniqueName: 'Command and Scripting Interpreter',
    tactic: 'Execution'
  }
]

/**
 * Maps standard log content to MITRE ATT&CK technique details
 */
export function mapLogToAttack(logText) {
  if (!logText) return null

  for (const rule of RULES) {
    if (rule.pattern.test(logText)) {
      return {
        techniqueId: rule.techniqueId,
        techniqueName: rule.techniqueName,
        tactic: rule.tactic
      }
    }
  }

  return null
}
