const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  dept: { type: String, required: true },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Blocked'], default: 'Pending' },
  dependsOn: { type: String }
});

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  leadDepartmentId: { type: String, required: true },
  leadDepartmentName: { type: String, required: true },
  participatingDepartments: [{ type: String }],
  budgetAllocated: { type: Number, default: 0 },
  startDate: { type: String, required: true },
  targetDate: { type: String, required: true },
  status: { type: String, enum: ['Planning', 'In Progress', 'On Hold', 'Completed'], default: 'In Progress' },
  completionPercentage: { type: Number, default: 0 },
  milestones: [milestoneSchema],
  sharedResourcesUsed: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
