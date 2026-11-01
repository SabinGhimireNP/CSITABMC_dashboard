"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

import {
  SUBJECT_CODE_MAP,
  SUBJECTS_LIST,
  findSubjectName,
} from "@/lib/Constants/PastPaperSubjects";

export { SUBJECT_CODE_MAP, SUBJECTS_LIST, findSubjectName };

const fetchPastPapers = createThrottle(async (queryParams = {}) => {
  const {
    search = "",
    ordering = "",
    page = 1,
    pageSize = 10,
    model_set = "",
    is_old_course = "",
  } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search && search.trim()) params.search = search.trim();
  if (ordering) params.ordering = ordering;
  if (model_set !== "") params.model_set = model_set;
  if (is_old_course !== "") params.is_old_course = is_old_course;

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
      is_old_course: Boolean(paper.is_old_course),
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
  const {
    search = "",
    ordering = "",
    page = 1,
    pageSize = 10,
    model_set = "",
    is_old_course = "",
  } = queryParams;

  return useQuery({
    queryKey: ["pastPapers", search, ordering, page, pageSize, model_set, is_old_course],
    queryFn: () =>
      fetchPastPapers({ search, ordering, page, pageSize, model_set, is_old_course }),
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