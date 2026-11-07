"use client";

import React, { use } from "react";
import { PastPapersPageContent } from "../../_components/PastPapersPageContent";

export default function EditPastPaperPage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <PastPapersPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.id,
      }}
    />
  );
}
