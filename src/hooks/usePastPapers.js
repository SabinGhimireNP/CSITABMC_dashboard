"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const subjectCodeMap = {
  CSC114: "Introduction to Information Technology",
  CSC115: "C Programming",
  CSC116: "Digital Logic",
  MTH117: "Mathematics I",
  PHY118: "Physics",
  CSC165: "Discrete Structures",
  CSC166: "Object Oriented Programming",
  CSC167: "Microprocessor",
  MTH168: "Mathematics II",
  STA169: "Statistics I",
  CSC211: "Data Structures and Algorithms",
  CSC212: "Numerical Method",
  CSC213: "Computer Architecture",
  CSC214: "Computer Graphics",
  STA215: "Statistics II",
  CSC262: "Theory of Computation",
  CSC263: "Computer Networks",
  CSC264: "Operating Systems",
  CSC265: "Database Management System",
  CSC266: "Artificial Intelligence",
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
  CSC419: "Advanced Java Programming",
  CSC420: "Data Warehousing and Data Mining",
  CSC423: "Information Retrieval",
  CSC424: "Database Administration",
  CSC425: "Software Project Management",
  CSC426: "Network Security",
  CSC427: "Digital System Design",
  MGT421: "Principles of Management",
  MGT428: "International Marketing",
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

export const SUBJECTS_LIST = Object.entries(subjectCodeMap).map(([code, name]) => ({
  id: code,
  name,
  label: `${name} (${code})`,
}));

const fetchPastPapers = createThrottle(async (queryParams = {}) => {
  const { search = "", ordering = "", page = 1, pageSize = 10, model_set = "" } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search && search.trim()) params.search = search.trim();
  if (ordering) params.ordering = ordering;
  if (model_set !== "") params.model_set = model_set;

  const { data } = await apiClient.get("/past-papers/", { params });

  const rawResults = Array.isArray(data) ? data : (data.results || []);
  const fetchedPastPapers = rawResults.map((paper) => {
    const rawCode = paper.subject_name;
    const name = findSubjectName(rawCode);
    const displayName = `${name} (${rawCode})`;

    return {
      id: paper.id,
      subject_code: rawCode,
      subject_name: displayName,
      semester: paper.semester,
      model_set: paper.model_set,
      exam_year: paper.exam_year,
      drive_link: paper.drive_link,
      slug: paper.slug,
      created_at: paper.created_at,
      updated_at: paper.updated_at,
    };
  });

  const count = data.count ?? rawResults.length;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetchedPastPapers,
  };
});

export const usePastPapers = (queryParams = {}) => {
  const { search = "", ordering = "", page = 1, pageSize = 10, model_set = "" } = queryParams;

  return useQuery({
    queryKey: ["pastPapers", search, ordering, page, pageSize, model_set],
    queryFn: () => fetchPastPapers({ search, ordering, page, pageSize, model_set }),
    placeholderData: keepPreviousData,
  });
};

export const useCreatePastPaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async (data) => {
      const response = await apiClient.post("/past-papers/", data);
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastPapers"] });
    }
  });
};

export const useUpdatePastPaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async ({ slug, data }) => {
      const response = await apiClient.put(`/past-papers/${slug}/`, data);
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastPapers"] });
    }
  });
};

export const useDeletePastPaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async (slug) => {
      const response = await apiClient.delete(`/past-papers/${slug}/`);
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastPapers"] });
    }
  });
};

export { findSubjectName };