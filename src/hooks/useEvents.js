"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchEvents = createThrottle(async () => {
  const { data } = await apiClient.get("/events");

  const fetchedEvents = (data.results || []).map((event) => ({
    id: event.id,
    title: event.title,
    registrationOpen: true,
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    startTime: "09:00",
    endTime: "17:00",
    organizer: "Code Collective",
    availableSeats: 40,
    registrationFeeBMC: 5,
    registrationFee: 0,
    location: "Innovation Hub, Kathmandu",
    category: "Bootcamp",
    tags: ["web", "beginner", "frontend"],
    registrationFormUrl: event.registration_link,
    image: event.image,
    description: event.description,
    mentors: event.mentors,
    status: event.status,
    created_at: event.created_at,
    updated_at: event.updated_at,
    slug: event.slug,
  }));

  return {
    count: data.count,
    data: fetchedEvents,
  };
});

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
};