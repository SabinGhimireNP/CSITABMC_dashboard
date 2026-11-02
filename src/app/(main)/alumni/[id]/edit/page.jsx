"use client";

import React, { use } from "react";
import { AlumniPageContent } from "../../_components/AlumniPageContent";

export default function EditAlumniPage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <AlumniPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.id,
      }}
    />
  );
}
