"use client";

import { useQuery } from "@tanstack/react-query";
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