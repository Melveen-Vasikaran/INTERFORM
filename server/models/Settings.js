const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  collegeName: { type: String, default: 'AURA Institute of Technology' },
  tagline: { type: String, default: 'Connect. Share. Plan.' },
  logoUrl: { type: String, default: '' },
  departments: [{ type: String }],
  categories: [{ type: String }],
  buildings: [{ type: String }],
  locations: [{ type: String }],
  bookingRules: {
    maxDurationHours: { type: Number, default: 4 },
    advanceDays: { type: Number, default: 14 },
    autoApproveSameDept: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
