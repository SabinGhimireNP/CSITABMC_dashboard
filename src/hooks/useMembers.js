"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";

const fetchTenures = async () => {
  const { data } = await apiClient.get("/tenures");

  // Primary: assumes backend returns { count, next, previous, results }
  const results = data.results || data;
  const count = data.count ?? results.length;

  const fetchedTenures = results.map((tenure) => ({
    id: tenure.id,
    Members: (tenure.memberships || []).map((membership) => ({
      id: membership.member.id,
      memberId: membership.member.id,
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
  }));

  return {
    count,
    data: fetchedTenures,
  };
};

export const useTenures = () => {
  return useQuery({
    queryKey: ["tenures"],
    queryFn: fetchTenures,
  });
};

const fetchMembersList = async () => {
  const { data } = await apiClient.get("/members");
  const results = data.results || data;
  return results.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    image: member.image,
    slug: member.slug,
  }));
};

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
