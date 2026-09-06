const bcrypt = require('bcryptjs');

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

const seedUsers = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Arthur Pendelton',
    email: 'admin@college.edu',
    collegeId: 'ADM-1001',
    password: defaultPasswordHash,
    role: 'admin',
    department: 'Campus Administration',
    designation: 'Chief Administrator',
    isActive: true
  },
  {
    id: 'usr-hod-cs',
    name: 'Prof. Eleanor Vance',
    email: 'hod.cs@college.edu',
    collegeId: 'HOD-CS-01',
    password: defaultPasswordHash,
    role: 'hod',
    department: 'Computer Science',
    designation: 'Head of Department',
    isActive: true
  },
  {
    id: 'usr-hod-mech',
    name: 'Dr. Robert Sterling',
    email: 'hod.mech@college.edu',
    collegeId: 'HOD-MECH-01',
    password: defaultPasswordHash,
    role: 'hod',
    department: 'Mechanical Engineering',
    designation: 'Head of Department',
    isActive: true
  },
  {
    id: 'usr-staff-1',
    name: 'Marcus Brody',
    email: 'marcus.brody@college.edu',
    collegeId: 'STF-5012',
    password: defaultPasswordHash,
    role: 'staff',
    department: 'Computer Science',
    designation: 'Lab Instructor',
    isActive: true
  },
  {
    id: 'usr-student-1',
    name: 'Sophia Chen',
    email: 'sophia.chen@student.college.edu',
    collegeId: 'STU-2024-089',
    password: defaultPasswordHash,
    role: 'student',
    department: 'Computer Science',
    studentYear: '3rd Year',
    designation: 'Student Lead',
    isActive: true
  },
  {
    id: 'usr-student-2',
    name: 'Liam Gallagher',
    email: 'liam.g@student.college.edu',
    collegeId: 'STU-2024-114',
    password: defaultPasswordHash,
    role: 'student',
    department: 'Mechanical Engineering',
    studentYear: '4th Year',
    designation: 'Project Lead',
    isActive: true
  }
];

const seedDepartments = [
  {
    id: 'dept-cs',
    name: 'Computer Science',
    code: 'CS',
    description: 'School of Computing, Artificial Intelligence & Software Systems',
    building: 'Block A (Alan Turing Hall)',
    contactEmail: 'cs-dept@college.edu',
    hodName: 'Prof. Eleanor Vance',
    isActive: true
  },
  {
    id: 'dept-mech',
    name: 'Mechanical Engineering',
    code: 'MECH',
    description: 'Department of Mechanical, Robotics & Aerospace Engineering',
    building: 'Block B (Nikola Tesla Complex)',
    contactEmail: 'mech-dept@college.edu',
    hodName: 'Dr. Robert Sterling',
    isActive: true
  },
  {
    id: 'dept-ece',
    name: 'Electronics & Communication',
    code: 'ECE',
    description: 'Department of Microelectronics, IoT & Signals',
    building: 'Block C (Shannon Wing)',
    contactEmail: 'ece-dept@college.edu',
    hodName: 'Dr. Maya Lin',
    isActive: true
  },
  {
    id: 'dept-biotech',
    name: 'Biotechnology',
    code: 'BIOTECH',
    description: 'School of Bio-Sciences & Biomedical Engineering',
    building: 'Block D (Franklin Bio Labs)',
    contactEmail: 'biotech@college.edu',
    hodName: 'Dr. Samuel Hayes',
    isActive: true
  },
  {
    id: 'dept-bus',
    name: 'Business & Management',
    code: 'MGMT',
    description: 'School of Global Business & Innovation Management',
    building: 'Block E (Executive Center)',
    contactEmail: 'mgmt@college.edu',
    hodName: 'Dr. Claire Underwood',
    isActive: true
  }
];

const seedResources = [
  {
    id: 'res-cs-lab1',
    name: 'Computer Laboratory 01',
    category: 'Laboratories',
    department: 'Computer Science',
    location: 'Block A - Room 201',
    capacity: 60,
    description: 'High-performance AI workstation lab with RTX 4090 GPUs, dual 4K monitors, and gigabit ethernet.',
    equipment: ['60 Desktop PCs', 'High-Speed Wi-Fi', 'Interactive Projector', 'Central AC', 'Surround Sound'],
    status: 'Available',
    availability: 'Mon - Sat, 08:00 - 18:00',
    maintenancePeriods: [
      {
        title: 'Network Switch Upgrade',
        date: '2026-09-12',
        startTime: '14:00',
        endTime: '17:00',
        description: 'Upgrading core distribution switches.'
      }
    ],
    createdBy: 'Prof. Eleanor Vance'
  },
  {
    id: 'res-cs-lab2',
    name: 'Computer Laboratory 02',
    category: 'Laboratories',
    department: 'Computer Science',
    location: 'Block A - Room 204',
    capacity: 50,
    description: 'Software development & web technologies lab with dual-boot Linux/Windows workstations.',
    equipment: ['50 Desktop PCs', 'Full HD Projector', 'Whiteboard', 'Air Conditioned'],
    status: 'Available',
    availability: 'Mon - Fri, 08:00 - 17:00',
    maintenancePeriods: [],
    createdBy: 'Prof. Eleanor Vance'
  },
  {
    id: 'res-main-aud',
    name: 'Grand Campus Auditorium',
    category: 'Auditoriums',
    department: 'Computer Science',
    location: 'Central Academic Block',
    capacity: 500,
    description: 'State-of-the-art auditorium equipped with theatrical lighting, 4K LED projection matrix, and acoustic paneling.',
    equipment: ['4K Cinema Projector', 'Dual Stage Wireless Mics', 'Dolby Digital Sound', 'Stage Lights', 'Podium'],
    status: 'Available',
    availability: 'Mon - Sun, 08:00 - 21:00',
    maintenancePeriods: [],
    createdBy: 'Campus Admin'
  },
  {
    id: 'res-sem-hall-a',
    name: 'Turing Seminar Hall',
    category: 'Seminar Halls',
    department: 'Computer Science',
    location: 'Block A - 3rd Floor',
    capacity: 120,
    description: 'Tiered seating seminar hall suitable for departmental guest lectures, research defenses, and workshops.',
    equipment: ['Motorized Screen', 'Laser Projector', 'Podium Mic', 'Video Conferencing System'],
    status: 'Available',
    availability: 'Mon - Sat, 08:00 - 19:00',
    maintenancePeriods: [],
    createdBy: 'Prof. Eleanor Vance'
  },
  {
    id: 'res-mech-workshop',
    name: 'Advanced Fabrication & Robotics Workshop',
    category: 'Laboratories',
    department: 'Mechanical Engineering',
    location: 'Block B - Ground Floor',
    capacity: 40,
    description: 'Heavy machinery and fabrication laboratory featuring 5-axis CNC machines, 3D industrial printers, and laser cutters.',
    equipment: ['3D Metal Printer', 'CNC Milling Machine', 'Safety Gear', 'Dust Extraction Unit', 'Laser Engraver'],
    status: 'Available',
    availability: 'Mon - Fri, 09:00 - 17:00',
    maintenancePeriods: [],
    createdBy: 'Dr. Robert Sterling'
  },
  {
    id: 'res-proj-4k-1',
    name: 'Portable 4K Laser Projector Unit #01',
    category: 'Projectors',
    department: 'Electronics & Communication',
    location: 'Block C - Equipment Locker B',
    capacity: 1,
    description: 'High-brightness 5000 lumens ultra-short throw portable laser projector with HDMI and wireless casting.',
    equipment: ['Laser Projector', '100" Foldable Screen', 'HDMI & USB-C Cables', 'Carrying Case'],
    status: 'Available',
    availability: 'Daily 08:00 - 18:00',
    maintenancePeriods: [],
    createdBy: 'Dr. Maya Lin'
  },
  {
    id: 'res-cam-kit-1',
    name: 'Sony FX3 Cinema Camera Kit',
    category: 'Cameras',
    department: 'Business & Management',
    location: 'Media Production Studio - Block E',
    capacity: 1,
    description: 'Professional 4K full-frame cinema camera kit with 24-70mm f/2.8 lens, wireless lavalier mics, and tripod.',
    equipment: ['Sony FX3 Camera Body', 'FE 24-70mm GM Lens', 'Wireless Lavalier Mics', 'Heavy Duty Tripod', '2x 128GB SD Cards'],
    status: 'Available',
    availability: 'Mon - Fri, 09:00 - 17:00',
    maintenancePeriods: [],
    createdBy: 'Dr. Claire Underwood'
  },
  {
    id: 'res-sports-complex',
    name: 'Indoor Sports Arena & Gymnasium',
    category: 'Sports Facilities',
    department: 'Campus Administration',
    location: 'Sports & Student Activity Complex',
    capacity: 300,
    description: 'Multi-purpose indoor sports arena with wooden flooring, badminton courts, basketball court, and spectator tribune.',
    equipment: ['Basketball Hoops', 'Badminton Nets', 'Electronic Scoreboard', 'Sound System', 'First Aid Kit'],
    status: 'Available',
    availability: 'Mon - Sun, 06:00 - 21:00',
    maintenancePeriods: [],
    createdBy: 'Campus Admin'
  }
];

const seedRequests = [
  {
    id: 'req-101',
    resource: 'Grand Campus Auditorium',
    resourceId: 'res-main-aud',
    requester: 'Sophia Chen',
    requesterId: 'usr-student-1',
    department: 'Computer Science',
    purpose: 'Annual Hackathon 2026 Opening Ceremony & Keynotes',
    date: '2026-09-15',
    startTime: '09:00',
    endTime: '13:00',
    message: 'We will require stage wireless microphones, Dolby sound setup, and high-speed Wi-Fi access for participants.',
    status: 'Pending',
    approvalReason: ''
  },
  {
    id: 'req-102',
    resource: 'Sony FX3 Cinema Camera Kit',
    resourceId: 'res-cam-kit-1',
    requester: 'Liam Gallagher',
    requesterId: 'usr-student-2',
    department: 'Mechanical Engineering',
    purpose: 'Robotics Design Competition Promotional Video Shoot',
    date: '2026-09-10',
    startTime: '10:00',
    endTime: '15:00',
    message: 'Need high quality video capture for our SAE Formula student race car showcase.',
    status: 'Approved',
    approvalReason: 'Approved by Dept Head for inter-departmental competition recording.'
  },
  {
    id: 'req-103',
    resource: 'Computer Laboratory 01',
    resourceId: 'res-cs-lab1',
    requester: 'Marcus Brody',
    requesterId: 'usr-staff-1',
    department: 'Computer Science',
    purpose: 'Specialized Workshop on PyTorch Deep Learning Workflows',
    date: '2026-09-11',
    startTime: '10:00',
    endTime: '12:00',
    message: 'Requires access to GPU workstations for 45 registered students.',
    status: 'Approved',
    approvalReason: 'Approved for scheduled lab session.'
  }
];

const seedBookings = [
  {
    id: 'bk-201',
    resource: 'Sony FX3 Cinema Camera Kit',
    resourceId: 'res-cam-kit-1',
    user: 'Liam Gallagher',
    userId: 'usr-student-2',
    department: 'Mechanical Engineering',
    request: 'req-102',
    date: '2026-09-10',
    startTime: '10:00',
    endTime: '15:00',
    purpose: 'Robotics Design Competition Promotional Video Shoot',
    status: 'Upcoming'
  },
  {
    id: 'bk-202',
    resource: 'Computer Laboratory 01',
    resourceId: 'res-cs-lab1',
    user: 'Marcus Brody',
    userId: 'usr-staff-1',
    department: 'Computer Science',
    request: 'req-103',
    date: '2026-09-11',
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'Specialized Workshop on PyTorch Deep Learning Workflows',
    status: 'Upcoming'
  },
  {
    id: 'bk-203',
    resource: 'Turing Seminar Hall',
    resourceId: 'res-sem-hall-a',
    user: 'Prof. Eleanor Vance',
    userId: 'usr-hod-cs',
    department: 'Computer Science',
    request: 'direct-admin-bk',
    date: '2026-09-03',
    startTime: '11:00',
    endTime: '13:00',
    purpose: 'Department Faculty Council Quarterly Briefing',
    status: 'Active'
  }
];

const seedEvents = [
  {
    id: 'evt-301',
    title: 'Inter-College Hackathon 2026: Code for Impact',
    department: 'Computer Science',
    venue: 'Grand Campus Auditorium',
    venueId: 'res-main-aud',
    date: '2026-09-15',
    startTime: '09:00',
    endTime: '18:00',
    description: '36-hour hackathon bringing together top engineering talent to solve real-world sustainability challenges.',
    organizer: 'Sophia Chen (CS Student Lead)',
    type: 'College Event'
  },
  {
    id: 'evt-302',
    title: 'Next-Gen Robotics & Autonomous Vehicles Symposium',
    department: 'Mechanical Engineering',
    venue: 'Advanced Fabrication & Robotics Workshop',
    venueId: 'res-mech-workshop',
    date: '2026-09-18',
    startTime: '10:00',
    endTime: '16:00',
    description: 'Keynote demonstrations featuring autonomous drone navigation and CAD fabrication.',
    organizer: 'Dr. Robert Sterling',
    type: 'Conference'
  },
  {
    id: 'evt-303',
    title: 'AI in Modern Healthcare & Bio-Informatics Seminar',
    department: 'Biotechnology',
    venue: 'Turing Seminar Hall',
    venueId: 'res-sem-hall-a',
    date: '2026-09-22',
    startTime: '14:00',
    endTime: '17:00',
    description: 'Joint research talk exploring neural networks for genomic sequencing data.',
    organizer: 'Dr. Samuel Hayes',
    type: 'Seminar'
  }
];

const seedNotifications = [
  {
    id: 'notif-401',
    user: 'Sophia Chen',
    title: 'Request Submitted',
    message: 'Your request for Grand Campus Auditorium on Sept 15 has been submitted for HOD review.',
    type: 'info',
    read: false,
    link: 'requests'
  },
  {
    id: 'notif-402',
    user: 'Liam Gallagher',
    title: 'Request Approved!',
    message: 'Your request for Sony FX3 Cinema Camera Kit on Sept 10 has been approved.',
    type: 'success',
    read: true,
    link: 'bookings'
  },
  {
    id: 'notif-403',
    user: 'Prof. Eleanor Vance',
    title: 'New Incoming Request',
    message: 'Sophia Chen requested Grand Campus Auditorium for Annual Hackathon 2026.',
    type: 'warning',
    read: false,
    link: 'incoming'
  }
];

const seedMaintenance = [
  {
    id: 'maint-501',
    resource: 'Computer Laboratory 01',
    resourceId: 'res-cs-lab1',
    title: 'Core Switch Maintenance',
    date: '2026-09-12',
    startTime: '14:00',
    endTime: '17:00',
    description: 'Scheduled firmware upgrades and fiber channel testing.',
    createdBy: 'Prof. Eleanor Vance'
  }
];

const seedSettings = {
  collegeName: 'AURA Institute of Technology',
  tagline: 'Connect. Share. Plan.',
  logoUrl: '',
  departments: ['Computer Science', 'Mechanical Engineering', 'Electronics & Communication', 'Biotechnology', 'Business & Management'],
  categories: ['Classrooms', 'Laboratories', 'Seminar Halls', 'Auditoriums', 'Projectors', 'Laptops', 'Cameras', 'Technical Equipment', 'Sports Facilities', 'Other Resources'],
  buildings: ['Block A (Alan Turing Hall)', 'Block B (Nikola Tesla Complex)', 'Block C (Shannon Wing)', 'Block D (Franklin Bio Labs)', 'Block E (Executive Center)', 'Central Academic Block'],
  locations: ['Block A - Room 201', 'Block A - Room 204', 'Block A - 3rd Floor', 'Block B - Ground Floor', 'Block C - Equipment Locker B', 'Block E - Media Studio', 'Central Academic Block'],
  bookingRules: {
    maxDurationHours: 6,
    advanceDays: 30,
    autoApproveSameDept: false
  }
};

module.exports = {
  seedUsers,
  seedDepartments,
  seedResources,
  seedRequests,
  seedBookings,
  seedEvents,
  seedNotifications,
  seedMaintenance,
  seedSettings
};
