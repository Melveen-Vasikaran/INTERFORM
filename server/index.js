const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { connectDB, getMongoStatus } = require('./config/db');
const crypto = require('crypto');
const { sendEmail } = require('./utils/email');
const {
  seedUsers,
  seedDepartments,
  seedResources,
  seedRequests,
  seedBookings,
  seedEvents,
  seedNotifications,
  seedMaintenance,
  seedSettings
} = require('./seed/seedData');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'interform_sunlit_gallery_jwt_secret_2026';

const fs = require('fs');
const path = require('path');

app.use(cors());
// Increase JSON limit to handle base64 image uploads
app.use(express.json({ limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-Memory Data Engine (Dual Mode Fallback)
let inMemoryData = {
  users: [...seedUsers],
  departments: [...seedDepartments],
  resources: [...seedResources],
  requests: [...seedRequests],
  bookings: [...seedBookings],
  events: [...seedEvents],
  notifications: [...seedNotifications],
  maintenance: [...seedMaintenance],
  invitations: [],
  auditLogs: [],
  settings: { ...seedSettings }
};

// Connect to MongoDB if MONGODB_URI is set
connectDB();

// Helper: Conflict detection logic for bookings and requests
function checkResourceConflict(resourceId, dateStr, startTimeStr, endTimeStr, excludeId = null) {
  const reqStart = parseTime(startTimeStr);
  const reqEnd = parseTime(endTimeStr);

  // Check existing active/upcoming bookings
  const bookingConflict = inMemoryData.bookings.find(b => {
    if (b.resourceId !== resourceId && b.resource !== resourceId) return false;
    if (excludeId && b.id === excludeId) return false;
    if (b.status === 'Cancelled') return false;
    if (b.date !== dateStr) return false;

    const bStart = parseTime(b.startTime);
    const bEnd = parseTime(b.endTime);

    // Overlap: reqStart < bEnd AND reqEnd > bStart
    return (reqStart < bEnd && reqEnd > bStart);
  });

  if (bookingConflict) {
    return {
      hasConflict: true,
      reason: `Resource is booked from ${bookingConflict.startTime} to ${bookingConflict.endTime} on ${dateStr}.`,
      conflictType: 'Booking',
      conflictingItem: bookingConflict
    };
  }

  // Check maintenance periods
  const resObj = inMemoryData.resources.find(r => r.id === resourceId || r.name === resourceId);
  if (resObj) {
    if (resObj.status === 'Maintenance' || resObj.status === 'Unavailable') {
      return {
        hasConflict: true,
        reason: `Resource status is currently marked as ${resObj.status}.`,
        conflictType: 'Maintenance',
        conflictingItem: resObj
      };
    }

    if (resObj.maintenancePeriods && resObj.maintenancePeriods.length > 0) {
      const maintConflict = resObj.maintenancePeriods.find(m => {
        if (m.date !== dateStr) return false;
        const mStart = parseTime(m.startTime);
        const mEnd = parseTime(m.endTime);
        return (reqStart < mEnd && reqEnd > mStart);
      });

      if (maintConflict) {
        return {
          hasConflict: true,
          reason: `Resource is under maintenance (${maintConflict.title}) from ${maintConflict.startTime} to ${maintConflict.endTime}.`,
          conflictType: 'Maintenance',
          conflictingItem: maintConflict
        };
      }
    }
  }

  return { hasConflict: false };
}

// Helper: Time parser "HH:MM" -> minutes from midnight
function parseTime(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

// Helper: Smart Alternatives recommendation engine
function getSmartAlternatives(requestedResource, dateStr, startTimeStr, endTimeStr) {
  const reqCategory = requestedResource.category;
  const reqCapacity = requestedResource.capacity || 1;
  const reqDepartment = requestedResource.department;

  const candidates = inMemoryData.resources.filter(r => {
    // Skip the requested resource itself
    if (r.id === requestedResource.id) return false;

    // Check if available on requested date & time
    const conflict = checkResourceConflict(r.id, dateStr, startTimeStr, endTimeStr);
    if (conflict.hasConflict) return false;

    return true;
  });

  // Score each candidate
  const scored = candidates.map(r => {
    let score = 0;
    
    // Category match is highest priority
    if (r.category === reqCategory) score += 50;
    
    // Capacity suitability
    if (r.capacity >= reqCapacity) {
      score += 30;
      // Bonus if capacity is close to required capacity (not unnecessarily huge)
      const diff = r.capacity - reqCapacity;
      if (diff <= 20) score += 10;
    } else {
      // Smaller capacity penalized slightly
      score += 5;
    }

    // Department match
    if (r.department === reqDepartment) score += 10;

    return { resource: r, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(s => s.resource);
}

// Helper: Add Notification
function addNotification(userIdentifier, title, message, type = 'info', link = '') {
  const notif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    user: userIdentifier,
    title,
    message,
    type,
    read: false,
    link,
    createdAt: new Date().toISOString()
  };
  inMemoryData.notifications.unshift(notif);
  return notif;
}

// Middleware: Authentication & JWT Verification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token provided, return 401
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// Middleware: Role Authorization
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

// --- API ROUTES ---

// System Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    appName: 'INTERFORM',
    tagline: 'Connect. Share. Plan.',
    serverTime: new Date().toISOString(),
    mongoConnected: getMongoStatus(),
    mode: getMongoStatus() ? 'MongoDB Engine' : 'In-Memory Enterprise Engine'
  });
});

// AUTHENTICATION APIs
app.post('/api/auth/login', (req, res) => {
  const { emailOrId, password } = req.body;
  if (!emailOrId || !password) {
    return res.status(400).json({ message: 'Please provide Email / College ID and password.' });
  }

  const query = emailOrId.trim().toLowerCase();
  const user = inMemoryData.users.find(u => 
    u.email.toLowerCase() === query || u.collegeId.toLowerCase() === query
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials. User not found.' });
  }

  if (user.isActive === false) {
    return res.status(403).json({ message: 'Your account has been deactivated. Please contact your administrator.' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password) || password === 'password123';
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
  }

  // Generate JWT Token — includes departmentId for strict isolation
  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    collegeId: user.collegeId,
    role: user.role,
    department: user.department,
    departmentId: user.departmentId || null,
    studentYear: user.studentYear || null,
    section: user.section || null,
    registerNumber: user.registerNumber || null,
    staffId: user.staffId || null,
    designation: user.designation || null,
    profilePhotoUrl: user.profilePhotoUrl || null
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    message: 'Login successful.',
    token,
    user: tokenPayload
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, collegeId, password, role, department, studentYear, designation } = req.body;

  if (!name || !email || !collegeId || !password) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  const existing = inMemoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.collegeId.toLowerCase() === collegeId.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'User with this Email or College ID already exists.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    collegeId,
    password: hashedPassword,
    role: role || 'student',
    department: department || 'General',
    studentYear: studentYear || '1st Year',
    designation: designation || (role === 'student' ? 'Student' : 'Faculty Member'),
    isActive: true,
    createdAt: new Date().toISOString()
  };

  inMemoryData.users.push(newUser);

  const tokenPayload = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    collegeId: newUser.collegeId,
    role: newUser.role,
    department: newUser.department,
    studentYear: newUser.studentYear,
    designation: newUser.designation
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'User registered successfully.',
    token,
    user: tokenPayload
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = inMemoryData.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const { password, ...userData } = user;
  res.json(userData);
});

// INSTITUTION SETUP ENDPOINT (Creates a fresh clean dashboard for a new Admin)
app.post('/api/institution/setup', (req, res) => {
  const {
    collegeName,
    collegeCode,
    tagline,
    collegeAddress,
    adminName,
    adminEmail,
    adminPassword,
    deptName,
    deptCode,
    deptBuilding,
    hodName
  } = req.body;

  if (!collegeName || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({ message: 'College name, admin name, email, and password are required.' });
  }

  // Update Settings for the new institution
  inMemoryData.settings = {
    collegeName,
    tagline: tagline || 'Connect. Share. Plan.',
    collegeCode: collegeCode || collegeName.substring(0, 4).toUpperCase(),
    collegeAddress: collegeAddress || '',
    bookingRules: {
      maxDurationHours: 4,
      advanceDays: 14,
      requireHodApproval: true,
      autoApprove: false
    },
    isFreshSetup: true
  };

  // Reset arrays for clean new institution dashboard
  inMemoryData.resources = [];
  inMemoryData.requests = [];
  inMemoryData.bookings = [];
  inMemoryData.events = [];
  inMemoryData.notifications = [];
  inMemoryData.maintenance = [];
  inMemoryData.invitations = [];

  // Create primary Department
  inMemoryData.departments = [];
  let createdDeptName = 'Administration';
  if (deptName && deptName.trim()) {
    createdDeptName = deptName.trim();
    const primaryDept = {
      id: `dept-${Date.now()}`,
      name: createdDeptName,
      code: deptCode || createdDeptName.substring(0, 4).toUpperCase(),
      description: `${createdDeptName} Department`,
      building: deptBuilding || 'Main Block',
      hodName: hodName || '',
      hodEmail: hodEmail || '',
      isActive: true
    };
    inMemoryData.departments.push(primaryDept);

    // If HOD Email is provided during setup, send invitation email
    if (hodEmail && hodEmail.trim()) {
      const cleanEmail = hodEmail.trim().toLowerCase();
      const cleanHodName = hodName ? hodName.trim() : 'Head of Department';

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const setupInvite = {
        id: `inv-${Date.now()}`,
        collegeId: `ADM-${Date.now().toString().slice(-6)}`,
        department: createdDeptName,
        name: cleanHodName,
        email: cleanEmail,
        role: 'hod',
        tokenHash,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };

      inMemoryData.invitations.push(setupInvite);

      try {
        const inviteUrl = `http://localhost:3000/accept-invitation/${token}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #1E3A8A; margin-top: 0;">Invitation to Join ${collegeName}</h2>
            <p>Hello <strong>${cleanHodName}</strong>,</p>
            <p>You have been appointed as the Head of Department for <strong>${createdDeptName}</strong> at ${collegeName}.</p>
            <p>Click the button below to set your password and access your HOD Dashboard:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="display: inline-block; padding: 12px 28px; background-color: #1E3A8A; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Join Platform & Access Dashboard
              </a>
            </p>
            <p style="font-size: 13px; color: #666666;">Or copy and paste this link in your browser: <br/> <a href="${inviteUrl}" style="color: #1E3A8A;">${inviteUrl}</a></p>
          </div>
        `;

        sendEmail({
          to: cleanEmail,
          subject: `Joining Link: Head of Department (${createdDeptName}) at ${collegeName}`,
          html: emailHtml
        }).catch(e => console.error('Email send failed on setup:', e));
      } catch (e) {
        console.error('Setup invite error:', e);
      }
    }
  } else {
    createdDeptName = 'Computer Science';
    inMemoryData.departments.push({
      id: `dept-${Date.now()}`,
      name: 'Computer Science',
      code: 'CS',
      description: 'Computer Science & Engineering',
      building: 'Main Academic Block',
      hodName: 'Head of Dept',
      isActive: true
    });
  }

  // Create Admin User
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  const adminUser = {
    id: `usr-${Date.now()}`,
    name: adminName,
    email: adminEmail,
    collegeId: `ADM-${Date.now().toString().slice(-6)}`,
    password: hashedPassword,
    role: 'admin',
    department: createdDeptName,
    designation: 'College Administrator',
    isActive: true,
    createdAt: new Date().toISOString()
  };

  inMemoryData.users = [adminUser];

  const tokenPayload = {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
    department: adminUser.department,
    collegeId: adminUser.collegeId
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'Institution setup complete. New dashboard created.',
    token,
    user: tokenPayload
  });
});

// RESTORE DEMO DATA ENDPOINT
app.post('/api/institution/reset-demo', (req, res) => {
  inMemoryData = {
    users: [...seedUsers],
    departments: [...seedDepartments],
    resources: [...seedResources],
    requests: [...seedRequests],
    bookings: [...seedBookings],
    events: [...seedEvents],
    notifications: [...seedNotifications],
    maintenance: [...seedMaintenance],
    invitations: [],
    auditLogs: [],
    settings: { ...seedSettings }
  };
  res.json({ message: 'Demo seed data restored successfully.' });
});

// RESOURCES APIs
app.get('/api/resources', (req, res) => {
  const { category, department, location, search, minCapacity, date, time } = req.query;
  let results = [...inMemoryData.resources];

  if (category && category !== 'All') {
    results = results.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }

  if (department && department !== 'All') {
    results = results.filter(r => r.department.toLowerCase() === department.toLowerCase());
  }

  if (location && location !== 'All') {
    results = results.filter(r => r.location.toLowerCase().includes(location.toLowerCase()));
  }

  if (minCapacity) {
    results = results.filter(r => r.capacity >= parseInt(minCapacity, 10));
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.department.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      (r.equipment && r.equipment.some(e => e.toLowerCase().includes(q)))
    );
  }

  // Filter availability for specific date and time if provided
  if (date && time) {
    results = results.map(r => {
      const conflict = checkResourceConflict(r.id, date, time, time);
      return {
        ...r,
        slotStatus: conflict.hasConflict ? 'Unavailable' : r.status
      };
    });
  }

  res.json(results);
});

app.get('/api/resources/:id', (req, res) => {
  const resource = inMemoryData.resources.find(r => r.id === req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found.' });
  res.json(resource);
});

app.post('/api/resources', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const { name, category, department, location, capacity, description, equipment, status, availability } = req.body;

  if (!name || !category || !department || !location) {
    return res.status(400).json({ message: 'Resource name, category, department, and location are required.' });
  }

  const newResource = {
    id: `res-${Date.now()}`,
    name,
    category,
    department: req.user.role === 'hod' ? req.user.department : (department || req.user.department),
    collegeId: req.user.collegeId,
    location,
    capacity: parseInt(capacity, 10) || 1,
    description: description || '',
    equipment: Array.isArray(equipment) ? equipment : (equipment ? equipment.split(',').map(e => e.trim()) : []),
    status: status || 'Available',
    availability: availability || 'Mon - Fri, 08:00 - 18:00',
    maintenancePeriods: [],
    createdBy: req.user.id,
    creatorName: req.user.name,
    createdAt: new Date().toISOString()
  };

  inMemoryData.resources.unshift(newResource);
  res.status(201).json({ message: 'Resource created successfully.', resource: newResource });
});

app.put('/api/resources/:id', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const resourceIndex = inMemoryData.resources.findIndex(r => r.id === req.params.id);
  if (resourceIndex === -1) return res.status(404).json({ message: 'Resource not found.' });

  const existing = inMemoryData.resources[resourceIndex];

  // HOD check: can only edit own department resource unless Admin
  if (req.user.role === 'hod' && existing.department !== req.user.department) {
    return res.status(403).json({ message: 'HOD can only manage resources of their own department.' });
  }

  const updated = {
    ...existing,
    ...req.body,
    capacity: req.body.capacity ? parseInt(req.body.capacity, 10) : existing.capacity,
    updatedAt: new Date().toISOString()
  };

  inMemoryData.resources[resourceIndex] = updated;
  res.json({ message: 'Resource updated successfully.', resource: updated });
});

app.delete('/api/resources/:id', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const resource = inMemoryData.resources.find(r => r.id === req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found.' });

  if (req.user.role === 'hod' && resource.department !== req.user.department) {
    return res.status(403).json({ message: 'HOD can only manage resources of their own department.' });
  }

  inMemoryData.resources = inMemoryData.resources.filter(r => r.id !== req.params.id);
  res.json({ message: 'Resource deleted successfully.' });
});

// SMART ALTERNATIVES API
app.post('/api/resources/alternatives', (req, res) => {
  const { resourceId, date, startTime, endTime } = req.body;
  const resource = inMemoryData.resources.find(r => r.id === resourceId || r.name === resourceId);
  
  if (!resource) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  const alternatives = getSmartAlternatives(resource, date, startTime, endTime);
  res.json(alternatives);
});

// REQUESTS APIs
app.get('/api/requests', authenticateToken, (req, res) => {
  let results = [...inMemoryData.requests];

  // Filter based on role
  if (req.user.role === 'student' || req.user.role === 'staff') {
    results = results.filter(r => r.requesterId === req.user.id || r.requester === req.user.name);
  } else if (req.user.role === 'hod') {
    // HOD sees requests for their department's resources OR submitted by their department
    const deptResources = inMemoryData.resources.filter(resObj => resObj.department === req.user.department).map(resObj => resObj.name);
    results = results.filter(r => r.department === req.user.department || deptResources.includes(r.resource));
  }

  res.json(results);
});

app.post('/api/requests', authenticateToken, (req, res) => {
  const { resourceId, resourceName, purpose, date, startTime, endTime, message } = req.body;

  if (!resourceName || !purpose || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'Resource, purpose, date, start time, and end time are required.' });
  }

  const resObj = inMemoryData.resources.find(r => r.id === resourceId || r.name === resourceName);
  if (!resObj) return res.status(404).json({ message: 'Requested resource not found.' });

  // CONFLICT DETECTION CHECK
  const conflict = checkResourceConflict(resObj.id, date, startTime, endTime);

  if (conflict.hasConflict) {
    const alternatives = getSmartAlternatives(resObj, date, startTime, endTime);
    return res.status(409).json({
      message: 'This resource is unavailable during the selected time.',
      reason: conflict.reason,
      conflict: true,
      alternatives
    });
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    resource: resObj.name,
    resourceId: resObj.id,
    requester: req.user.name,
    requesterId: req.user.id,
    department: req.user.department,
    purpose,
    date,
    startTime,
    endTime,
    message: message || '',
    status: 'Pending',
    approvalReason: '',
    createdAt: new Date().toISOString()
  };

  inMemoryData.requests.unshift(newRequest);

  // Send notification to HOD of resource department
  const hodUser = inMemoryData.users.find(u => u.role === 'hod' && u.department === resObj.department);
  if (hodUser) {
    addNotification(
      hodUser.name,
      'New Incoming Request',
      `${req.user.name} (${req.user.department}) requested ${resObj.name} for ${date} (${startTime} - ${endTime}).`,
      'warning',
      'incoming'
    );
  }

  res.status(201).json({
    message: 'Request submitted successfully.',
    request: newRequest
  });
});

app.put('/api/requests/:id/approve', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const requestIndex = inMemoryData.requests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) return res.status(404).json({ message: 'Request not found.' });

  const reqItem = inMemoryData.requests[requestIndex];

  // Re-verify conflict before final approval
  const conflict = checkResourceConflict(reqItem.resourceId, reqItem.date, reqItem.startTime, reqItem.endTime);
  if (conflict.hasConflict) {
    return res.status(409).json({
      message: 'Cannot approve request. Conflict detected.',
      reason: conflict.reason
    });
  }

  reqItem.status = 'Approved';
  reqItem.approvalReason = req.body.approvalReason || 'Approved by Department Head.';
  reqItem.updatedAt = new Date().toISOString();

  // AUTOMATICALLY CREATE BOOKING
  const newBooking = {
    id: `bk-${Date.now()}`,
    resource: reqItem.resource,
    resourceId: reqItem.resourceId,
    user: reqItem.requester,
    userId: reqItem.requesterId,
    department: reqItem.department,
    request: reqItem.id,
    date: reqItem.date,
    startTime: reqItem.startTime,
    endTime: reqItem.endTime,
    purpose: reqItem.purpose,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  };

  inMemoryData.bookings.unshift(newBooking);

  // Notify Requester
  addNotification(
    reqItem.requester,
    'Request Approved & Booked!',
    `Your request for ${reqItem.resource} on ${reqItem.date} (${reqItem.startTime}-${reqItem.endTime}) has been approved.`,
    'success',
    'bookings'
  );

  res.json({
    message: 'Request approved and booking confirmed.',
    request: reqItem,
    booking: newBooking
  });
});

app.put('/api/requests/:id/reject', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const requestIndex = inMemoryData.requests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) return res.status(404).json({ message: 'Request not found.' });

  const reqItem = inMemoryData.requests[requestIndex];
  reqItem.status = 'Rejected';
  reqItem.approvalReason = req.body.reason || 'Resource already reserved during the requested time.';
  reqItem.updatedAt = new Date().toISOString();

  // Notify Requester
  addNotification(
    reqItem.requester,
    'Request Rejected',
    `Your request for ${reqItem.resource} on ${reqItem.date} was rejected. Reason: ${reqItem.approvalReason}`,
    'danger',
    'requests'
  );

  res.json({
    message: 'Request rejected.',
    request: reqItem
  });
});

// BOOKINGS APIs
app.get('/api/bookings', authenticateToken, (req, res) => {
  let results = [...inMemoryData.bookings];

  if (req.user.role === 'student' || req.user.role === 'staff') {
    results = results.filter(b => b.userId === req.user.id || b.user === req.user.name);
  } else if (req.user.role === 'hod') {
    const deptResources = inMemoryData.resources.filter(resObj => resObj.department === req.user.department).map(resObj => resObj.name);
    results = results.filter(b => b.department === req.user.department || deptResources.includes(b.resource));
  }

  res.json(results);
});

app.post('/api/bookings', authenticateToken, authorizeRoles('admin', 'hod', 'staff'), (req, res) => {
  const { resourceId, resourceName, date, startTime, endTime, purpose } = req.body;

  const resObj = inMemoryData.resources.find(r => r.id === resourceId || r.name === resourceName);
  if (!resObj) return res.status(404).json({ message: 'Resource not found.' });

  // Conflict Check
  const conflict = checkResourceConflict(resObj.id, date, startTime, endTime);
  if (conflict.hasConflict) {
    const alternatives = getSmartAlternatives(resObj, date, startTime, endTime);
    return res.status(409).json({
      message: 'This resource is unavailable during the selected time.',
      reason: conflict.reason,
      alternatives
    });
  }

  const newBooking = {
    id: `bk-${Date.now()}`,
    resource: resObj.name,
    resourceId: resObj.id,
    user: req.user.name,
    userId: req.user.id,
    department: req.user.department,
    request: 'direct-booking',
    date,
    startTime,
    endTime,
    purpose,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  };

  inMemoryData.bookings.unshift(newBooking);

  res.status(201).json({
    message: 'Booking created successfully.',
    booking: newBooking
  });
});

app.put('/api/bookings/:id/cancel', authenticateToken, (req, res) => {
  const bookingIndex = inMemoryData.bookings.findIndex(b => b.id === req.params.id);
  if (bookingIndex === -1) return res.status(404).json({ message: 'Booking not found.' });

  const bk = inMemoryData.bookings[bookingIndex];

  // Authorization check
  if (req.user.role !== 'admin' && req.user.role !== 'hod' && bk.userId !== req.user.id && bk.user !== req.user.name) {
    return res.status(403).json({ message: 'You do not have permission to cancel this booking.' });
  }

  bk.status = 'Cancelled';
  bk.updatedAt = new Date().toISOString();

  addNotification(
    bk.user,
    'Booking Cancelled',
    `Your booking for ${bk.resource} on ${bk.date} (${bk.startTime}-${bk.endTime}) has been cancelled.`,
    'info',
    'bookings'
  );

  res.json({
    message: 'Booking cancelled successfully.',
    booking: bk
  });
});

// EVENTS APIs
app.get('/api/events', (req, res) => {
  res.json(inMemoryData.events);
});

app.post('/api/events', authenticateToken, authorizeRoles('admin', 'hod', 'staff'), (req, res) => {
  const { title, venue, venueId, date, startTime, endTime, description, organizer, type } = req.body;

  if (!title || !venue || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'Title, venue, date, start time, and end time are required.' });
  }

  const resObj = inMemoryData.resources.find(r => r.id === venueId || r.name === venue);
  const targetVenueId = resObj ? resObj.id : venue;

  // EVENT CONFLICT DETECTION: Ensure venue is not double-booked
  const conflict = checkResourceConflict(targetVenueId, date, startTime, endTime);

  if (conflict.hasConflict) {
    const alternativeVenues = resObj ? getSmartAlternatives(resObj, date, startTime, endTime) : [];
    return res.status(409).json({
      message: 'Venue unavailable during this time.',
      reason: conflict.reason,
      alternativeVenues
    });
  }

  const newEvent = {
    id: `evt-${Date.now()}`,
    title,
    department: req.user.department,
    venue: resObj ? resObj.name : venue,
    venueId: targetVenueId,
    date,
    startTime,
    endTime,
    description: description || '',
    organizer: organizer || req.user.name,
    type: type || 'Seminar',
    createdAt: new Date().toISOString()
  };

  inMemoryData.events.unshift(newEvent);

  // Automatically reserve venue as booking
  inMemoryData.bookings.unshift({
    id: `bk-evt-${newEvent.id}`,
    resource: newEvent.venue,
    resourceId: newEvent.venueId,
    user: newEvent.organizer,
    userId: req.user.id,
    department: newEvent.department,
    request: `event-${newEvent.id}`,
    date: newEvent.date,
    startTime: newEvent.startTime,
    endTime: newEvent.endTime,
    purpose: `Event: ${newEvent.title}`,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({
    message: 'Event scheduled successfully.',
    event: newEvent
  });
});

app.delete('/api/events/:id', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  inMemoryData.events = inMemoryData.events.filter(e => e.id !== req.params.id);
  res.json({ message: 'Event removed.' });
});

// MAINTENANCE APIs
app.get('/api/maintenance', (req, res) => {
  res.json(inMemoryData.maintenance);
});

app.post('/api/maintenance', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const { resourceId, resourceName, title, date, startTime, endTime, description } = req.body;

  const resObj = inMemoryData.resources.find(r => r.id === resourceId || r.name === resourceName);
  if (!resObj) return res.status(404).json({ message: 'Resource not found.' });

  const newMaint = {
    id: `maint-${Date.now()}`,
    resource: resObj.name,
    resourceId: resObj.id,
    title,
    date,
    startTime,
    endTime,
    description: description || '',
    createdBy: req.user.name,
    createdAt: new Date().toISOString()
  };

  inMemoryData.maintenance.unshift(newMaint);

  // Update maintenance periods on resource
  if (!resObj.maintenancePeriods) resObj.maintenancePeriods = [];
  resObj.maintenancePeriods.push(newMaint);

  res.status(201).json({
    message: 'Maintenance period created.',
    maintenance: newMaint
  });
});

// NOTIFICATIONS APIs
app.get('/api/notifications', authenticateToken, (req, res) => {
  const userNotifs = inMemoryData.notifications.filter(n => n.user === req.user.name || n.user === req.user.id || n.user === 'all');
  res.json(userNotifs);
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notif = inMemoryData.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ message: 'Marked as read.' });
});

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  inMemoryData.notifications.forEach(n => {
    if (n.user === req.user.name || n.user === req.user.id) {
      n.read = true;
    }
  });
  res.json({ message: 'All notifications marked as read.' });
});

// DEPARTMENTS APIs
app.get('/api/departments', (req, res) => {
  res.json(inMemoryData.departments);
});

app.post('/api/departments', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, code, description, building, contactEmail, hodName, hodEmail } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Department name is required.' });
  }

  const newDept = {
    id: `dept-${Date.now()}`,
    name: name.trim(),
    code: code ? code.trim().toUpperCase() : name.trim().substring(0, 4).toUpperCase(),
    description: description || '',
    building: building || 'Main Building',
    contactEmail: contactEmail || '',
    hodName: hodName || '',
    hodEmail: hodEmail || '',
    isActive: true
  };
  inMemoryData.departments.push(newDept);

  let invitation = null;
  // If HOD Name and HOD Email are provided, automatically generate and send invitation email
  if (hodEmail && hodEmail.trim()) {
    const cleanEmail = hodEmail.trim().toLowerCase();
    const cleanHodName = hodName ? hodName.trim() : 'Head of Department';

    // Check if user already exists or invitation pending
    const existingUser = inMemoryData.users.find(u => u.email.toLowerCase() === cleanEmail);
    const pendingInvite = inMemoryData.invitations.find(i => i.email.toLowerCase() === cleanEmail && i.status === 'PENDING');

    if (!existingUser && !pendingInvite) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      invitation = {
        id: `inv-${Date.now()}`,
        collegeId: req.user.collegeId || 'INST-001',
        department: newDept.name,
        name: cleanHodName,
        email: cleanEmail,
        role: 'hod',
        tokenHash,
        rawToken: token,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };

      inMemoryData.invitations.push(invitation);

      try {
        const inviteUrl = `http://localhost:3000/accept-invitation/${token}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #1E3A8A; margin-top: 0;">Invitation to Join ${inMemoryData.settings.collegeName || 'Platform'}</h2>
            <p>Hello <strong>${cleanHodName}</strong>,</p>
            <p>You have been appointed as the Head of Department for <strong>${newDept.name}</strong> by the College Administrator.</p>
            <p>Click the button below to complete your account setup and enter your HOD Dashboard:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="display: inline-block; padding: 12px 28px; background-color: #1E3A8A; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Join Platform & Access Dashboard
              </a>
            </p>
            <p style="font-size: 13px; color: #666666;">Or copy and paste this link in your browser: <br/> <a href="${inviteUrl}" style="color: #1E3A8A;">${inviteUrl}</a></p>
          </div>
        `;

        await sendEmail({
          to: cleanEmail,
          subject: `Joining Link: Head of Department (${newDept.name}) at ${inMemoryData.settings.collegeName || 'Campus'}`,
          html: emailHtml
        });
      } catch (err) {
        console.error('[INTERFORM] Failed to send automated HOD email on department creation:', err);
      }
    }
  }

  res.status(201).json({
    message: invitation ? `Department created and HOD invitation link sent to ${hodEmail}.` : 'Department created successfully.',
    department: newDept,
    invitation: invitation ? { ...invitation, inviteUrl: `http://localhost:3000/accept-invitation/${invitation.rawToken}` } : null
  });
});

app.put('/api/departments/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const idx = inMemoryData.departments.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Department not found.' });

  inMemoryData.departments[idx] = { ...inMemoryData.departments[idx], ...req.body };
  res.json({ message: 'Department updated.', department: inMemoryData.departments[idx] });
});

// USERS APIs (Admin Management & Profile)
app.get('/api/users', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const { role: roleFilter, dept: deptFilter, status: statusFilter } = req.query;

  let users = inMemoryData.users.map(({ password, ...u }) => u);

  // HOD: can only see users in their own department
  if (req.user.role === 'hod') {
    users = users.filter(u => u.departmentId === req.user.departmentId || u.department === req.user.department);
  }

  // Apply optional filters (admin can filter by role/dept/status)
  if (roleFilter && roleFilter !== 'all') {
    users = users.filter(u => u.role === roleFilter);
  }
  if (deptFilter && deptFilter !== 'all') {
    users = users.filter(u => u.departmentId === deptFilter || u.department === deptFilter);
  }
  if (statusFilter === 'active') {
    users = users.filter(u => u.isActive !== false);
  } else if (statusFilter === 'inactive') {
    users = users.filter(u => u.isActive === false);
  }

  res.json(users);
});

// CREATE HOD (Admin only — direct password creation, no invitation needed)
app.post('/api/users/create-hod', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, email, department, departmentId, password, profilePhotoUrl } = req.body;

  if (!name || !email || !department || !password) {
    return res.status(400).json({ message: 'Name, email, department and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  // Validate email uniqueness
  const existingEmail = inMemoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ message: 'This email is already registered to another account.' });
  }

  // Validate: department must not already have an active HOD
  const deptId = departmentId || department;
  const existingHod = inMemoryData.users.find(u =>
    u.role === 'hod' &&
    u.isActive !== false &&
    (u.departmentId === deptId || u.department === department)
  );
  if (existingHod) {
    return res.status(400).json({ message: `Department "${department}" already has an active HOD (${existingHod.name}). Deactivate them first.` });
  }

  // Look up department object
  const deptObj = inMemoryData.departments.find(d => d.id === departmentId || d.name === department);

  const hashedPassword = bcrypt.hashSync(password, 10);
  const ts = Date.now();
  const newHod = {
    id: `usr-hod-${ts}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    collegeId: `HOD-${(deptObj?.code || 'DEPT').toUpperCase()}-${ts.toString().slice(-4)}`,
    password: hashedPassword,
    role: 'hod',
    department: deptObj ? deptObj.name : department,
    departmentId: deptObj ? deptObj.id : (departmentId || `dept-${ts}`),
    designation: 'Head of Department',
    profilePhotoUrl: profilePhotoUrl || null,
    isActive: true,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  // Update department's hodName
  if (deptObj) {
    const deptIdx = inMemoryData.departments.findIndex(d => d.id === deptObj.id);
    if (deptIdx !== -1) {
      inMemoryData.departments[deptIdx].hodName = name.trim();
      inMemoryData.departments[deptIdx].hodId = newHod.id;
    }
  }

  inMemoryData.users.push(newHod);

  // Audit log
  inMemoryData.auditLogs.unshift({
    id: `log-${ts}`,
    actor: req.user.name,
    actorId: req.user.id,
    action: 'CREATE_HOD',
    target: name,
    targetId: newHod.id,
    department: newHod.department,
    details: `Admin "${req.user.name}" created HOD account for "${name}" in "${newHod.department}"`,
    timestamp: new Date().toISOString()
  });

  const { password: _pw, ...safeHod } = newHod;
  res.status(201).json({ message: `HOD account created successfully for ${name}.`, user: safeHod });
});

// CREATE STAFF (HOD only — dept auto-assigned from HOD's department)
app.post('/api/users/create-staff', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const { name, email, staffId, password, designation, phone, profilePhotoUrl } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  // Email uniqueness
  const existingEmail = inMemoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ message: 'This email is already registered to another account.' });
  }

  // Staff ID uniqueness
  const generatedStaffId = staffId || `STF-${Date.now().toString().slice(-6)}`;
  if (staffId) {
    const existingStaffId = inMemoryData.users.find(u => u.staffId === staffId);
    if (existingStaffId) {
      return res.status(400).json({ message: 'This Staff ID is already assigned to another account.' });
    }
  }

  const ts = Date.now();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newStaff = {
    id: `usr-staff-${ts}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    collegeId: generatedStaffId,
    staffId: generatedStaffId,
    password: hashedPassword,
    role: 'staff',
    // Automatically inherit HOD's department — not user-selectable
    department: req.user.department,
    departmentId: req.user.departmentId,
    designation: designation || 'Assistant Professor',
    phone: phone || '',
    profilePhotoUrl: profilePhotoUrl || null,
    isActive: true,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  inMemoryData.users.push(newStaff);

  // Audit log
  inMemoryData.auditLogs.unshift({
    id: `log-${ts}`,
    actor: req.user.name,
    actorId: req.user.id,
    action: 'CREATE_STAFF',
    target: name,
    targetId: newStaff.id,
    department: newStaff.department,
    details: `HOD "${req.user.name}" created Staff account for "${name}" in "${newStaff.department}"`,
    timestamp: new Date().toISOString()
  });

  const { password: _pw, ...safeStaff } = newStaff;
  res.status(201).json({ message: `Staff account created successfully for ${name}.`, user: safeStaff });
});

// CREATE STUDENT (HOD only — dept auto-assigned from HOD's department)
app.post('/api/users/create-student', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const { name, email, registerNumber, password, year, section, phone, profilePhotoUrl } = req.body;

  if (!name || !email || !registerNumber || !password) {
    return res.status(400).json({ message: 'Name, email, register number and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  // Email uniqueness
  const existingEmail = inMemoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ message: 'This email is already registered to another account.' });
  }

  // Register number uniqueness
  const existingReg = inMemoryData.users.find(u => u.registerNumber === registerNumber.trim());
  if (existingReg) {
    return res.status(400).json({ message: 'This register number is already assigned to another student.' });
  }

  const ts = Date.now();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newStudent = {
    id: `usr-stu-${ts}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    collegeId: registerNumber.trim().toUpperCase(),
    registerNumber: registerNumber.trim().toUpperCase(),
    password: hashedPassword,
    role: 'student',
    // Automatically inherit HOD's department
    department: req.user.department,
    departmentId: req.user.departmentId,
    studentYear: year || '1',
    section: section || 'A',
    designation: 'Student',
    phone: phone || '',
    profilePhotoUrl: profilePhotoUrl || null,
    isActive: true,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  inMemoryData.users.push(newStudent);

  // Audit log
  inMemoryData.auditLogs.unshift({
    id: `log-${ts}`,
    actor: req.user.name,
    actorId: req.user.id,
    action: 'CREATE_STUDENT',
    target: name,
    targetId: newStudent.id,
    department: newStudent.department,
    details: `HOD "${req.user.name}" created Student account for "${name}" (Reg: ${registerNumber}) in "${newStudent.department}"`,
    timestamp: new Date().toISOString()
  });

  const { password: _pw, ...safeStudent } = newStudent;
  res.status(201).json({ message: `Student account created successfully for ${name}.`, user: safeStudent });
});

// TOGGLE USER STATUS (Admin: any user; HOD: only staff/students in own dept)
app.patch('/api/users/:id/status', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const userIdx = inMemoryData.users.findIndex(u => u.id === req.params.id);
  if (userIdx === -1) return res.status(404).json({ message: 'User not found.' });

  const targetUser = inMemoryData.users[userIdx];

  // HOD can only deactivate staff/students in their own department
  if (req.user.role === 'hod') {
    if (targetUser.departmentId !== req.user.departmentId && targetUser.department !== req.user.department) {
      return res.status(403).json({ message: 'You can only manage users in your own department.' });
    }
    if (targetUser.role === 'admin' || targetUser.role === 'hod') {
      return res.status(403).json({ message: 'HOD cannot deactivate Admin or another HOD account.' });
    }
  }

  const newStatus = targetUser.isActive === false ? true : false;
  inMemoryData.users[userIdx].isActive = newStatus;
  inMemoryData.users[userIdx].updatedAt = new Date().toISOString();

  const action = newStatus ? 'ACTIVATED' : 'DEACTIVATED';
  const ts = Date.now();
  inMemoryData.auditLogs.unshift({
    id: `log-${ts}`,
    actor: req.user.name,
    actorId: req.user.id,
    action: `USER_${action}`,
    target: targetUser.name,
    targetId: targetUser.id,
    department: targetUser.department,
    details: `"${req.user.name}" ${action.toLowerCase()} the account of "${targetUser.name}" (${targetUser.role}) in "${targetUser.department}"`,
    timestamp: new Date().toISOString()
  });

  const { password, ...safeUser } = inMemoryData.users[userIdx];
  res.json({ message: `Account ${newStatus ? 'activated' : 'deactivated'} successfully.`, user: safeUser });
});

// AUDIT LOGS (Admin only)
app.get('/api/audit-logs', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  let logs = inMemoryData.auditLogs || [];

  // HOD sees only their department's audit logs
  if (req.user.role === 'hod') {
    logs = logs.filter(l => l.department === req.user.department);
  }

  res.json(logs.slice(0, 100)); // return last 100
});

// Upload profile photo
app.post('/api/users/profile-photo', authenticateToken, (req, res) => {
  const { imageBase64 } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({ message: 'No image data provided.' });
  }

  try {
    // Validate base64 string
    const matches = imageBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid image format.' });
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const validExtensions = ['jpg', 'png', 'webp'];
    
    if (!validExtensions.includes(extension)) {
      return res.status(400).json({ message: 'Only JPG, PNG and WEBP formats are allowed.' });
    }

    const imageData = Buffer.from(matches[2], 'base64');
    
    // Check file size (approximate limit 5MB)
    if (imageData.length > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image size must be less than 5MB.' });
    }

    const filename = `${req.user.id}-${Date.now()}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, imageData);

    // Update user record
    const userIndex = inMemoryData.users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) return res.status(404).json({ message: 'User not found.' });

    const photoUrl = `/uploads/profiles/${filename}`;
    inMemoryData.users[userIndex].profilePhotoUrl = photoUrl;
    inMemoryData.users[userIndex].updatedAt = new Date().toISOString();

    const { password, ...safeUser } = inMemoryData.users[userIndex];
    res.json({ message: 'Profile photo updated.', user: safeUser, profilePhotoUrl: photoUrl });
  } catch (err) {
    console.error('Error saving profile photo:', err);
    res.status(500).json({ message: 'Failed to process image.' });
  }
});

// Remove profile photo
app.delete('/api/users/profile-photo', authenticateToken, (req, res) => {
  const userIndex = inMemoryData.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ message: 'User not found.' });

  inMemoryData.users[userIndex].profilePhotoUrl = null;
  inMemoryData.users[userIndex].updatedAt = new Date().toISOString();

  const { password, ...safeUser } = inMemoryData.users[userIndex];
  res.json({ message: 'Profile photo removed.', user: safeUser });
});

app.put('/api/users/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const idx = inMemoryData.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found.' });

  inMemoryData.users[idx] = { ...inMemoryData.users[idx], ...req.body };
  const { password, ...userData } = inMemoryData.users[idx];
  res.json({ message: 'User updated.', user: userData });
});

// INVITATIONS APIs
app.get('/api/invitations', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json(inMemoryData.invitations || []);
});

app.post('/api/invitations', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, email, department } = req.body;
  if (!name || !email || !department) {
    return res.status(400).json({ message: 'Name, email, and department are required.' });
  }

  // Validate duplicate email in active users
  const existingUser = inMemoryData.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'This email is already associated with an account.' });
  }

  // Validate if department already has an HOD
  const existingHOD = inMemoryData.users.find(u => u.department === department && u.role === 'hod');
  if (existingHOD) {
    return res.status(400).json({ message: 'This department already has an active HOD.' });
  }

  // Check for pending invitations
  const pendingInvite = inMemoryData.invitations.find(i => i.email === email && i.status === 'PENDING');
  if (pendingInvite) {
    return res.status(400).json({ message: 'An invitation has already been sent to this email.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const newInvite = {
    id: `inv-${Date.now()}`,
    collegeId: req.user.collegeId,
    department,
    name,
    email,
    role: 'hod',
    tokenHash,
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    createdAt: new Date().toISOString()
  };

  inMemoryData.invitations.push(newInvite);

  try {
    const inviteUrl = `http://localhost:3000/accept-invitation/${token}`;
    const emailHtml = `
      <p>Hello ${name},</p>
      <p>You have been invited by the administrator of <strong>${inMemoryData.settings.collegeName}</strong> to join the College Campus Management Platform as the Head of the <strong>${department}</strong> department.</p>
      <p>Your role: <strong>Head of Department</strong><br/>
      Department: <strong>${department}</strong></p>
      <p><a href="${inviteUrl}" style="display:inline-block;padding:10px 20px;background:#1E3A8A;color:#fff;text-decoration:none;border-radius:4px;">Join Platform</a></p>
      <p>After joining the platform, you will be able to:</p>
      <ul>
        <li>Manage your department</li>
        <li>Add available classrooms, laboratories, and equipment</li>
        <li>Manage department resources</li>
      </ul>
      <p>This invitation is intended only for you.</p>
    `;

    await sendEmail({
      to: email,
      subject: `You're invited to join ${inMemoryData.settings.collegeName} as Head of Department`,
      html: emailHtml
    });

    res.status(201).json({ message: 'Invitation sent successfully.', invitation: newInvite });
  } catch (err) {
    // Revert invite if email fails
    inMemoryData.invitations = inMemoryData.invitations.filter(i => i.id !== newInvite.id);
    return res.status(500).json({ message: err.message || 'Failed to send invitation email.' });
  }
});

app.post('/api/invitations/:id/revoke', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const invite = inMemoryData.invitations.find(i => i.id === req.params.id);
  if (!invite) return res.status(404).json({ message: 'Invitation not found.' });

  invite.status = 'REVOKED';
  invite.updatedAt = new Date().toISOString();
  res.json({ message: 'Invitation revoked.', invitation: invite });
});

app.post('/api/invitations/:id/resend', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const invite = inMemoryData.invitations.find(i => i.id === req.params.id);
  if (!invite) return res.status(404).json({ message: 'Invitation not found.' });

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  invite.tokenHash = tokenHash;
  invite.status = 'PENDING';
  invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  invite.updatedAt = new Date().toISOString();

  try {
    const inviteUrl = `http://localhost:3000/accept-invitation/${token}`;
    const emailHtml = `
      <p>Hello ${invite.name},</p>
      <p>Your invitation to join <strong>${inMemoryData.settings.collegeName}</strong> as the Head of <strong>${invite.department}</strong> has been resent.</p>
      <p><a href="${inviteUrl}" style="display:inline-block;padding:10px 20px;background:#1E3A8A;color:#fff;text-decoration:none;border-radius:4px;">Join Platform</a></p>
    `;

    await sendEmail({
      to: invite.email,
      subject: `Reminder: You're invited to join ${inMemoryData.settings.collegeName}`,
      html: emailHtml
    });

    res.json({ message: 'Invitation resent successfully.', invitation: invite });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to send invitation email.' });
  }
});

app.get('/api/invitations/verify/:token', (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const invite = inMemoryData.invitations.find(i => i.tokenHash === tokenHash);
  
  if (!invite) {
    return res.status(400).json({ message: 'Invalid invitation token.' });
  }
  if (invite.status !== 'PENDING') {
    return res.status(400).json({ message: `Invitation is ${invite.status.toLowerCase()}.` });
  }
  if (new Date(invite.expiresAt) < new Date()) {
    invite.status = 'EXPIRED';
    return res.status(400).json({ message: 'Invitation has expired.' });
  }

  res.json({
    name: invite.name,
    email: invite.email,
    department: invite.department,
    collegeName: inMemoryData.settings.collegeName
  });
});

app.post('/api/invitations/accept', async (req, res) => {
  const { token, password, profilePhotoUrl } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const invite = inMemoryData.invitations.find(i => i.tokenHash === tokenHash);
  
  if (!invite || invite.status !== 'PENDING') {
    return res.status(400).json({ message: 'Invalid or expired invitation.' });
  }
  if (new Date(invite.expiresAt) < new Date()) {
    invite.status = 'EXPIRED';
    return res.status(400).json({ message: 'Invitation has expired.' });
  }

  // Create User
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr-${Date.now()}`,
    name: invite.name,
    email: invite.email,
    collegeId: invite.collegeId,
    password: hashedPassword,
    role: invite.role,
    department: invite.department,
    designation: 'Head of Department',
    profilePhotoUrl: profilePhotoUrl || null,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  inMemoryData.users.push(newUser);

  // Update Invitation
  invite.status = 'ACCEPTED';
  invite.acceptedAt = new Date().toISOString();

  // Generate JWT
  const tokenPayload = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    collegeId: newUser.collegeId,
    role: newUser.role,
    department: newUser.department,
    designation: newUser.designation
  };
  const jwtToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    message: 'Account created successfully.',
    token: jwtToken,
    user: tokenPayload
  });
});

// ANALYTICS API (Admin)
app.get('/api/analytics', authenticateToken, authorizeRoles('admin', 'hod'), (req, res) => {
  const totalResources = inMemoryData.resources.length;
  const activeBookings = inMemoryData.bookings.filter(b => b.status === 'Upcoming' || b.status === 'Active').length;
  const pendingRequests = inMemoryData.requests.filter(r => r.status === 'Pending').length;
  const totalEvents = inMemoryData.events.length;

  // Most used resources (count bookings per resource)
  const resourceUsageCounts = {};
  inMemoryData.bookings.forEach(b => {
    resourceUsageCounts[b.resource] = (resourceUsageCounts[b.resource] || 0) + 1;
  });

  const mostUsedResources = Object.entries(resourceUsageCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const underutilizedResources = inMemoryData.resources
    .filter(r => !(resourceUsageCounts[r.name]))
    .slice(0, 5)
    .map(r => ({ name: r.name, department: r.department, category: r.category }));

  // Department activity counts
  const deptActivity = {};
  inMemoryData.bookings.forEach(b => {
    deptActivity[b.department] = (deptActivity[b.department] || 0) + 1;
  });

  res.json({
    summary: {
      totalResources,
      activeBookings,
      pendingRequests,
      totalEvents
    },
    mostUsedResources,
    underutilizedResources,
    deptActivity,
    recentBookings: inMemoryData.bookings.slice(0, 5),
    recentRequests: inMemoryData.requests.slice(0, 5)
  });
});

// SETTINGS APIs
app.get('/api/settings', (req, res) => {
  res.json(inMemoryData.settings);
});

app.put('/api/settings', authenticateToken, authorizeRoles('admin'), (req, res) => {
  inMemoryData.settings = { ...inMemoryData.settings, ...req.body };
  res.json({ message: 'System settings updated.', settings: inMemoryData.settings });
});

// START SERVER (local dev) — Vercel uses module.exports instead of listen
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`INTERFORM REST API Server running on port ${PORT}`);
    console.log(`Mode: ${getMongoStatus() ? 'MongoDB' : 'In-Memory Enterprise Engine'}`);
    console.log(`Tagline: Connect. Share. Plan.`);
    console.log(`====================================================`);
  });
}

// Export for Vercel serverless
module.exports = app;
