
import axios from "axios";

export const Notices = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL}/notices`,
    );

    const data = response.data;

    const fetchedNotices = data.results.map((notice) => {

      return {
        id: notice.id,
        title: notice.title,
        image: notice.image,
        category: notice.category,
        status: notice.status,
        description: notice.description,
        createdAt: notice.updated_at,
      };
    });

    return {
      count: data.count,
      data: fetchedNotices,
    };
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};
