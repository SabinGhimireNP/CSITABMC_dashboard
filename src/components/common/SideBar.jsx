// app-sidebar.jsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Calendars,
  ShieldCheck,
  User,
  Users,
  Award,
  FileText,
  CalendarDays,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";

const sidebarSections = [
  {
    label: "Analytics",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Communications",
    items: [
      {
        title: "Notices",
        url: "/notices",
        icon: FileText,
      },
    ],
  },
  {
    label: "Event Engine",
    items: [
      {
        title: "Manage Events",
        url: "/events",
        icon: CalendarDays,
      },
      {
        title: "Event Mentors",
        url: "/mentors",
        icon: UserCheck,
      },
      {
        title: "Certificates",
        url: "/certificates",
        icon: Award,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        title: "Team Members",
        url: "/members",
        icon: Users,
      },
      {
        title: "Admin Access",
        url: "/admins",
        icon: ShieldAlert,
      },
    ],
  },
];

export function SideBar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border bg-sidebar h-screen">
      <SidebarHeader className="px-3 py-4 border-b border-border/50 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-brand-secondary tracking-tight leading-tight uppercase">
            Admin Dashboard
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 overflow-y-auto">
        {sidebarSections.map((section) => (
          <SidebarGroup key={section.label} className="py-2">
            <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-bold text-brand-text uppercase tracking-widest opacity-80">
              {section.label}
            </SidebarGroupLabel>

            <SidebarMenu className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title} className="px-2">
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "group flex items-center px-2.5 py-2 text-sm rounded-md transition-all duration-200",
                        isActive
                          ? "bg-brand-primary text-white shadow-md hover:bg-brand-primary/90! hover:text-white!"
                          : "text-brand-text hover:bg-brand-primary/10! hover:text-brand-secondary!",
                      )}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-2 w-full"
                      >
                        {Icon && (
                          <Icon
                            size={16}
                            className={cn(
                              isActive ? "text-white" : "text-brand-text",
                            )}
                          />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}