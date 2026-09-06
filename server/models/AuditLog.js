const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  actor: { type: String, required: true },
  details: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'danger'], default: 'info' }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
