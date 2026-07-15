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