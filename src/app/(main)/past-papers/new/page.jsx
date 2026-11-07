"use client";

import { PastPapersPageContent } from "../_components/PastPapersPageContent";

export default function NewPastPaperPage() {
  return <PastPapersPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
