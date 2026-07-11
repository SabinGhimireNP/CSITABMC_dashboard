import axios from "axios";

export const Certificates = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL}/certificates`,
    );
    const data = response.data;

    const FetchedCertificates = data.map((certificate) => {
      return {
        id: certificate.certificate_id,
        event: certificate.event,
        fullName: certificate.full_name,
        createdAt: certificate.issued_at,
        isProjectComplete: false,
      };
    });

    return {
      // count: data.count,
      data: FetchedCertificates,
    };
  } catch (error) {
    console.error("Error fetching certificates:", error);
    throw error;
  }
};
