"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

export const mapCertificateFromBackend = (certificate) => ({
  id: certificate.certificate_id || certificate.id,
  certificate_id: certificate.certificate_id || certificate.id,
  event: certificate.event,
  fullName: certificate.full_name,
  full_name: certificate.full_name,
  createdAt: certificate.issued_at,
  isProjectComplete: certificate.is_project_completed ?? false,
  is_project_completed: certificate.is_project_completed ?? false,
});

const fetchCertificates = createThrottle(async (queryParams = {}) => {
  const { search = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search && search.trim()) params.search = search.trim();
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/certificates/", { params });

  // Primary: assumes backend returns { count, next, previous, results }
  const rawResults = Array.isArray(data) ? data : (data.results || []);
  const count = data.count ?? rawResults.length;

  const fetchedCertificates = rawResults.map(mapCertificateFromBackend);

  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetchedCertificates,
  };
});

export const useCertificates = (queryParams = {}) => {
  const { search = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  return useQuery({
    queryKey: ["certificates", search, ordering, page, pageSize],
    queryFn: () => fetchCertificates({ search, ordering, page, pageSize }),
  });
};

export const useCertificateDetail = (id) => {
  return useQuery({
    queryKey: ["certificate-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get(`/certificates/${id}/`);
      return mapCertificateFromBackend(data);
    },
    enabled: Boolean(id),
    retry: false,
  });
};

const throttledCreateCertificate = createThrottle(async (data) => {
  const response = await apiClient.post("/certificates/", data);
  return response.data;
});

const throttledUpdateCertificate = createThrottle(async ({ id, data }) => {
  const response = await apiClient.put(`/certificates/${id}/`, data);
  return response.data;
});

const throttledDeleteCertificate = createThrottle(async (id) => {
  await apiClient.delete(`/certificates/${id}/`);
  return id;
});

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: throttledCreateCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
};

export const useUpdateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: throttledUpdateCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
};

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: throttledDeleteCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
};

export const useBulkUpdateCertificateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, is_project_completed }) => {
      const { data } = await apiClient.patch("/certificates/", {
        ids,
        is_project_completed,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
};
