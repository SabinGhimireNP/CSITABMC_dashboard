"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

export const mapNoticeFromBackend = (notice) => ({
  id: notice.id,
  slug: notice.slug,
  title: notice.title,
  image: notice.image,
  category: notice.category,
  status: notice.status,
  description: notice.description,
  createdAt: notice.updated_at,
});

const fetchNotices = createThrottle(async (queryParams = {}) => {
  const { search = "", status = "", category = "", date = "", id = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search.trim()) params.search = search.trim();
  if (status) params.status = status;
  if (category) params.category = category;
  if (date) params.date = date;
  if (id) params.id = id;
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/notices", { params });

  const fetchedNotices = (data.results || []).map(mapNoticeFromBackend);

  const count = data.count || 0;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetchedNotices,
  };
});

export const useNotices = (queryParams = {}) => {
  const { search = "", status = "", category = "", date = "", id = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  return useQuery({
    queryKey: ["notices", search, status, category, date, id, ordering, page, pageSize],
    queryFn: () => fetchNotices({ search, status, category, date, id, ordering, page, pageSize }),
  });
};

export const useNoticeDetail = (slugOrId) => {
  return useQuery({
    queryKey: ["notice-detail", slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const { data } = await apiClient.get(`/notices/${slugOrId}/`);
      return mapNoticeFromBackend(data);
    },
    enabled: Boolean(slugOrId),
    retry: false,
  });
};

// ── Throttled mutation functions ─────────────────────────────────────────
// Prevent the same mutation from being fired more than once at a time, even
// if the caller invokes it multiple times in quick succession. The lock is
// released only when the request completes (success or failure).

const throttledCreateNotice = createThrottle(async (formData) => {
  const { data } = await apiClient.post("/notices/", formData);
  return data;
});

const throttledUpdateNotice = createThrottle(async ({ slug, formData }) => {
  const { data } = await apiClient.put(`/notices/${slug}/`, formData);
  return data;
});

export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: throttledCreateNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: throttledUpdateNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};

const throttledDeleteNotice = createThrottle(async (slug) => {
  await apiClient.delete(`/notices/${slug}/`);
  return slug;
});

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: throttledDeleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};