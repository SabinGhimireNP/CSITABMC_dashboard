"use client";

import { MentorsPageContent } from "../_components/MentorsPageContent";

export default function NewMentorPage() {
  return <MentorsPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
