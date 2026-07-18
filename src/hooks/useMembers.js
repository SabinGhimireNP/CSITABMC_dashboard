"use client";

import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_URL;

const fetchTenures = async () => {
  const response = await fetch(`${API_URL}/tenures`);
  if (!response.ok) throw new Error("Failed to fetch tenures");
  const data = await response.json();

  // Primary: assumes backend returns { count, next, previous, results }
  const results = data.results || data;
  const count = data.count ?? results.length;

  const fetchedTenures = results.map((tenure) => ({
    id: tenure.id,
    Members: tenure.members.map((member) => ({
      id: member.id,
      tenureName: member.tenure,
      memberId: member.id,
      fullName: member.name,
      post: member.role,
      email: member.email,
      facebookLink: member.fb_link,
      linkedinLink: member.linkedin_link,
      githubLink: member.github_link,
      tags: ["Leadership", "Event Management"],
      description: "Club president and founding member.",
      image: member.image,
      status: "active",
      createdAt: member.created_at,
    })),
    name: tenure.name,
    startDate: tenure.start_date,
    endDate: tenure.end_date,
    slug: tenure.slug,
  }));

  return {
    count,
    data: fetchedTenures,
  };

  // TODO: uncomment below and remove above once backend returns paginated shape for this endpoint
  // const fetchedTenures = data.map((tenure) => ({ ... }));
  // return { count: data.length, data: fetchedTenures };
};

export const useTenures = () => {
  return useQuery({
    queryKey: ["tenures"],
    queryFn: fetchTenures,
  });
};