"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";

export const useActivityLogs = ({
  page = 1,
  pageSize = 15,
  module = "",
  action = "",
  startDate = "",
  endDate = "",
  search = "",
} = {}) => {
  return useQuery({
    queryKey: ["activity-logs", { page, pageSize, module, action, startDate, endDate, search }],
    queryFn: async ({ signal }) => {
      const params = { page, page_size: pageSize };
      if (module) params.module = module;
      if (action) params.action = action;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (search) params.search = search;

      const { data } = await apiClient.get("/activity-logs/", { params, signal });
      return data;
    },
    placeholderData: (prev) => prev,
  });
};

export const useActivityLogSummary = () => {
  return useQuery({
    queryKey: ["activity-logs", "summary"],
    queryFn: async () => {
      const { data } = await apiClient.get("/activity-logs/summary/");
      return data;
    },
  });
};

export const useActivityLogDetail = (id) => {
  return useQuery({
    queryKey: ["activity-log-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get(`/activity-logs/${id}/`);
      return data;
    },
    enabled: Boolean(id),
    retry: false,
  });
};
