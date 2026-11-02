"use client";

import { MembersPageContent } from "../_components/MembersPageContent";

export default function NewTenurePage() {
  return <MembersPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
