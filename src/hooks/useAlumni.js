"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";

const fetchAlumni = async () => {
  const { data } = await apiClient.get("/alumni");

  // Primary: assumes backend returns { count, next, previous, results }
  const results = data.results || data;
  const count = data.count ?? results.length;

  const fetchedAlumni = results.map((alumni) => ({
    id: alumni.id,
    memberId: alumni.member?.id || alumni.id,
    fullName: alumni.member?.name || "",
    post: alumni.member?.role || "Alumni",
    email: alumni.member?.email || "",
    facebookLink: alumni.member?.fb_link || "",
    linkedinLink: alumni.member?.linkedin_link || "",
    githubLink: alumni.member?.github_link || "",
    tags: ["Alumni"],
    description: alumni.bio || "",
    image: alumni.member?.image || null,
    status: "active",
    graduationYear: alumni.graduation_year || null,
    createdAt: alumni.member?.created_at || "",
  }));

  return {
    count,
    data: fetchedAlumni,
  };
};

export const useAlumni = () => {
  return useQuery({
    queryKey: ["alumni"],
    queryFn: fetchAlumni,
  });
};