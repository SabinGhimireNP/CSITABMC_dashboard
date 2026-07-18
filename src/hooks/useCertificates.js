"use client";

import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_URL;

const fetchCertificates = async () => {
  const response = await fetch(`${API_URL}/certificates`);
  if (!response.ok) throw new Error("Failed to fetch certificates");
  const data = await response.json();

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
};

export const useCertificates = () => {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: fetchCertificates,
  });
};