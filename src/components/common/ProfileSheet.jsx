// ProfileSheet.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogOut, Settings, ShieldCheck, User } from "lucide-react";

const ProfileSheet = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const user = {
    name: "Rakesh Kumar",
    email: "test@example.com",
    type: "Super Admin",
  };

  const typeLabel = user?.type;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
                {user?.name || "User"}
              </p>
              <p className="text-xs text-brand-text truncate">
                {user?.email || "No email available"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-brand-text mt-0.5 font-black">
                {typeLabel}
              </div>
            </div>
          </div>

          {/* button for profile sheets if needed to add settings and other things here in future */}
          {/* <div className="p-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-secondary hover:bg-brand-primary/10 hover:text-brand-primary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {user?.type === "company" ? (
                  <>
                    <Building2 className="size-4" />
                    <span>Company Details</span>
                  </>
                ) : (
                  <>
                    <User className="size-4" />
                    <span>Personal Details</span>
                  </>
                )}
              </div>
            </button>

            <button
              onClick={() => {
                setOpen(false);
                router.push("/settings");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-secondary hover:bg-brand-primary/10 hover:text-brand-primary transition-colors cursor-pointer"
            >
              <Settings className="size-4" /> Settings
            </button>
          </div> */}

          <div className="p-1 border-t border-brand-primary/10">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSheet;
