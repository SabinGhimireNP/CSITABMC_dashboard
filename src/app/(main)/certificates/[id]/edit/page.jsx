"use client";

import React, { use } from "react";
import { CertificatesPageContent } from "../../_components/CertificatesPageContent";

export default function EditCertificatePage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <CertificatesPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.id,
      }}
    />
  );
}
