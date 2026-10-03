"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const fetchTenures = createThrottle(async () => {
  const { data } = await apiClient.get("/tenures/");

  // Primary: assumes backend returns { count, next, previous, results }
  const results = data.results || data;
  const count = data.count ?? results.length;

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
      tags: ["Leadership", "Event Management"],
      description: "Club member.",
      image: membership.member.image,
      status: "active",
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
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
      queryClient.invalidateQueries(["tenures"]);
    }
  });
};

const fetchMembersList = createThrottle(async () => {
  const { data } = await apiClient.get("/members/");
  const results = data.results || data;
  return results.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    image: member.image,
    slug: member.slug,
  }));
});

/**
 * Fetches the flat list of all Members (used by the Alumni form's member
 * selector, since the Alumni serializer expects an existing member_id).
 */
export const useMembersList = () => {
  return useQuery({
    queryKey: ["members-list"],
    queryFn: fetchMembersList,
  });
};
