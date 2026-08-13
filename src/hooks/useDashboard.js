"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const getDashboardStats = createThrottle(async () => {
  try {
    const [noticesRes, eventsRes, mentorsRes, certificatesRes] =
      await Promise.allSettled([
        // Cache-busting param avoids the backend's 5-minute GET cache.
        apiClient.get("/notices", { params: { _: Date.now() } }),
        apiClient.get("/events"),
        apiClient.get("/mentors"),
        apiClient.get("/certificates"),
      ]);

    const parseResult = (res, defaultValue) => {
      if (res.status === "fulfilled") {
        return res.value.data;
      }
      return defaultValue;
    };

    const notices = await parseResult(noticesRes, { count: 0, results: [] });
    const events = await parseResult(eventsRes, { count: 0, results: [] });
    const mentors = await parseResult(mentorsRes, []);
    const certificates = await parseResult(certificatesRes, []);

    const publishedNotices = (notices.results || []).filter(
      (n) => n.status === "published" || n.status === "Published"
    );
    const openEvents = (events.results || []).filter(
      (e) =>
        e.status === "open" || e.status === "Open" || e.registration_link
    );
    const completedCertificates = Array.isArray(certificates)
      ? certificates.filter(
          (c) => c.is_project_complete || c.isProjectComplete
        )
      : [];

    return {
      publishedNoticesCount: publishedNotices.length,
      openEventsCount: openEvents.length,
      totalMentorsCount: Array.isArray(mentors)
        ? mentors.length
        : mentors.count || 0,
      certificatesIssuedCount: completedCertificates.length,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      publishedNoticesCount: 0,
      openEventsCount: 0,
      totalMentorsCount: 0,
      certificatesIssuedCount: 0,
    };
  }
});

const getRecentNotices = createThrottle(async () => {
  try {
    // Cache-busting param avoids the backend's 5-minute GET cache.
    const { data } = await apiClient.get("/notices", {
      params: { _: Date.now() },
    });
    const results = data.results || [];

    const published = results.filter(
      (n) => n.status === "published" || n.status === "Published"
    );

    return published
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) -
          new Date(a.updated_at || a.created_at)
      )
      .slice(0, 5)
      .map((notice) => ({
        id: notice.id,
        title: notice.title,
        category: notice.category,
        status: notice.status,
        date: notice.updated_at || notice.created_at,
      }));
  } catch (error) {
    console.error("Error fetching recent notices:", error);
    return [];
  }
});

const getRecentEvents = createThrottle(async () => {
  try {
    const { data } = await apiClient.get("/events");
    const results = data.results || [];

    return results
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) -
          new Date(a.updated_at || a.created_at)
      )
      .slice(0, 5)
      .map((event) => ({
        id: event.id,
        title: event.title,
        location: event.location || "TBD",
        registrationOpen: !!(
          event.registration_link || event.status === "open"
        ),
        startDate: event.start_date || event.startDate,
      }));
  } catch (error) {
    console.error("Error fetching recent events:", error);
    return [];
  }
});

const getRecentCertificates = createThrottle(async () => {
  try {
    const { data } = await apiClient.get("/certificates");
    const results = Array.isArray(data) ? data : data.results || [];

    return results
      .sort(
        (a, b) =>
          new Date(b.issued_at || b.created_at) -
          new Date(a.issued_at || a.created_at)
      )
      .slice(0, 5)
      .map((cert) => ({
        id: cert.certificate_id || cert.id,
        fullName: cert.full_name || cert.fullName,
        createdAt: cert.issued_at || cert.created_at,
        isProjectComplete:
          cert.is_project_complete || cert.isProjectComplete || false,
      }));
  } catch (error) {
    console.error("Error fetching recent certificates:", error);
    return [];
  }
});

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
  });
};

export const useRecentNotices = () => {
  return useQuery({
    queryKey: ["dashboard", "recentNotices"],
    queryFn: getRecentNotices,
  });
};

export const useRecentEvents = () => {
  return useQuery({
    queryKey: ["dashboard", "recentEvents"],
    queryFn: getRecentEvents,
  });
};

export const useRecentCertificates = () => {
  return useQuery({
    queryKey: ["dashboard", "recentCertificates"],
    queryFn: getRecentCertificates,
  });
};