"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchTenures = createThrottle(async () => {
  const { data } = await apiClient.get("/tenures/", { params: { _: Date.now() } });

  // Primary: assumes backend returns { count, next, previous, results }
  const results = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
  const count = data?.count ?? results.length;

  const fetchedTenures = results.map((tenure) => ({
    id: tenure.id,
    Members: (tenure.memberships || []).map((membership) => ({
      id: membership.member.id,
      memberId: membership.member.id,
      membershipId: membership.id,
      slug: membership.member.slug,
      fullName: membership.member.name,
      post: membership.designation,
      roleType: membership.role_type,
      order: membership.order,
      email: membership.member.email,
      facebookLink: membership.member.fb_link,
      linkedinLink: membership.member.linkedin_link,
      githubLink: membership.member.github_link,
      tags: membership.member.skills || [],
      skills: membership.member.skills || [],
      description: membership.member.description || "",
      image: membership.member.image,
      status: membership.status || membership.member.status || "published",
      createdAt: membership.member.created_at,
    })),
    name: tenure.name,
    startDate: tenure.start_date,
    endDate: tenure.end_date,
    slug: tenure.slug,
    signature: tenure.signature,
  }));

  return {
    count,
    data: fetchedTenures,
  };
});

export const useTenures = () => {
  return useQuery({
    queryKey: ["tenures"],
    queryFn: fetchTenures,
  });
};

export const useCreateTenure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async (data) => {
      const response = await apiClient.post("/tenures/", data);
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
    }
  });
};

export const useUpdateTenure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async ({ slug, data }) => {
      const response = await apiClient.put(`/tenures/${slug}/`, data);
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
    }
  });
};

export const useDeleteTenure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async (slug) => {
      await apiClient.delete(`/tenures/${slug}/`);
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
    }
  });
};

export const useDuplicateTenure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async ({ targetSlug, sourceSlug }) => {
      const response = await apiClient.post(`/clone-members/${targetSlug}/`, {
        source_tenure_slug: sourceSlug
      });
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
    }
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async (formData) => {
      const response = await apiClient.post("/members/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
    }
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async ({ slug, formData }) => {
      const response = await apiClient.put(`/members/${slug}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
    }
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async (slug) => {
      await apiClient.delete(`/members/${slug}/`);
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
    }
  });
};

export const useCreateMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async (data) => {
      const response = await apiClient.post("/memberships/", data);
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
    }
  });
};

export const useUpdateMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async ({ id, data }) => {
      const response = await apiClient.put(`/memberships/${id}/`, data);
      return response.data;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
    }
  });
};

export const useDeleteMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThrottle(async (id) => {
      await apiClient.delete(`/memberships/${id}/`);
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenures"] });
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
    }
  });
};

const fetchMembersList = createThrottle(async () => {
  const { data } = await apiClient.get("/members/", { params: { _: Date.now() } });
  const results = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
  return results.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    image: member.image,
    slug: member.slug,
    facebookLink: member.fb_link || "",
    linkedinLink: member.linkedin_link || "",
    githubLink: member.github_link || "",
    fb_link: member.fb_link || "",
    linkedin_link: member.linkedin_link || "",
    github_link: member.github_link || "",
    description: member.description || "",
    skills: Array.isArray(member.skills) ? member.skills : [],
    status: member.status || "published",
    createdAt: member.created_at || "",
  }));
});

/**
 * Fetches the flat list of all Members (used by master /members page,
 * tenure assignment selector, and alumni selector).
 */
export const useMembersList = () => {
  return useQuery({
    queryKey: ["members-list"],
    queryFn: fetchMembersList,
  });
};

export const useMembers = useMembersList;
