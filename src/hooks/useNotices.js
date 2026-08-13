"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchNotices = createThrottle(async () => {
  // The backend caches GET responses for 5 minutes (cache_page). Adding a
  // unique query param busts that cache so the list always reflects the
  // latest data after create/update operations.
  const { data } = await apiClient.get("/notices", {
    params: { _: Date.now() },
  });

  const fetchedNotices = (data.results || []).map((notice) => ({
    id: notice.id,
    slug: notice.slug,
    title: notice.title,
    image: notice.image,
    category: notice.category,
    status: notice.status,
    description: notice.description,
    createdAt: notice.updated_at,
  }));

  return {
    count: data.count,
    data: fetchedNotices,
  };
});

export const useNotices = () => {
  return useQuery({
    queryKey: ["notices"],
    queryFn: fetchNotices,
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
