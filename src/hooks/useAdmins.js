"use client";

import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchAdmins = createThrottle(async (queryParams = {}) => {
  const { search = "", page = 1, pageSize = 5 } = queryParams;

  const { data } = await apiClient.get("/users/", { params: { _: Date.now() } });

  let admins = (Array.isArray(data) ? data : data.results || []).map((admin) => ({
    id: admin.id,
    admin_id: admin.admin_id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    date_joined: admin.date_joined || admin.createdAt || new Date().toISOString(),
  }));

  if (search.trim()) {
    const query = search.toLowerCase();
    admins = admins.filter(
      (a) =>
        a.username?.toLowerCase().includes(query) ||
        a.email?.toLowerCase().includes(query) ||
        a.role?.toLowerCase().includes(query)
    );
  }

  const count = admins.length;
  const totalPages = Math.ceil(count / pageSize) || 1;
  
  const startOffset = (page - 1) * pageSize;
  const paginatedData = admins.slice(startOffset, startOffset + pageSize);

  return {
    count,
    totalPages,
    data: paginatedData,
    allData: admins
  };
});

export const useAdmins = (queryParams = {}) => {
  return useQuery({
    queryKey: ["admins", queryParams],
    queryFn: () => fetchAdmins(queryParams),
    placeholderData: keepPreviousData,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await apiClient.post("/users/", formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      const { data } = await apiClient.patch(`/users/${id}/`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/users/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};
