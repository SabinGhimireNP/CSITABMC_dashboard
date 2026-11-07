"use client";

import { EventsPageContent } from "../_components/EventsPageContent";

export default function NewEventPage() {
  return <EventsPageContent initialModalMode={{ isOpen: true, action: "create" }} />;
}
