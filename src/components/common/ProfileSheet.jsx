"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, LogOut, User } from "lucide-react";
import { useUser, useLogout } from "@/hooks/useAuth";
import { toast } from "sonner";

const ProfileSheet = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: user } = useUser();
  const logout = useLogout();

  const typeLabel = user?.type || user?.username || "User";

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="h-10 w-10 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold cursor-pointer shadow-sm hover:brightness-110 transition-all border-2 border-brand-primary/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary/50"
      >
        <img
          src="/logo.jpg"
          alt=""
          className="size-full rounded-full object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-brand-primary/15 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-brand-primary/10 flex items-center gap-3 bg-brand-primary/5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white font-bold">
              <img
                src="/logo.jpg"
                alt=""
                className="size-full rounded-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-brand-secondary">
                {user?.username || user?.name || "User"}
              </p>
              <p className="text-xs text-brand-text truncate">
                {user?.email || "No email available"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-brand-text mt-0.5 font-black">
                {typeLabel}
              </div>
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/settings");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary transition-colors cursor-pointer"
            >
              <Edit className="size-4" /> Change Password
            </button>
          </div>

          <div className="p-1 border-t border-brand-primary/10">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSheet;