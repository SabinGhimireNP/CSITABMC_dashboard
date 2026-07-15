import axios from "axios";

export const Events = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/events`);

    const data = response.data;


    const fetchedEvents = data.results.map((event) => {
      return {
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
      };
    });

    return{
      count: data.count,
      data: fetchedEvents
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const fetchEventTitles = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/events`);
    const data = response.data;
    const results = data.results || [];

    // Map down to just an array of title strings
    const titles = results.map((event) => event.title);

    return {
      count: data.count || titles.length,
      data: titles, // This will be an array of strings: ["Web Bootcamp", "React Workshop", ...]
    };
  } catch (error) {
    console.error("Failed to fetch event titles:", error);
    throw error;
  }
};