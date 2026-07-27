import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FolderOpen, FileText, Shield, AlertTriangle, TrendingUp,
  TrendingDown, Clock, Upload, CheckCircle, ArrowRight,
  Activity, Database, Cpu, Eye, Loader, Bot, MessageSquare
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { getDashboardStats, getDashboardActivity, getCases } from '../api'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
}

const fallbackStats = [
  { label: 'Active Cases', value: '0', icon: FolderOpen, color: 'cyan', trend: 'No data yet', up: true },
  { label: 'Evidence Files', value: '0', icon: Database, color: 'purple', trend: 'Upload evidence', up: true },
  { label: 'Reports Generated', value: '0', icon: FileText, color: 'green', trend: 'Generate reports', up: true },
  { label: 'Integrity Alerts', value: '0', icon: AlertTriangle, color: 'red', trend: 'All clear', up: true },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: '0.8rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState(fallbackStats)
  const [caseActivity, setCaseActivity] = useState([])
  const [evidenceTypes, setEvidenceTypes] = useState([{ name: 'No data', value: 1, color: '#555' }])
  const [recentCases, setRecentCases] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [dashData, casesData, activityData] = await Promise.all([
          getDashboardStats(),
          getCases({ limit: 5, sort: '-createdAt' }),
          getDashboardActivity(),
        ])

        const s = dashData.stats
        setStats([
          { label: 'Active Cases', value: String(s.activeCases || 0), icon: FolderOpen, color: 'cyan', trend: `${s.totalCases || 0} total`, up: true },
          { label: 'Evidence Files', value: String(s.totalEvidence || 0), icon: Database, color: 'purple', trend: 'Uploaded', up: true },
          { label: 'Threat Indicators', value: String(s.totalIocs || 0), icon: Shield, color: 'orange', trend: 'Across cases', up: true },
          { label: 'Critical Threat Flags', value: String(s.criticalThreats || 0), icon: AlertTriangle, color: 'red', trend: s.criticalThreats > 0 ? 'Requires action' : 'All clear', up: s.criticalThreats === 0 },
          { label: 'Reports Generated', value: String(s.totalReports || 0), icon: FileText, color: 'green', trend: `${s.draftReports || 0} drafts`, up: true },
          { label: 'Integrity Alerts', value: String(s.integrityAlerts || 0), icon: AlertTriangle, color: 'red', trend: s.integrityAlerts > 0 ? 'Requires attention' : 'All clear', up: s.integrityAlerts === 0 },
        ])
        setCaseActivity(dashData.caseActivity || [])
        setEvidenceTypes(dashData.evidenceTypes || [{ name: 'No data', value: 1, color: '#555' }])

        const cases = (casesData.cases || []).map(c => ({
          id: c.caseNumber || c._id,
          _id: c._id,
          title: c.title,
          status: c.status,
          priority: c.priority,
          date: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
        }))
        setRecentCases(cases)

        setActivities(activityData.activities || [])
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 12, color: 'var(--text-muted)' }}>
        <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
        Loading dashboard...
      </div>
    )
  }

  return (
    <motion.div className="page-enter" variants={container} initial="hidden" animate="show">
      <motion.div className="page-header" variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Investigation Dashboard</h1>
          <p className="page-description">
            Overview of your digital forensics investigations, evidence integrity, and AI-assisted reporting status.
          </p>
        </div>
        <Link to="/chat" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={16} /> AI Chat Assistant
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="stats-grid" variants={container} initial="hidden" animate="show">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div className="glow-card" key={i} variants={item}>
              <div className="glow-card-inner">
                <div className={`stat-card-icon ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-trend ${stat.up ? 'up' : 'down'}`}>
                  {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.trend}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Row */}
      <motion.div className="grid-2-1" style={{ marginBottom: 28 }} variants={item}>
        <div className="chart-container">
          <div className="section-header">
            <div>
              <div className="section-title">Case Activity</div>
              <div className="section-subtitle">Cases opened and reports generated over time</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={caseActivity}>
              <defs>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b61ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7b61ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#55556e" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#55556e" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cases" name="Cases" stroke="#00d4ff" fillOpacity={1} fill="url(#colorCases)" strokeWidth={2} />
              <Area type="monotone" dataKey="reports" name="Reports" stroke="#7b61ff" fillOpacity={1} fill="url(#colorReports)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="section-header">
            <div>
              <div className="section-title">Evidence Types</div>
              <div className="section-subtitle">Distribution by category</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={evidenceTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {evidenceTypes.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {evidenceTypes.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, display: 'inline-block' }} />
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Cases & Activity */}
      <motion.div className="grid-2-1" variants={item}>
        {/* Recent Cases Table */}
        <div>
          <div className="section-header">
            <div>
              <div className="section-title">Recent Cases</div>
              <div className="section-subtitle">Latest forensic investigations</div>
            </div>
            <Link to="/cases" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      No cases yet. Create your first case to get started.
                    </td>
                  </tr>
                ) : (
                  recentCases.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/cases/${c._id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                          {c.id}
                        </Link>
                      </td>
                      <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                      <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
                      <td>
                        <span className={`tag ${c.priority === 'critical' || c.priority === 'high' ? 'cyan' : ''}`}>
                          {c.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="section-header">
            <div>
              <div className="section-title">Activity Feed</div>
              <div className="section-subtitle">Recent system activity</div>
            </div>
          </div>
          <div className="glow-card">
            <div className="glow-card-inner" style={{ padding: '16px 20px' }}>
              {activities.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                  No activity yet. Actions will appear here.
                </div>
              ) : (
                activities.map((a, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-avatar" style={a.user === 'AI' || a.user === 'SYS' ? { background: 'linear-gradient(135deg, #00d4ff, #00e676)' } : {}}>
                      {a.user}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{a.user === 'AI' ? 'AI Engine' : a.user === 'SYS' ? 'System' : a.user}</strong> {a.text}
                      </div>
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating AI Assistant Button */}
      <Link
        to="/chat"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          zIndex: 99,
          cursor: 'pointer',
          border: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 212, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
        title="Query Case AI Copilot"
      >
        <Bot size={24} />
      </Link>
    </motion.div>
  )
}
