"use client";

import { GuestGuard } from "@/components/common/GuestGuard";

export default function AuthLayout({ children }) {
  return <GuestGuard>{children}</GuestGuard>;
}