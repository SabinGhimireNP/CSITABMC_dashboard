"use client";

import { CertificatesPageContent } from "../_components/CertificatesPageContent";

export default function NewCertificatePage() {
  return <CertificatesPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
