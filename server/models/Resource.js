const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Classrooms', 
      'Laboratories', 
      'Seminar Halls', 
      'Auditoriums', 
      'Projectors', 
      'Laptops', 
      'Cameras', 
      'Technical Equipment', 
      'Sports Facilities', 
      'Other Resources'
    ]
  },
  department: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, default: 1 },
  description: { type: String, default: '' },
  equipment: [{ type: String }],
  status: { 
    type: String, 
    enum: ['Available', 'Reserved', 'Unavailable', 'Maintenance'], 
    default: 'Available' 
  },
  availability: { type: String, default: 'Mon - Fri, 08:00 - 18:00' },
  maintenancePeriods: [{
    title: String,
    date: String,
    startTime: String,
    endTime: String,
    description: String
  }],
  createdBy: { type: String, default: 'System Admin' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
