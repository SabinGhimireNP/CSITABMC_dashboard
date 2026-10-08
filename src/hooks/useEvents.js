"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const EVENT_CATEGORIES = ["Workshop", "Webinar", "Hackathon", "Bootcamp", "Networking", "Conference"];

const mapCategoryFromBackend = (cat) => {
  if (!cat) return "Other";
  const match = EVENT_CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
  if (match) return match;
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const parseDateTime = (dtStr) => {
  if (!dtStr) return { date: "", time: "" };
  if (typeof dtStr !== "string") return { date: "", time: "" };
  const parts = dtStr.split("T");
  const date = parts[0] || "";
  let time = "";
  if (parts[1]) {
    time = parts[1].substring(0, 5);
  }
  return { date, time };
};

const fetchEvents = createThrottle(async (queryParams = {}) => {
  const { search = "", status = "", category = "", date = "", id = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search && search.trim()) params.search = search.trim();
  if (status) params.status = status;
  if (category) params.category = category;
  if (date) params.date = date;
  if (id) params.id = id;
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/events/", { params });

  const rawResults = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
  const fetchedEvents = rawResults.map((event) => {
    const startDt = parseDateTime(event.date || event.start_time);
    const endDt = parseDateTime(event.end_time || event.date);

    const mentorsList = Array.isArray(event.mentors)
      ? event.mentors.map((m) => (typeof m === "object" ? m.id : m))
      : [];

    return {
      id: event.id,
      title: event.title || "",
      registrationOpen: true,
      startDate: startDt.date,
      endDate: endDt.date,
      startTime: startDt.time,
      endTime: endDt.time,
      organizer: event.organiser || "",
      availableSeats: event.available_seats || 0,
      registrationFeeBMC: Number(event.registration_fee_bmc) || 0,
      registrationFee: Number(event.registration_fee_non_bmc) || 0,
      location: event.location || "",
      category: mapCategoryFromBackend(event.category),
      tags: event.tags ? [event.tags] : [],
      registrationFormUrl: event.registration_link || "",
      image: event.image || null,
      description: event.description || "",
      mentors: mentorsList,
      status: event.status || "draft",
      created_at: event.created_at,
      updated_at: event.updated_at,
      slug: event.slug,
    };
  });

  const count = data?.count ?? rawResults.length;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetchedEvents,
  };
});

export const useEvents = (queryParams = {}) => {
  const { search = "", status = "", category = "", date = "", id = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  return useQuery({
    queryKey: ["events", search, status, category, date, id, ordering, page, pageSize],
    queryFn: () => fetchEvents({ search, status, category, date, id, ordering, page, pageSize }),
  });
};

// --- CRUD Mutation Functions ---

const throttledCreateEvent = createThrottle(async (formData) => {
  const { data } = await apiClient.post("/events/", formData);
  return data;
});

const throttledUpdateEvent = createThrottle(async ({ slug, formData }) => {
  const { data } = await apiClient.put(`/events/${slug}/`, formData);
  return data;
});

const throttledDeleteEvent = createThrottle(async (slug) => {
  await apiClient.delete(`/events/${slug}/`);
  return slug;
});

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: throttledCreateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: throttledUpdateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: throttledDeleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
};