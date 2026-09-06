const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  collegeId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'hod', 'student', 'staff'], 
    default: 'student' 
  },
  department: { type: String, default: 'General' },
  studentYear: { type: String, default: '1st Year' },
  designation: { type: String, default: 'Student' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
