const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  venue: { type: String, required: true },
  venueId: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  description: { type: String, default: '' },
  organizer: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Seminar', 'Workshop', 'Meeting', 'Conference', 'College Event'], 
    default: 'Seminar' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
