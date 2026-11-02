"use client";

import React, { use } from "react";
import { BlogsPageContent } from "../../_components/BlogsPageContent";

export default function EditBlogPage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <BlogsPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.id,
      }}
    />
  );
}
