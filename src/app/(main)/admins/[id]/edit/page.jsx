"use client";

import React, { use } from "react";
import { AdminsPageContent } from "../../_components/AdminsPageContent";

export default function EditAdminPage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <AdminsPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.id,
      }}
    />
  );
}
