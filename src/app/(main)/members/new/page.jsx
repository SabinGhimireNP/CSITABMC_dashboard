"use client";

import { MembersPageContent } from "../_components/MembersPageContent";

export default function NewMemberPage() {
  return <MembersPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
