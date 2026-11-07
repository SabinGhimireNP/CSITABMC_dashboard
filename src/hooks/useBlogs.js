"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { createThrottle } from "@/lib/throttle";

const mapBlogListItem = (blog) => ({
  id: blog.id,
  // Display ID such as ART-0042, derived by the backend
  reference: blog.reference,
  title: blog.title,
  // Credited Organization Member: { id, name, slug, image } or null
  author: blog.author || null,
  slug: blog.slug,
  excerpt: blog.excerpt,
  status: blog.status,
  featuredImageUrl: blog.featured_image_url || "",
  featuredImageAlt: blog.featured_image_alt || "",
  publishedAt: blog.published_at,
  createdAt: blog.created_at,
  updatedAt: blog.updated_at,
});

const mapBlogDetail = (data) => ({
  ...mapBlogListItem(data),
  content: data.content || "",
  contentImages: (data.content_images || []).map((img) => ({
    url: img.url,
    publicId: img.public_id || "",
    alt: img.alt || "",
  })),
  featuredImagePublicId: data.featured_image_public_id || "",
  // Automatically derived on the backend (title / excerpt / featured image)
  seo: data.seo || null,
});

/**
 * Converts the form state (camelCase) into the API payload (snake_case JSON).
 * The slug and SEO values are derived by the backend and never sent.
 */
export const toBlogPayload = (form) => ({
  title: form.title.trim(),
  author_id: form.authorId || null,
  excerpt: form.excerpt.trim(),
  content: form.content,
  content_images: (form.contentImages || []).map((img) => ({
    url: img.url,
    public_id: img.publicId || "",
    alt: img.alt || "",
  })),
  featured_image_url: form.featuredImageUrl.trim() || null,
  featured_image_public_id: form.featuredImagePublicId || "",
  featured_image_alt: form.featuredImageAlt.trim(),
  status: form.status,
});

const fetchBlogs = createThrottle(async (queryParams = {}) => {
  const {
    search = "",
    status = "",
    ordering = "",
    page = 1,
    pageSize = 10,
  } = queryParams;

  const params = {
    _: Date.now(),
    page,
    page_size: pageSize,
  };
  if (search.trim()) params.search = search.trim();
  if (status) params.status = status;
  if (ordering) params.ordering = ordering;

  const { data } = await apiClient.get("/blogs/", { params, signal: queryParams.signal });

  const count = data.count || 0;
  return {
    count,
    totalPages: Math.ceil(count / pageSize) || 1,
    data: (data.results || []).map(mapBlogListItem),
  };
});

export const useBlogs = (queryParams = {}) => {
  const {
    search = "",
    status = "",
    ordering = "",
    page = 1,
    pageSize = 10,
  } = queryParams;

  return useQuery({
    queryKey: ["blogs", search, status, ordering, page, pageSize],
    queryFn: ({ signal }) => fetchBlogs({ search, status, ordering, page, pageSize, signal }),
    placeholderData: (previousData) => previousData,
  });
};

export const useBlog = (id) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/blogs/${id}/`);
      return mapBlogDetail(data);
    },
    enabled: Boolean(id),
    // Always load the latest content when opening the editor
    staleTime: 0,
    gcTime: 0,
  });
};

const throttledCreateBlog = createThrottle(async (payload) => {
  const { data } = await apiClient.post("/blogs/", payload);
  return mapBlogDetail(data);
});

const throttledUpdateBlog = createThrottle(async ({ id, payload }) => {
  const { data } = await apiClient.put(`/blogs/${id}/`, payload);
  return mapBlogDetail(data);
});

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => throttledCreateBlog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => throttledUpdateBlog({ id, payload }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", variables.id] });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/blogs/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

/**
 * Uploads an image through the backend media storage (Cloudinary in production).
 * Used for both article content images and the featured image.
 */
export const uploadBlogImage = async (file, { onProgress } = {}) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post("/blogs/upload-image/", formData, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return { url: data.url, publicId: data.public_id || "" };
};

/**
 * Permanently deletes an uploaded image from storage after reference checks.
 */
export const deleteBlogImage = async ({ url, publicId, excludeBlogId } = {}) => {
  const { data } = await apiClient.post("/blogs/delete-image/", {
    url,
    public_id: publicId,
    exclude_blog_id: excludeBlogId,
  });
  return data;
};
