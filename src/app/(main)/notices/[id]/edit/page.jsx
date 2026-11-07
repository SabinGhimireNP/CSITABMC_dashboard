"use client";

import React, { use } from "react";
import { NoticesPageContent } from "../../_components/NoticesPageContent";

export default function EditNoticePage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <NoticesPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.id,
      }}
    />
  );
}
