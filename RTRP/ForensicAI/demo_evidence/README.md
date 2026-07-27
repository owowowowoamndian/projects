# 🕵️ Operation ShadowBreak — Demo Forensic Case Brief

**Case Number:** FR-2026-DEMO-001  
**Classification:** CONFIDENTIAL — FOR TESTING PURPOSES ONLY  
**Priority:** Critical  
**Incident ID:** INC-2026-0519  
**Organisation:** WebburnsTech Pvt. Ltd.  
**Affected Host:** WEBBURNS-SRV01 (192.168.10.50)  
**Attack Duration:** 2026-05-15 08:02 UTC → 15:15 UTC (~7 hours 13 minutes)

---

## 📋 Case Summary

WebburnsTech Pvt. Ltd. suffered a full Advanced Persistent Threat (APT) attack on May 15, 2026. A threat actor performed targeted reconnaissance, launched a coordinated SSH brute-force campaign, achieved initial access via compromised credentials, escalated privileges to root, deployed multiple malware payloads, moved laterally across the internal network, and exfiltrated approximately **260 MB of sensitive data** including customer PII, financial records, and internal network documentation to an attacker-controlled C2 server.

---

## 🚨 Attacker IP Addresses (IOCs)

| IP Address       | Role                          | Expected in AbuseIPDB |
|------------------|-------------------------------|-----------------------|
| 185.220.101.45   | Reconnaissance / Port Scanner | ✅ Yes (Tor exit node) |
| 194.165.16.11    | SSH Brute Force Source        | ✅ Yes (known scanner) |
| 45.227.254.20    | C2 Server / Exfiltration Dest | ✅ Yes (malicious)    |

## 🔑 File Hash IOCs (for VirusTotal Check)

| Hash | Type | Malware |
|------|------|---------|
| `84c82835a5d21bbcf75a61706d8ab549` | MD5 | Mimikatz credential dumper |
| `db349b97c37d22f5ea1d1841e3c89eb4` | MD5 | WannaCry ransomware dropper |
| `b8938d4b461a23d2d5a4dc23ee87b0f0` | MD5 | Cobalt Strike Beacon |
| `24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c` | SHA256 | Cobalt Strike Beacon |
| `ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa` | SHA256 | WannaCry ransomware |
| `a31f222fc283227f5e7988d1ad9c0aecd32c3b8f9a7d8e3f2b1c9e0f4a7b2c5d` | SHA256 | Mimikatz variant |

---

## 🗂️ Evidence Files — What Each Tests

| File | Format | Parser Used | Features Tested |
|------|--------|-------------|-----------------|
| `01_ssh_auth_brute_force.log` | Syslog (`MMM DD HH:MM:SS`) | Text Parser | T1110 Brute Force, T1078 Valid Accounts, IP IOCs |
| `02_firewall_network_traffic.csv` | CSV (header: `timestamp,...`) | CSV Parser | T1046 Network Discovery, T1105 Tool Transfer, T1041 Exfiltration, IP IOCs |
| `03_windows_security_events.log` | Windows Event (`MM/DD/YYYY HH:MM:SS`) | Text Parser | T1110, T1078, T1059, T1548 Sudo, T1033 Discovery, Hash IOCs |
| `04_malware_edr_alerts.json` | JSON Array | JSON Parser | Hash IOCs (MD5+SHA256), T1059, T1105, T1041, Full ATT&CK chain |
| `05_privilege_escalation_audit.log` | Key-Value Blocks (`Timestamp: ...`) | KV Parser | T1548 Sudo, T1033 System Discovery, T1046 Nmap, T1105 wget/curl, T1041 scp |
| `06_full_attack_chain_timeline.log` | ISO 8601 (`2026-05-15T...Z`) | Text Parser | All 8 MITRE techniques, all 3 attacker IPs, complete kill chain |

---

## 🎯 MITRE ATT&CK Techniques Covered

| ID | Name | Tactic | Triggered By |
|----|------|--------|--------------|
| **T1110** | Brute Force | Credential Access | Files 01, 02, 03 |
| **T1078** | Valid Accounts | Initial Access | Files 01, 03, 06 |
| **T1033** | System Owner/User Discovery | Discovery | Files 01, 05, 06 |
| **T1046** | Network Service Discovery | Discovery | Files 02, 05, 06 |
| **T1548.001** | Sudo/Su Privilege Escalation | Privilege Escalation | Files 01, 05, 06 |
| **T1105** | Ingress Tool Transfer | Command & Control | Files 01, 02, 05, 06 |
| **T1059** | Command & Scripting Interpreter | Execution | Files 03, 04, 05, 06 |
| **T1041** | Exfiltration Over C2 Channel | Exfiltration | Files 02, 04, 05, 06 |

---

## ⏱️ Attack Timeline

```
08:02  →  Reconnaissance     185.220.101.45 port scans & nmap fingerprinting
09:14  →  Probe              194.165.16.11 SSH handshake test
10:31  →  Brute Force        194.165.16.11 SSH brute force (147 failed attempts)
10:46  →  Lockout            jmiller account locked out by policy
12:10  →  Bypass             Administrator manually unlocks jmiller account
12:47  →  ⚠ INITIAL ACCESS  SSH accepted password for jmiller from 194.165.16.11
12:47  →  Discovery          whoami, id, uname -a, cat /etc/passwd, netstat, nmap
12:47  →  ⚠ PRIV ESC        sudo /bin/bash → root shell obtained
12:50  →  Tool Download      wget + curl from 45.227.254.20 (Mimikatz + Cobalt Strike)
12:50  →  ⚠ C2 BEACON       /bin/bash agent.sh → 45.227.254.20:4444 connected
12:51  →  Cred Dump          Mimikatz LSASS dump → 6 domain accounts harvested
13:04  →  2nd Attacker       45.227.254.20 SSH brute force → root login
13:10  →  Lateral Movement   Pass-the-hash to WEBBURNS-WS10 (10.0.1.100)
13:15  →  Persistence        WindowsAudioSvc32 service installed (auto-start)
13:30  →  Collection         MySQL dump (48,000 customer records)
13:45  →  Collection         847 sensitive files staged from file server
14:05  →  Data Staging       tar -czf 160MB archive
14:10  →  ⚠ EXFILTRATION    scp 160MB → 45.227.254.20 (complete)
14:30  →  ⚠ EXFILTRATION    HTTPS 100MB → 45.227.254.20 (complete)
15:00  →  Anti-Forensics     Log wipe + bash history cleared + file shred
15:15  →  Disconnect         Attacker C2 dropped gracefully
15:20  →  Detection          SIEM APT kill chain alert fired (INC-2026-0519)
15:30  →  Containment        Firewall blocks applied, EDR isolation activated
```

---

## 🔬 How to Use in ForensicAI

### Step 1 — Create a New Case
- Go to **Cases** → **New Case**
- Title: `Operation ShadowBreak — WebburnsTech Intrusion`
- Priority: `Critical`
- Status: `Active`
- Description: `Full APT intrusion at WebburnsTech Pvt. Ltd. on 2026-05-15. Threat actor performed reconnaissance, brute force, privilege escalation, lateral movement and exfiltrated 260MB of sensitive data. Incident ID: INC-2026-0519.`

### Step 2 — Upload Evidence Files
- Go to **Evidence Upload**
- Upload all 6 files from this directory
- Click **Parse** on each file after upload
- Wait for parsing + MITRE + Threat Intel enrichment to complete

### Step 3 — Review Timeline
- Go to **Case Detail** → **Timeline** tab
- Filter by `Critical` to see the breach moments
- Filter by `Danger` to see tool downloads and lateral movement
- Observe date grouping at 08:xx, 10:xx, 12:xx, 13:xx, 14:xx, 15:xx

### Step 4 — Check MITRE ATT&CK Matrix
- Go to **MITRE ATT&CK** page from case detail
- All 8 technique cards should be highlighted
- Verify: T1110, T1078, T1033, T1046, T1548, T1105, T1059, T1041

### Step 5 — Threat Intelligence (IOCs)
- Go to **Threat IOCs** dashboard
- Verify IPs flagged: 185.220.101.45, 194.165.16.11, 45.227.254.20
- Verify hashes flagged from VirusTotal (Mimikatz MD5, WannaCry SHA256)
- *(Requires valid AbuseIPDB and VirusTotal API keys in Settings → AI & Threat Intel)*

### Step 6 — RAG Chat
- Go to **Case Chat** within the case
- Try these queries:
  - *"When was the first successful login and from which IP?"*
  - *"What data was exfiltrated and how much?"*
  - *"Which MITRE techniques were used for privilege escalation?"*
  - *"What malware files were detected with their hashes?"*
  - *"Was there any anti-forensics activity?"*

### Step 7 — AI Report Generation
- Go to **Reports** → **Generate Report**
- Select this case
- The AI will generate all sections: Executive Summary, Key Findings, Timeline, Technical Analysis, IOCs, Recommendations
- Edit and approve sections before PDF export

---

*This dataset was crafted specifically for ForensicAI platform testing.*  
*All IPs, hashes, and events are based on real documented threat intelligence but assembled for educational demonstration.*
