"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

export const mapNotificationFromBackend = (item) => ({
  id: item.id,
  sourceModule: item.source_module,
  sourceId: item.source_id,
  sourceTitle: item.source_title,
  title: item.title,
  body: item.body,
  data: item.data,
  status: item.status,
  totalDevices: item.total_devices,
  acceptedCount: item.accepted_count,
  failedCount: item.failed_count,
  retryCount: item.retry_count,
  errorSummary: item.error_summary,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  attempts: (item.attempts || []).map((att) => ({
    id: att.id,
    attemptNumber: att.attempt_number,
    targetedCount: att.targeted_count,
    acceptedCount: att.accepted_count,
    failedCount: att.failed_count,
    status: att.status,
    errorSummary: att.error_summary,
    createdAt: att.created_at,
  })),
});

const fetchNotifications = createThrottle(async (queryParams = {}) => {
  const {
    search = "",
    sourceModule = "",
    status = "",
    date = "",
    ordering = "",
    page = 1,
    pageSize = 10,
  } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };

  if (search && search.trim()) params.search = search.trim();
  if (sourceModule && sourceModule !== "all") params.source_module = sourceModule;
  if (status && status !== "all") params.status = status;
  if (date) params.date = date;
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/notifications/", { params, signal: queryParams.signal });

  const fetched = (data.results || []).map(mapNotificationFromBackend);
  const count = data.count || 0;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetched,
  };
});

export const useNotifications = (queryParams = {}) => {
  const {
    search = "",
    sourceModule = "",
    status = "",
    date = "",
    ordering = "",
    page = 1,
    pageSize = 10,
  } = queryParams;

  return useQuery({
    queryKey: ["notifications", search, sourceModule, status, date, ordering, page, pageSize],
    queryFn: ({ signal }) =>
      fetchNotifications({
        search,
        sourceModule,
        status,
        date,
        ordering,
        page,
        pageSize,
        signal,
      }),
    placeholderData: (previousData) => previousData,
  });
};

export const useNotificationDetail = (id) => {
  return useQuery({
    queryKey: ["notification-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get(`/notifications/${id}/`);
      return mapNotificationFromBackend(data);
    },
    enabled: Boolean(id),
    retry: false,
  });
};

const throttledRetryNotification = createThrottle(async (id) => {
  const { data } = await apiClient.post(`/notifications/${id}/retry/`);
  return data;
});

export const useRetryNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => throttledRetryNotification(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });
};
