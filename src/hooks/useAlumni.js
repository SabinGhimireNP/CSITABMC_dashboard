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
    email: alumni.member?.email || "",
    phoneNumber: alumni.member?.phone_number || "",
    facebookLink: alumni.member?.fb_link || "",
    linkedinLink: alumni.member?.linkedin_link || "",
    githubLink: alumni.member?.github_link || "",
    slug: alumni.member?.slug || "",
    image: alumni.member?.image || null,
    graduationYear: alumni.graduation_year || null,
    bio: alumni.bio || "",
    status: "active",
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