"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchAlumni = createThrottle(async () => {
  const { data } = await apiClient.get("/alumni");

  // Primary: assumes backend returns { count, next, previous, results }
  const results = data.results || data;
  const count = data.count ?? results.length;

  const fetchedAlumni = results
    .map((alumni) => ({
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
    }))
    // Default view is id-based (ascending).
    .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

  return {
    count,
    data: fetchedAlumni,
  };
});

export const useAlumni = () => {
  return useQuery({
    queryKey: ["alumni"],
    queryFn: fetchAlumni,
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
