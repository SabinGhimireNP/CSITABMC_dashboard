"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

// The Admin accounts table paginates, searches and sorts in the browser, so
// the full account list is fetched once and cached under a single key.
const fetchAdmins = createThrottle(async () => {
  const { data } = await apiClient.get("/users/", { params: { _: Date.now() } });

  const admins = (Array.isArray(data) ? data : data.results || []).map((admin) => ({
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    date_joined: admin.date_joined || null,
  }));

  return { data: admins, count: admins.length };
});

export const useAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: () => fetchAdmins(),
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
