const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  resource: { type: String, required: true },
  resourceId: { type: String, required: true },
  user: { type: String, required: true },
  userId: { type: String, required: true },
  department: { type: String, required: true },
  request: { type: String, default: '' },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  purpose: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Active', 'Completed', 'Cancelled'], 
    default: 'Upcoming' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
