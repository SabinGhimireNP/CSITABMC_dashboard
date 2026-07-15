import axios from "axios";

export const Mentors = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/mentors`);

    const data = response.data;

    const fetchedMentors = data.map((mentor) => {
      return {
        id: mentor.id,
        fullName: mentor.name,
        socialLink: mentor.linkedin_profile,
        image: mentor.photo,
        events: [1, 4],
        role: mentor.expertise,
        status: "published",
      };
    });
    return {
      count: fetchedMentors.length,
      data: fetchedMentors,
    };
  } catch (error) {
    console.error("Failed to fetched Mentors", error);
  }
};


export const fetchMentorsName = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/mentors`);
    const data = response.data;
    const results = data.results || [];

    // Map down to just an array of title strings
    const names = results.map((mentor) => mentor.name);

    return {
      count: data.count || names.length,
      data: titles, // This will be an array of strings: ["Web Bootcamp", "React Workshop", ...]
    };
  } catch (error) {
    console.error("Failed to fetch mentors name:", error);
    throw error;
  }
};