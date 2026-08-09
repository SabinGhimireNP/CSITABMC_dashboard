"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";

const fetchMentors = async () => {
  const { data } = await apiClient.get("/mentors");

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

export const createMentor = async (mentorData) => {
  try {
    const newMentor = {
      updated_at: new Date().toISOString(),
      name: mentorData.fullName,
      email: mentorData.email,
      expertise: mentorData.role,
      linkedin_profile: mentorData.socialLink,
    };
    const response = await apiClient.post("/mentors/", newMentor,{
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating mentor:", error);
    throw error;
  }
};

export const useMentors = () => {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: fetchMentors,
  });
};
