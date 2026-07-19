"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";

const fetchNotices = async () => {
  const { data } = await apiClient.get("/notices");

  const fetchedNotices = (data.results || []).map((notice) => ({
    id: notice.id,
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
};

export const useNotices = () => {
  return useQuery({
    queryKey: ["notices"],
    queryFn: fetchNotices,
  });
};