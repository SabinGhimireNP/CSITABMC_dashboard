"use client";

import { NoticesPageContent } from "../_components/NoticesPageContent";

export default function NewNoticePage() {
  return <NoticesPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
