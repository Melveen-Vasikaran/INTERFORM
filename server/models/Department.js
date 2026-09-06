const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  description: { type: String, default: '' },
  building: { type: String, default: 'Main Building' },
  contactEmail: { type: String, default: '' },
  hodName: { type: String, default: 'Head of Department' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
