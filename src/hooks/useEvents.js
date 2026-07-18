"use client";

import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_URL;

const fetchEvents = async () => {
  const response = await fetch(`${API_URL}/events`);
  if (!response.ok) throw new Error("Failed to fetch events");
  const data = await response.json();

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
};

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
};