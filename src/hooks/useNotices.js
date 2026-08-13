"use client";

import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchNotices = createThrottle(async (queryParams = {}) => {
  const { search = "", status = "", page = 1, pageSize = 5 } = queryParams;

  // The backend caches GET responses for 5 minutes (cache_page). Adding a
  // unique query param busts that cache so the list always reflects the
  // latest data after create/update operations.
  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search.trim()) params.search = search.trim();
  if (status) params.status = status;

  const { data } = await apiClient.get("/notices", { params });

  const fetchedNotices = (data.results || [])
    .map((notice) => ({
      id: notice.id,
      slug: notice.slug,
      title: notice.title,
      image: notice.image,
      category: notice.category,
      status: notice.status,
      description: notice.description,
      createdAt: notice.updated_at,
    }))
    // Default view is id-based (ascending). The backend orders by
    // -created_at, so we re-sort client-side to keep the default view
    // consistent and predictable.
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  const count = data.count || 0;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetchedNotices,
  };
});

export const useNotices = (queryParams = {}) => {
  const { search = "", status = "", page = 1, pageSize = 5 } = queryParams;

  return useQuery({
    queryKey: ["notices", search, status, page, pageSize],
    queryFn: () => fetchNotices({ search, status, page, pageSize }),
    // Keep the previous page's data on screen while a new filter/page is
    // being fetched, so the table updates in place (with the top progress
    // bar) instead of unmounting to the skeleton loader.
    placeholderData: keepPreviousData,
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