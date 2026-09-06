const mongoose = require('mongoose');

const tradeRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  offeringDepartmentId: { type: String, required: true },
  offeringDepartmentName: { type: String, required: true },
  offeringItem: { type: String, required: true },
  requestingDepartmentId: { type: String },
  requestingDepartmentName: { type: String },
  requestedItem: { type: String },
  creditValue: { type: Number, default: 0 },
  status: { type: String, enum: ['Open', 'Accepted', 'Completed', 'Cancelled'], default: 'Open' },
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TradeRequest', tradeRequestSchema);
