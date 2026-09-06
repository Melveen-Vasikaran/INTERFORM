const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  resource: { type: String, required: true },
  resourceId: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  description: { type: String, default: '' },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
