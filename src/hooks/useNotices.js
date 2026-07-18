"use client";

import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_URL;

const fetchNotices = async () => {
  const response = await fetch(`${API_URL}/notices`);
  if (!response.ok) throw new Error("Failed to fetch notices");
  const data = await response.json();

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