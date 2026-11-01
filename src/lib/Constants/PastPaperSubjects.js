/**
 * ============================================================================
 * CSIT Past Paper Subject Code Mapping & Constants
 * ============================================================================
 * 
 * EDITING GUIDE FOR GITHUB:
 * To add a new subject or update an existing subject code:
 * 1. Locate the semester section below.
 * 2. Add or update the entry in `SUBJECT_CODE_MAP` in the format:
 *      CODE: "Full Subject Name",
 * 3. Commit changes directly on GitHub. The dashboard will automatically pick up
 *    the updated names and dropdown options.
 * ============================================================================
 */

export const SUBJECT_CODE_MAP = {
  // First Semester
  CSC114: "Introduction to Information Technology",
  CSC115: "C Programming",
  CSC116: "Digital Logic",
  MTH117: "Mathematics I",
  PHY118: "Physics",

  // Second Semester
  CSC165: "Discrete Structures",
  CSC166: "Object Oriented Programming (C++)",
  CSC167: "Microprocessor",
  MTH168: "Mathematics II",
  STA169: "Statistics I",

  // Third Semester
  CSC211: "Data Structures and Algorithms",
  CSC212: "Numerical Method",
  CSC213: "Computer Architecture",
  CSC214: "Computer Graphics",
  STA215: "Statistics II",

  // Fourth Semester
  CSC262: "Theory of Computation",
  CSC263: "Computer Networks",
  CSC264: "Operating Systems",
  CSC265: "Database Management System",
  CSC266: "Artificial Intelligence",

  // Fifth Semester
  CSC325: "Design and Analysis of Algorithms",
  CSC326: "System Analysis and Design",
  CSC327: "Cryptography",
  CSC328: "Simulation and Modeling",
  CSC329: "Web Technology",
  CSC330: "Multimedia Computing",
  CSC331: "Wireless Networking",
  CSC332: "Image Processing",
  CSC333: "Knowledge Management",
  CSC334: "Society and Ethics in Information Technology",
  CSC335: "Microprocessor Based Design",

  // Sixth Semester
  CSC375: "Software Engineering",
  CSC376: "Compiler Design and Construction",
  CSC377: "E-Governance",
  CSC378: "NET Centric Computing",
  CSC379: "Technical Writing",
  CSC380: "Applied Logic",
  CSC381: "E-commerce",
  CSC382: "Automation and Robotics",
  CSC383: "Neural Networks",
  CSC384: "Computer Hardware Design",
  CSC385: "Cognitive Science",

  // Seventh Semester (Current Syllabus)
  CSC425: "Advanced Java Programming",
  CSC426: "Data Warehousing and Data Mining",
  MGT427: "Principles of Management",
  CSC428: "Project Work",
  CSC429: "Information Retrieval (Elective I)",
  CSC430: "Database Administration (Elective I)",
  CSC431: "Software Project Management (Elective I)",
  CSC432: "Network Security (Elective I)",
  CSC433: "Digital System Design (Elective I)",

  // Seventh Semester (Old Course Syllabus Codes)
  CSC419: "Advanced Java Programming (Old)",
  CSC420: "Data Warehousing and Data Mining (Old)",
  CSC423: "Information Retrieval (Old)",
  CSC424: "Database Administration (Old)",
  MGT421: "Principles of Management (Old)",
  MGT428: "International Marketing (Old)",

  // Eighth Semester (Current Syllabus)
  CSC475: "Advanced Database",
  CSC476: "Internship",
  CSC477: "Advanced Networking with IPv6",
  CSC478: "Distributed Networking",
  CSC479: "Game Technology",
  CSC480: "Distributed and Object-Oriented Database",
  CSC481: "Introduction to Cloud Computing",
  CSC482: "Geographical Information System",
  CSC483: "Decision Support System and Expert System",
  CSC484: "Mobile Application Development",
  CSC485: "Real Time Systems",
  CSC486: "Network and System Administration",
  CSC487: "Embedded Systems Programming",
  MGT488: "International Business Management",
};

/**
 * Finds a human-readable subject name for a given subject code.
 * Falls back to the code itself if not found in the map.
 * 
 * @param {string} code - The subject code (e.g., 'CSC114')
 * @returns {string} The full subject name
 */
export const findSubjectName = (code) => {
  if (!code) return "Unknown Subject";
  const normalizedCode = code.trim().toUpperCase();
  return SUBJECT_CODE_MAP[normalizedCode] || normalizedCode;
};

/**
 * Formatted list of subjects for dropdown menus and selectors.
 */
export const SUBJECTS_LIST = Object.entries(SUBJECT_CODE_MAP).map(([code, name]) => ({
  id: code,
  name,
  label: `${name} (${code})`,
}));
