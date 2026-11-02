"use client";

import { AdminsPageContent } from "../_components/AdminsPageContent";

export default function NewAdminPage() {
  return <AdminsPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
