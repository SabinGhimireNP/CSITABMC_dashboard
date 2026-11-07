"use client";

import { BlogsPageContent } from "../_components/BlogsPageContent";

export default function NewBlogPage() {
  return <BlogsPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
