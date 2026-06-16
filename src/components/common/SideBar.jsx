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
} from "lucide-react";

import { cn } from "@/lib/utils";

const sidebarSections = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Contents",
    items: [
      {
        title: "Certificates",
        url: "/certificates",
        icon: Award,
      },
      {
        title: "Events",
        url: "/events",
        icon: Calendars,
      },
      {
        title: "Mentors",
        url: "/mentors",
        icon: User,
      },
      {
        title: "Notices",
        url: "/notices",
        icon: FileText,
      },
      {
        title: "Admins",
        url: "/admins",
        icon: ShieldCheck,
      },
      {
        title: "Members",
        url: "/members",
        icon: Users,
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
                          ? "bg-brand-primary text-white border-l-4 border-brand-tertiary shadow-md hover:bg-brand-primary/90! hover:text-white!"
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