const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'danger'], 
    default: 'info' 
  },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
