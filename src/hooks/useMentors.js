"use client";

import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_URL;

const fetchMentors = async () => {
  const response = await fetch(`${API_URL}/mentors`);
  if (!response.ok) throw new Error("Failed to fetch mentors");
  const data = await response.json();

  // Primary: assumes backend returns { count, next, previous, results }
  const results = data.results || data;
  const count = data.count ?? results.length;

  const fetchedMentors = results.map((mentor) => ({
    id: mentor.id,
    fullName: mentor.name,
    socialLink: mentor.linkedin_profile,
    image: mentor.photo,
    events: [1, 4],
    role: mentor.expertise,
    status: "published",
  }));

  return {
    count,
    data: fetchedMentors,
  };

  // TODO: uncomment below and remove above once backend returns paginated shape for this endpoint
  // const fetchedMentors = data.map((mentor) => ({ ... }));
  // return { count: data.length, data: fetchedMentors };
};

export const useMentors = () => {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: fetchMentors,
  });
};