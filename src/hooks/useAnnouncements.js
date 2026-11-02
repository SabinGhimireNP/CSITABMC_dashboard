"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";
import { announcementSchema } from "@/lib/Schema/announcementSchema";

export { announcementSchema };

export const mapAnnouncementFromBackend = (item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  image: item.image,
  link: item.link || "",
  createdAt: item.created_at || item.createdAt,
  updatedAt: item.updated_at || item.updatedAt,
});

const fetchAnnouncements = createThrottle(async (queryParams = {}) => {
  const { search = "", ordering = "", page = 1, pageSize = 10 } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search && search.trim()) params.search = search.trim();
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/announcements/", { params });

  const fetched = (data.results || []).map(mapAnnouncementFromBackend);
  const count = data.count || 0;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetched,
  };
});

export const useAnnouncements = (queryParams = {}) => {
  const { search = "", ordering = "", page = 1, pageSize = 10 } = queryParams;

  return useQuery({
    queryKey: ["announcements", search, ordering, page, pageSize],
    queryFn: () => fetchAnnouncements({ search, ordering, page, pageSize }),
  });
};

export const useAnnouncementDetail = (id) => {
  return useQuery({
    queryKey: ["announcement-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get(`/announcements/${id}/`);
      return mapAnnouncementFromBackend(data);
    },
    enabled: Boolean(id),
    retry: false,
  });
};

const throttledCreateAnnouncement = createThrottle(async (formData) => {
  const { data } = await apiClient.post("/announcements/", formData);
  return data;
});

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => throttledCreateAnnouncement(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });
};

const throttledUpdateAnnouncement = createThrottle(async ({ id, formData }) => {
  const { data } = await apiClient.patch(`/announcements/${id}/`, formData);
  return data;
});

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => throttledUpdateAnnouncement({ id, formData }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcement-detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });
};

const throttledDeleteAnnouncement = createThrottle(async (id) => {
  const { data } = await apiClient.delete(`/announcements/${id}/`);
  return data;
});

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => throttledDeleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });
};
