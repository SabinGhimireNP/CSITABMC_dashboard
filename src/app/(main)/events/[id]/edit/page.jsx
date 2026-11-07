"use client";

import React, { use } from "react";
import { EventsPageContent } from "../../_components/EventsPageContent";

export default function EditEventPage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  return (
    <EventsPageContent
      initialModalMode={{
        isOpen: true,
        action: "edit",
        id: unwrappedParams?.id,
      }}
    />
  );
}
