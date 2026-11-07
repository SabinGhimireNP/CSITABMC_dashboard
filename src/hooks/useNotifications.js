"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

export const mapInboxNotification = (item) => ({
  id: item.id,
  notificationId: item.notification_id,
  title: item.title,
  message: item.message,
  sourceModule: item.source_module,
  sourceId: item.source_id,
  data: item.data || {},
  sender: item.sender || null,
  sentAt: item.sent_at,
  isRead: Boolean(item.is_read),
  readAt: item.read_at,
  createdAt: item.created_at,
});

export const mapSentNotification = (item) => ({
  id: item.id,
  title: item.title,
  message: item.message,
  sourceModule: item.source_module,
  sourceId: item.source_id,
  data: item.data || {},
  createdAt: item.created_at,
  recipientCount: item.recipient_count || (item.recipients ? item.recipients.length : 0),
  recipients: (item.recipients || []).map((r) => ({
    id: r.id,
    recipient: r.recipient,
    isRead: Boolean(r.is_read),
    readAt: r.read_at,
    createdAt: r.created_at,
  })),
});

const fetchInbox = createThrottle(async (queryParams = {}) => {
  const {
    search = "",
    sourceModule = "",
    isRead = "",
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
  if (isRead && isRead !== "all") params.is_read = isRead;

  const { data } = await apiClient.get("/notifications/", {
    params,
    signal: queryParams.signal,
  });

  const fetched = (data.results || []).map(mapInboxNotification);
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
    isRead = "",
    page = 1,
    pageSize = 10,
  } = queryParams;

  return useQuery({
    queryKey: ["notifications", "inbox", search, sourceModule, isRead, page, pageSize],
    queryFn: ({ signal }) =>
      fetchInbox({
        search,
        sourceModule,
        isRead,
        page,
        pageSize,
        signal,
      }),
    placeholderData: (previousData) => previousData,
  });
};

export const useUnreadNotificationCount = (options = {}) => {
  const { refetchInterval = 30000, enabled = true } = options;

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await apiClient.get("/notifications/unread-count/");
      return data?.unread_count || 0;
    },
    refetchInterval,
    enabled,
    staleTime: 10000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isRead }) => {
      const { data } = await apiClient.post(`/notifications/${id}/read/`, {
        is_read: isRead,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/notifications/mark-all-read/");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

const fetchSent = createThrottle(async (queryParams = {}) => {
  const { search = "", page = 1, pageSize = 10 } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };

  if (search && search.trim()) params.search = search.trim();

  const { data } = await apiClient.get("/notifications/sent/", {
    params,
    signal: queryParams.signal,
  });

  const fetched = (data.results || []).map(mapSentNotification);
  const count = data.count || 0;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetched,
  };
});

export const useSentNotifications = (queryParams = {}) => {
  const { search = "", page = 1, pageSize = 10 } = queryParams;

  return useQuery({
    queryKey: ["notifications", "sent", search, page, pageSize],
    queryFn: ({ signal }) => fetchSent({ search, page, pageSize, signal }),
    placeholderData: (previousData) => previousData,
  });
};

export const useEligibleRecipients = () => {
  return useQuery({
    queryKey: ["notifications", "eligible-recipients"],
    queryFn: async () => {
      const { data } = await apiClient.get("/notifications/recipients/");
      return data || [];
    },
    staleTime: 60000,
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/notifications/compose/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "sent"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};
