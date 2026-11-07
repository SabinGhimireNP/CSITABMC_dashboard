"use client";

import React, { use } from "react";
import { MentorsPageContent } from "../../_components/MentorsPageContent";

export default function EditMentorPage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <MentorsPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.id,
      }}
    />
  );
}
