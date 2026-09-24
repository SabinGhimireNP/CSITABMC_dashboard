"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchCertificates = createThrottle(async () => {
  const { data } = await apiClient.get("/certificates");

  // Primary: assumes backend returns { count, next, previous, results }
  const results = data.results || data;
  const count = data.count ?? results.length;

  const fetchedCertificates = results.map((certificate) => ({
    id: certificate.certificate_id,
    event: certificate.event,
    fullName: certificate.full_name,
    createdAt: certificate.issued_at,
    isProjectComplete: false,
  }));

  return {
    count,
    data: fetchedCertificates,
  };

  // TODO: uncomment below and remove above once backend returns paginated shape for this endpoint
  // const fetchedCertificates = data.map((certificate) => ({ ... }));
  // return { count: data.length, data: fetchedCertificates };
});

export const useCertificates = () => {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: fetchCertificates,
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