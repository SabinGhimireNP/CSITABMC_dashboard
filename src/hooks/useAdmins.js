"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

export const mapAdminFromBackend = (admin) => ({
  id: admin.id,
  username: admin.username,
  email: admin.email,
  role: admin.role,
  role_label: admin.role_label || admin.role,
  is_active: admin.is_active !== undefined ? admin.is_active : true,
  date_joined: admin.date_joined || null,
  last_login: admin.last_login || null,
});

// The Admin accounts table paginates, searches and sorts in the browser, so
// the full account list is fetched once and cached under a single key.
const fetchAdmins = createThrottle(async () => {
  const { data } = await apiClient.get("/users/accounts/", { params: { _: Date.now() } });

  const admins = (Array.isArray(data) ? data : data.results || []).map(mapAdminFromBackend);

  return { data: admins, count: admins.length };
});

/** Predefined roles (value, label, description) served by the backend. */
export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await apiClient.get("/users/roles/");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60 * 60 * 1000,
  });
};

export const useAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: () => fetchAdmins(),
  });
};

export const useAdminDetail = (id) => {
  return useQuery({
    queryKey: ["admin-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get(`/users/accounts/${id}/`);
      return mapAdminFromBackend(data);
    },
    enabled: Boolean(id),
    retry: false,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await apiClient.post("/users/accounts/", formData);
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
      const { data } = await apiClient.patch(`/users/accounts/${id}/`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useToggleAdminActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }) => {
      const { data } = await apiClient.patch(`/users/accounts/${id}/`, { is_active });
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
      await apiClient.delete(`/users/accounts/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};
