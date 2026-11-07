"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";
import { getAssignmentRoleLabel } from "@/lib/Constants/MentorEventRoles";

export const mapMentorFromBackend = (mentor) => {
  const eventAssignments = Array.isArray(mentor.event_assignments)
    ? mentor.event_assignments.map((a) => ({
        eventId: a.event_id,
        eventTitle: a.event_title || "",
        role: a.role,
        customRole: a.custom_role || "",
        roleLabel: getAssignmentRoleLabel(a),
        responsibility: a.responsibility || "",
      }))
    : [];
  return {
    id: mentor.id,
    fullName: mentor.name,
    email: mentor.email || "",
    socialLink: mentor.linkedin_profile || "",
    image: mentor.photo || null,
    events: eventAssignments.map((a) => a.eventId),
    eventAssignments,
    role: mentor.expertise || "",
    status: "published",
  };
};

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

  const { data } = await apiClient.get("/mentors/", { params, signal: queryParams.signal });

  const rawResults = Array.isArray(data) ? data : (data.results || []);
  const fetchedMentors = rawResults.map(mapMentorFromBackend);

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
    queryFn: ({ signal }) => fetchMentors({ search, status, id, ordering, page, pageSize, signal }),
    placeholderData: (previousData) => previousData,
  });
};

export const useMentorDetail = (id) => {
  return useQuery({
    queryKey: ["mentor", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get(`/mentors/${id}/`);
      return mapMentorFromBackend(data);
    },
    enabled: Boolean(id),
    retry: false,
  });
};

const createMentor = createThrottle(async (formData) => {
  const { data } = await apiClient.post("/mentors/", formData);
  return data;
});

// Mentors are addressed by primary key only.
const updateMentor = createThrottle(async ({ id, formData }) => {
  const { data } = await apiClient.put(`/mentors/${id}/`, formData);
  return data;
});

const deleteMentor = createThrottle(async (id) => {
  await apiClient.delete(`/mentors/${id}/`);
  return id;
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
