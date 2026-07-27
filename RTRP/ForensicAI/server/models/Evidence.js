import mongoose from 'mongoose'

const evidenceSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, default: 'application/octet-stream' },
  size: { type: Number, required: true },
  sha256Hash: { type: String, required: true },
  filePath: { type: String, required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  status: {
    type: String,
    enum: ['uploading', 'hashing', 'verified', 'parsing', 'parsed', 'error'],
    default: 'hashing',
  },
  metadata: {
    fileType: { type: String },
    encoding: { type: String },
    lineCount: { type: Number },
    dateRange: {
      start: { type: Date },
      end: { type: Date },
    },
  },
  parsedData: {
    events: [{
      timestamp: { type: String },
      eventType: { type: String },
      source: { type: String },
      detail: { type: String },
      severity: { type: String, enum: ['info', 'warning', 'danger', 'critical'] },
      raw: { type: String },
      threatIntel: {
        score: { type: Number, default: 0 },
        isMalicious: { type: Boolean, default: false },
        details: { type: String, default: '' }
      },
      mitreAttack: {
        techniqueId: { type: String, default: '' },
        techniqueName: { type: String, default: '' },
        tactic: { type: String, default: '' }
      }
    }],
    summary: { type: String },
    anomalies: [{ type: String }],
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  hashVerifications: [{
    verifiedAt: { type: Date, default: Date.now },
    verifiedBy: { type: String },
    result: { type: String, enum: ['match', 'mismatch'] },
  }],
}, { timestamps: true })

evidenceSchema.index({ caseId: 1 })
evidenceSchema.index({ sha256Hash: 1 })
evidenceSchema.index({ status: 1 })

export default mongoose.model('Evidence', evidenceSchema)
