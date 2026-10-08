"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchAlumni = createThrottle(async (queryParams = {}) => {
  const { search = "", id = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search && search.trim()) params.search = search.trim();
  if (id) params.id = id;
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/alumni/", { params });

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

  const count = data?.count ?? rawResults.length;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetchedAlumni,
  };
});

export const useAlumni = (queryParams = {}) => {
  const { search = "", id = "", ordering = "", page = 1, pageSize = 5 } = queryParams;

  return useQuery({
    queryKey: ["alumni", search, id, ordering, page, pageSize],
    queryFn: () => fetchAlumni({ search, id, ordering, page, pageSize }),
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
