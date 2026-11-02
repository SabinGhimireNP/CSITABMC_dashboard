"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useUser, useLogout } from "@/hooks/useAuth";

function getRoleBadgeColor(role) {
  switch (role) {
    case "superadmin":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "admin":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "cms_user":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "operations":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "papers":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "notice":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "blog":
      return "bg-teal-50 text-teal-700 border-teal-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

const ProfileSheet = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const user = useUser();
  const logout = useLogout();

  const roleName = user?.user_role || user?.role || "cms_user";
  const displayName = user?.name || user?.username || "Admin User";
  const displayEmail = user?.email || "admin@csitabmc.org";

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button with Uniform Default Avatar */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="User Profile Menu"
        className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:brightness-105 transition-all border-2 border-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 overflow-hidden"
      >
        <img
          src="/logo.jpg"
          alt=""
          className="size-full rounded-full object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border/80 dark:border-white/12 bg-card dark:bg-[#1a1d24] text-foreground shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Profile Header */}
          <div className="px-5 py-4 border-b border-border/80 dark:border-white/10 flex items-center gap-3.5 bg-muted/40 dark:bg-[#16181e]">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-inner border border-border dark:border-white/10">
              <img
                src="/logo.jpg"
                alt=""
                className="size-full rounded-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-foreground leading-tight">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5" title={displayEmail}>
                {displayEmail}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(
                    roleName
                  )}`}
                >
                  {roleName}
                </span>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="size-4 text-rose-500 dark:text-rose-400" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSheet;