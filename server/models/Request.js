const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  resource: { type: String, required: true },
  resourceId: { type: String, required: true },
  requester: { type: String, required: true },
  requesterId: { type: String, required: true },
  department: { type: String, required: true },
  purpose: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  message: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'], 
    default: 'Pending' 
  },
  approvalReason: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);
