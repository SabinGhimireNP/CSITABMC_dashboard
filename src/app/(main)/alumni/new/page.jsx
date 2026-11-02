"use client";

import { AlumniPageContent } from "../_components/AlumniPageContent";

export default function NewAlumniPage() {
  return <AlumniPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
