import axios from "axios";

export const Tenure = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/tenures`);
    const data = response.data;

    const fetchedTenures = data.map((tenure) => {
      return {
        id: tenure.id,
        Members: tenure.members.map((member) => {
          return {
            id: member.id,
            tenureName: member.tenure,
            memberId: member.id,
            fullName: member.name,
            post: member.role,
            email: member.email,
            facebookLink: member.fb_link,
            linkedinLink: member.linkedin_link,
            githubLink: member.github_link,
            tags: ["Leadership", "Event Management"],
            description: "Club president and founding member.",
            image: member.image,
            status: "active",
            createdAt: member.created_at,
          };
        }),
        name: tenure.name,
        startDate: tenure.start_date,
        endDate: tenure.end_date,
        slug: tenure.slug,
      };
    });

    return {
      count: fetchedTenures.length,
      data: fetchedTenures,
    };
  } catch (error) {
    console.error("Error fetching Tenure detatils", error);
  }
};
