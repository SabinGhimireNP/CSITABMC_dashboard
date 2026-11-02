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
    mutationFn: createThrottle(async ({ id, membershipId, data }) => {
      const targetId = id || membershipId;
      if (!targetId) {
        throw new Error("Membership ID is required for update.");
      }
      const response = await apiClient.put(`/memberships/${targetId}/`, data);
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

const fetchMembersList = createThrottle(async (queryParams = {}) => {
  const { search = "", status = "", ordering = "", page = 1, pageSize = 10, all = false } = queryParams;

  const params = {
    _: Date.now(),
  };
  if (all) {
    params.all = "true";
  } else {
    params.page = page;
    params.page_size = pageSize;
  }
  if (search && search.trim()) params.search = search.trim();
  if (status) params.status = status;
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/members/", { params });
  const isPaginated = !Array.isArray(data) && Array.isArray(data?.results);
  const results = isPaginated ? data.results : Array.isArray(data) ? data : [];

  const fetchedMembers = results.map((member) => ({
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

  const count = isPaginated ? (data.count || 0) : fetchedMembers.length;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    count,
    totalPages,
    data: fetchedMembers,
  };
});

/**
 * Server-side paginated hook for Organization Members.
 * Returns { count, totalPages, data: [...] }
 */
export const useMembers = (queryParams = {}) => {
  const { search = "", status = "", ordering = "", page = 1, pageSize = 10, all = false } = queryParams;

  return useQuery({
    queryKey: ["members", search, status, ordering, page, pageSize, all],
    queryFn: () => fetchMembersList({ search, status, ordering, page, pageSize, all }),
  });
};

/**
 * Fetches the flat list of all Members (used by selectors and legacy consumers).
 */
export const useMembersList = (queryParams = {}) => {
  const params = { all: true, ...queryParams };
  const query = useMembers(params);
  const memberList = Array.isArray(query.data) ? query.data : (query.data?.data || []);
  return {
    ...query,
    data: memberList,
  };
};

export const mapMemberFromBackend = (member) => ({
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
});

export const useMemberDetail = (slugOrId) => {
  return useQuery({
    queryKey: ["member", slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const { data } = await apiClient.get(`/members/${slugOrId}/`);
      return mapMemberFromBackend(data);
    },
    enabled: Boolean(slugOrId),
    retry: false,
  });
};

export const mapTenureFromBackend = (tenure) => ({
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
});

export const useTenureDetail = (slugOrId) => {
  return useQuery({
    queryKey: ["tenure", slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const { data } = await apiClient.get(`/tenures/${slugOrId}/`);
      return mapTenureFromBackend(data);
    },
    enabled: Boolean(slugOrId),
    retry: false,
  });
};
