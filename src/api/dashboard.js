const Notices = [
  {
    id: "n1",
    title: "End Semester Examination Routine Released",
    category: "Exam",
    status: "Published",
    date: "2026-07-04",
  },
  {
    id: "n2",
    title: "Presidential Scholarship Application 2026 Open",
    category: "Scholarship",
    status: "Published",
    date: "2026-07-03",
  },
  {
    id: "n3",
    title: "Revised Academic Calendar for Autumn Semester",
    category: "Academic",
    status: "Published",
    date: "2026-07-02",
  },
  {
    id: "n4",
    title: "System Maintenance: Dashboard Downtime on Sunday",
    category: "General",
    status: "Published",
    date: "2026-07-01",
  },
  {
    id: "n5",
    title: "Admissions Extended for Post Graduate Courses",
    category: "Admission",
    status: "Published",
    date: "2026-06-29",
  },
  {
    id: "n6",
    title: "National Level Hackathon Registration Notice",
    category: "General",
    status: "Published",
    date: "2026-06-28",
  },
  {
    id: "n7",
    title: "Graduation Ceremony Checklist and Guidelines",
    category: "General",
    status: "Draft",
    date: "2026-06-25",
  },
  {
    id: "n8",
    title: "Make-up Exam Form Submission Deadlines",
    category: "Exam",
    status: "Archived",
    date: "2026-06-20",
  },
  {
    id: "n9",
    title: "Publishing of Re-evaluation Results Batch 2022",
    category: "Result",
    status: "Published",
    date: "2026-06-18",
  },
  {
    id: "n10",
    title: "Daily Bus Route 4 Schedule Adjustments",
    category: "Routine",
    status: "Draft",
    date: "2026-06-15",
  },
];

const Events = [
  {
    id: "e1",
    title: "Next.js 16 Production Architectures",
    registrationOpen: true,
    startDate: "2026-07-15",
    location: "Auditorium",
    type: "Workshop",
  },
  {
    id: "e2",
    title: "AI/ML Innovations Hackathon",
    registrationOpen: true,
    startDate: "2026-07-20",
    location: "Lab 1",
    type: "Hackathon",
  },
  {
    id: "e3",
    title: "UI/UX Design Systems Sync-up",
    registrationOpen: true,
    startDate: "2026-07-11",
    location: "Seminar Hall",
    type: "Meetup",
  },
  {
    id: "e4",
    title: "Cloud Native Architecture Bootcamp",
    registrationOpen: false,
    startDate: "2026-07-01",
    location: "Lab 2",
    type: "Bootcamp",
  },
  {
    id: "e5",
    title: "Campus Placement Tech Drive 2026",
    registrationOpen: true,
    startDate: "2026-07-25",
    location: "BMC Hall",
    type: "Placement",
  },
  {
    id: "e6",
    title: "Cybersecurity Red Teaming Simulation",
    registrationOpen: true,
    startDate: "2026-07-18",
    location: "Lab 1",
    type: "Workshop",
  },
  {
    id: "e7",
    title: "Open Source Contribution Day",
    registrationOpen: false,
    startDate: "2026-06-20",
    location: "Seminar Hall",
    type: "Meetup",
  },
  {
    id: "e8",
    title: "Intro to Devops and CI/CD Pipelines",
    registrationOpen: true,
    startDate: "2026-08-02",
    location: "Lab 2",
    type: "Workshop",
  },
  {
    id: "e9",
    title: "Alumni Meet and Networking Gala",
    registrationOpen: true,
    startDate: "2026-08-10",
    location: "BMC Hall",
    type: "Social",
  },
  {
    id: "e10",
    title: "Quantum Computing Basics Guest Lecture",
    registrationOpen: false,
    startDate: "2026-06-10",
    location: "Auditorium",
    type: "Lecture",
  },
];
const Mentors = [
  {
    id: "m1",
    name: "Alex Rivera",
    position: "Frontend Mentor",
    department: "Computer Science",
    email: "alex.rivera@platform.edu",
  },
  {
    id: "m2",
    name: "Dr. Sarah Chen",
    position: "AI Mentor",
    department: "Data Science",
    email: "sarah.chen@platform.edu",
  },
  {
    id: "m3",
    name: "Marcus Jensen",
    position: "Backend Mentor",
    department: "Software Engineering",
    email: "marcus.j@platform.edu",
  },
  {
    id: "m4",
    name: "Elena Rostova",
    position: "UI/UX Mentor",
    department: "Design Tech",
    email: "elena.r@platform.edu",
  },
  {
    id: "m5",
    name: "David Kross",
    position: "Cloud Mentor",
    department: "Information Technology",
    email: "david.k@platform.edu",
  },
  {
    id: "m6",
    name: "Aisha Rahman",
    position: "Security Mentor",
    department: "Cybersecurity",
    email: "aisha.r@platform.edu",
  },
  {
    id: "m7",
    name: "Liam O'Connor",
    position: "Frontend Mentor",
    department: "Computer Science",
    email: "liam.oc@platform.edu",
  },
  {
    id: "m8",
    name: "Yuki Tanaka",
    position: "AI Mentor",
    department: "Data Science",
    email: "yuki.t@platform.edu",
  },
  {
    id: "m9",
    name: "Carlos Mendez",
    position: "Backend Mentor",
    department: "Software Engineering",
    email: "carlos.m@platform.edu",
  },
  {
    id: "m10",
    name: "Sofia Gabor",
    position: "UI/UX Mentor",
    department: "Design Tech",
    email: "sofia.g@platform.edu",
  },
  {
    id: "m11",
    name: "James Wilson",
    position: "Cloud Mentor",
    department: "Information Technology",
    email: "james.w@platform.edu",
  },
  {
    id: "m12",
    name: "Zoe Miller",
    position: "Security Mentor",
    department: "Cybersecurity",
    email: "zoe.m@platform.edu",
  },
];

const Certificates = [
  {
    id: "c1",
    fullName: "Emily Watson",
    createdAt: "2026-07-04",
    isProjectComplete: true,
  },
  {
    id: "c2",
    fullName: "Ethan Hunt",
    createdAt: "2026-07-03",
    isProjectComplete: true,
  },
  {
    id: "c3",
    fullName: "Clara Oswald",
    createdAt: "2026-07-02",
    isProjectComplete: false,
  },
  {
    id: "c4",
    fullName: "Jordan Kapoor",
    createdAt: "2026-07-01",
    isProjectComplete: true,
  },
  {
    id: "c5",
    fullName: "Devon Lane",
    createdAt: "2026-06-30",
    isProjectComplete: true,
  },
  {
    id: "c6",
    fullName: "Miriam Vance",
    createdAt: "2026-06-29",
    isProjectComplete: false,
  },
  {
    id: "c7",
    fullName: "Lucas Scott",
    createdAt: "2026-06-28",
    isProjectComplete: true,
  },
  {
    id: "c8",
    fullName: "Amara Diallo",
    createdAt: "2026-06-27",
    isProjectComplete: true,
  },
  {
    id: "c9",
    fullName: "Nathan Drake",
    createdAt: "2026-06-25",
    isProjectComplete: false,
  },
  {
    id: "c10",
    fullName: "Srinivas Raman",
    createdAt: "2026-06-24",
    isProjectComplete: true,
  },
  {
    id: "c11",
    fullName: "Chloe Frazer",
    createdAt: "2026-06-22",
    isProjectComplete: true,
  },
  {
    id: "c12",
    fullName: "Bruce Banner",
    createdAt: "2026-06-20",
    isProjectComplete: false,
  },
];

// Filtering Handlers
export const getPublishedNotices = () => {
  return Notices.filter((notice) => notice.status === "Published");
};

export const getUpcomingEvents = () => {
  const today = new Date("2026-07-05"); // Static application runtime contextual reference matching requirement state
  return Events.filter((event) => new Date(event.startDate) >= today);
};

export const getOpenEvents = () => {
  return Events.filter((event) => event.registrationOpen === true);
};

export const getCompletedCertificates = () => {
  return Certificates.filter((cert) => cert.isProjectComplete === true);
};

// Slice limits optimization for Recent lists (top 5 chronological records)
export const getRecentNotices = () => {
  return getPublishedNotices()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
};

export const getRecentEvents = () => {
  return [...Events]
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5);
};

export const getRecentCertificates = () => {
  return [...Certificates]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
};

export const getTotalMentorsCount = () => {
  return Mentors.length;
};
