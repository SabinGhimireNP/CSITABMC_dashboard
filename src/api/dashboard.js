import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_URL;
export const getDashboardStats = async () => {
  try {
    const [noticesRes, eventsRes, mentorsRes, certificatesRes] =
      await Promise.allSettled([
        axios.get(`${API_URL}/notices`),
        axios.get(`${API_URL}/events`),
        axios.get(`${API_URL}/mentors`),
        axios.get(`${API_URL}/certificates`),
      ]);

      console.log(noticesRes, eventsRes, mentorsRes, certificatesRes);

    const notices =
      noticesRes.status === "fulfilled"
        ? noticesRes.value.data
        : { count: 0, results: [] };
    const events =
      eventsRes.status === "fulfilled"
        ? eventsRes.value.data
        : { count: 0, results: [] };
    const mentors =
      mentorsRes.status === "fulfilled" ? mentorsRes.value.data : [];
    const certificates =
      certificatesRes.status === "fulfilled" ? certificatesRes.value.data : [];

    const publishedNotices = (notices.results || []).filter(
      (n) => n.status === "published" || n.status === "Published",
    );
    const openEvents = (events.results || []).filter(
      (e) => e.status === "open" || e.status === "Open" || e.registration_link,
    );
    const completedCertificates = Array.isArray(certificates)
      ? certificates.filter((c) => c.is_project_complete || c.isProjectComplete)
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
};

/**
 * Fetch recent notices (latest 5 published).
 */
export const getRecentNotices = async () => {
  try {
    const response = await axios.get(`${API_URL}/notices`);
    const data = response.data;
    const results = data.results || [];

    const published = results.filter(
      (n) => n.status === "published" || n.status === "Published",
    );

    return published
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) -
          new Date(a.updated_at || a.created_at),
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
};

export const getRecentEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events`);
    const data = response.data;
    const results = data.results || [];

    return results
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) -
          new Date(a.updated_at || a.created_at),
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
};

export const getRecentCertificates = async () => {
  try {
    const response = await axios.get(`${API_URL}/certificates`);
    const data = response.data;
    const certificates = Array.isArray(data) ? data : data.results || [];

    return certificates
      .sort(
        (a, b) =>
          new Date(b.issued_at || b.created_at) -
          new Date(a.issued_at || a.created_at),
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
};
