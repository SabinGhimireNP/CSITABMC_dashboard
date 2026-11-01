"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

// Alumni are paginated in the browser, so the full list is fetched once.
const fetchAlumni = createThrottle(async () => {
  const { data } = await apiClient.get("/alumni/", { params: { all: true, _: Date.now() } });

  const rawResults = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
  const fetchedAlumni = rawResults.map((alumni) => ({
    id: alumni.id || "1",
    memberId: alumni.member?.id || alumni.id,
    fullName: alumni.member?.name || "",
    email: alumni.member?.email || "",
    phoneNumber: alumni.member?.phone_number || "",
    facebookLink: alumni.member?.fb_link || "",
    linkedinLink: alumni.member?.linkedin_link || "",
    githubLink: alumni.member?.github_link || "",
    slug: alumni.member?.slug || "",
    image: alumni.member?.image || null,
    graduationYear: alumni.graduation_year || null,
    tenureIds: Array.isArray(alumni.tenure_ids)
      ? alumni.tenure_ids.map((id) => Number(id))
      : Array.isArray(alumni.tenureIds)
        ? alumni.tenureIds.map((id) => Number(id))
        : [],
    bio: alumni.bio || "",
    status: "active",
  }));

  return { data: fetchedAlumni };
});

export const useAlumni = () => {
  return useQuery({
    queryKey: ["alumni"],
    queryFn: () => fetchAlumni(),
  });
};

const createAlumni = createThrottle(async (payload) => {
  const { data } = await apiClient.post("/alumni/", payload);
  return data;
});

const updateAlumni = createThrottle(async ({ id, payload }) => {
  const { data } = await apiClient.put(`/alumni/${id}/`, payload);
  return data;
});

const deleteAlumni = createThrottle(async (id) => {
  await apiClient.delete(`/alumni/${id}/`);
  return id;
});

/**
 * Alumni CRUD mutations backed by the hosted Django API.
 *
 * The Alumni serializer expects:
 *   member_id      (PK of an existing Member)  — required
 *   tenure_ids     (list of Tenure PKs)        — optional
 *   graduation_year                            — optional
 *   bio                                        — optional
 */
export const useCreateAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlumni,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["alumni"], refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: ["alumni"], type: "active" });
    },
  });
};

export const useUpdateAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAlumni,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["alumni"], refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: ["alumni"], type: "active" });
    },
  });
};

export const useDeleteAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlumni,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["alumni"], refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: ["alumni"], type: "active" });
    },
  });
};
