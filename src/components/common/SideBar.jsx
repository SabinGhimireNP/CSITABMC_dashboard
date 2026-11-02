// SideBar.jsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Calendar,
  Award,
  FileText,
  Newspaper,
  Megaphone,
  Bell,
  Users,
  UserCheck,
  GraduationCap,
  History,
  Shield,
  ClipboardList,
} from "lucide-react";

import { cn } from "@/lib/utils";

const sidebarSections = [
  {
    label: "MAIN",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
        permission: "*",
      },
    ],
  },
  {
    label: "EVENTS",
    items: [
      {
        title: "Manage Events",
        url: "/events",
        icon: Calendar,
        permission: "events.view",
      },
      {
        title: "Certificates",
        url: "/certificates",
        icon: Award,
        permission: "certificates.view",
      },
    ],
  },
  {
    label: "CONTENT & ACADEMICS",
    items: [
      {
        title: "Past Papers",
        url: "/past-papers",
        icon: FileText,
        permission: "papers.view",
      },
      {
        title: "Blogs",
        url: "/blogs",
        icon: Newspaper,
        permission: "blogs.view",
      },
      {
        title: "Notices",
        url: "/notices",
        icon: FileText,
        permission: "notices.view",
      },
    ],
  },
  {
    label: "PEOPLE",
    items: [
      {
        title: "Team Members",
        url: "/members",
        icon: Users,
        permission: "members.view",
      },
      {
        title: "Mentors",
        url: "/mentors",
        icon: UserCheck,
        permission: "mentors.view",
      },
      {
        title: "Alumni",
        url: "/alumni",
        icon: GraduationCap,
        permission: "alumni.view",
      },
      {
        title: "Tenures",
        url: "/tenure",
        icon: History,
        permission: "tenures.view",
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        permission: "notifications.view",
      },
      {
        title: "Admin Access",
        url: "/admins",
        icon: Shield,
        permission: "admin_access.view",
      },
      {
        title: "Activity Logs",
        url: "/activity-logs",
        icon: ClipboardList,
        permission: "activity_logs.view",
      },
    ],
  },
];

export function SideBar() {
  const pathname = usePathname();
  const { can } = usePermission();
  const { isMobile, setOpenMobile } = useSidebar();

  // Close the mobile drawer after navigating so it doesn't cover the new page.
  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border bg-sidebar h-dvh">
      <SidebarHeader className="px-3 py-4 border-b border-border/50 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-brand-secondary tracking-tight leading-tight uppercase">
            Admin Dashboard
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 overflow-y-auto">
        {sidebarSections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.permission === "*" ? true : can(item.permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={section.label} className="py-2">
              <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-bold text-brand-text uppercase tracking-widest opacity-80">
                {section.label}
              </SidebarGroupLabel>

              <SidebarMenu className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.url || pathname.startsWith(item.url + "/");
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.title} className="px-2">
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "group flex items-center px-2.5 py-2 text-sm rounded-md transition-all duration-200",
                          isActive
                            ? "bg-brand-primary text-white shadow-md hover:bg-brand-primary/90! hover:text-white!"
                            : "text-brand-text hover:bg-brand-primary/10! hover:text-brand-secondary!"
                        )}
                      >
                        <Link
                          href={item.url}
                          onClick={handleNavigate}
                          aria-current={isActive ? "page" : undefined}
                          className="flex items-center gap-2 w-full min-w-0"
                        >
                          {Icon && (
                            <Icon
                              size={16}
                              className={cn(
                                "shrink-0",
                                isActive ? "text-white" : "text-brand-text"
                              )}
                            />
                          )}
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
