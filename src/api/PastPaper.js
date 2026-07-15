// PAST_PAPERS
// id: 1,
// subject_code: "CSC101",
// subject_name: "Computer Fundamentals & Applications",
// semester: 1,
// model_set: false,
// exam_year: 2024,
// drive_link: "https://drive.google.com/file/d/1672-yFZ49XqYhnMHXKt3rWf2IBqxw7xm/view?usp=sharing",
// slug: "csc101-2024-board-exam",
// created_at: "2025-01-10T10:00:00Z",
// updated_at: "2025-01-10T10:00:00Z",

import axios from "axios";

export const PAST_PAPERS = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL}/past-papers`,
    );

    const data = response.data;

    const fetchedPastPapers = data.results.map((paper) => {
      return {
        id: paper.id,
        subject_code: paper.subject_name,
        subject_name: findSubjectName(paper.subject_name),
        semester: paper.semester,
        model_set: paper.model_set,
        exam_year: paper.exam_year,
        drive_link: paper.drive_link,
        slug: paper.slug,
        created_at: paper.created_at,
        updated_at: paper.updated_at,
      };
    });

    return {
      count: data.count,
      data: fetchedPastPapers,
    };
  } catch (error) {
    console.error("Error fetching past papers:", error);
    throw error;
  }
};

const subjectCodeMap = {
  // Semester 1
  CSC114: "Introduction to Information Technology",
  CSC115: "C Programming",
  CSC116: "Digital Logic",
  MTH117: "Mathematics I",
  PHY118: "Physics",

  // Semester 2
  CSC165: "Discrete Structures",
  CSC166: "Object Oriented Programming",
  CSC167: "Microprocessor",
  MTH168: "Mathematics II",
  STA169: "Statistics I",

  // Semester 3
  CSC211: "Data Structures and Algorithms",
  CSC212: "Numerical Method",
  CSC213: "Computer Architecture",
  CSC214: "Computer Graphics",
  STA215: "Statistics II",

  // Semester 4
  CSC262: "Theory of Computation",
  CSC263: "Computer Networks",
  CSC264: "Operating Systems",
  CSC265: "Database Management System",
  CSC266: "Artificial Intelligence",

  // Semester 5 (core + electives)
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

  // Semester 6 (core + electives)
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

  // Semester 7 (core + electives)
  CSC419: "Advanced Java Programming",
  CSC420: "Data Warehousing and Data Mining",
  CSC423: "Information Retrieval",
  CSC424: "Database Administration",
  CSC425: "Software Project Management",
  CSC426: "Network Security",
  CSC427: "Digital System Design",
  MGT421: "Principles of Management",
  MGT428: "International Marketing",

  // Semester 8 (core + electives)
  CSC475: "Advanced Database",
  CSC477: "Advanced Networking with IPV6",
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

 const findSubjectName = (code) => {
  if (!code) return "Unknown Subject";
  const normalizedCode = code.trim().toUpperCase();
  return subjectCodeMap[normalizedCode] || "Unknown Subject";
};

export default findSubjectName;
