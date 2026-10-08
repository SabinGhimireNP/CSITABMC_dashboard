"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchMentors = createThrottle(async (queryParams = {}) => {
  const { search = "", status = "", id = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search && search.trim()) params.search = search.trim();
  if (status) params.status = status;
  if (id) params.id = id;
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/mentors", { params });

  const rawResults = Array.isArray(data) ? data : (data.results || []);
  const fetchedMentors = rawResults.map((mentor) => ({
    id: mentor.id,
    fullName: mentor.name,
    socialLink: mentor.linkedin_profile || "",
    image: mentor.photo || null,
    events: [],
    role: mentor.expertise || "",
    status: "published",
    slug: mentor.slug,
  }));

  const count = data.count ?? rawResults.length;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetchedMentors,
  };
});

export const useMentors = (queryParams = {}) => {
  const { search = "", status = "", id = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  return useQuery({
    queryKey: ["mentors", search, status, id, ordering, page, pageSize],
    queryFn: () => fetchMentors({ search, status, id, ordering, page, pageSize }),
  });
};

const createMentor = createThrottle(async (formData) => {
  const { data } = await apiClient.post("/mentors/", formData);
  return data;
});

const updateMentor = createThrottle(async ({ slug, formData }) => {
  const { data } = await apiClient.put(`/mentors/${slug}/`, formData);
  return data;
});

const deleteMentor = createThrottle(async (slug) => {
  await apiClient.delete(`/mentors/${slug}/`);
  return slug;
});

export const useCreateMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUpdateMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useDeleteMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
