"use client";

import React, { use } from "react";
import { MembersPageContent } from "../../_components/MembersPageContent";

export default function EditTenurePage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <MembersPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.slug,
      }}
    />
  );
}
