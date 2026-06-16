// Header.jsx
import React from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Globe } from "lucide-react";

import ProfileSheet from "./ProfileSheet";
// import { useAuthStore } from "@/store/useAuthstore";

const Header = () => {
  // const userName = useAuthStore((state) => state.user)?.name;
  const userName = "Rakesh Kumar";

  return (
    <header className="h-16 flex items-center sticky top-0 justify-between px-4 md:px-6 border-b bg-background z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Go to Home"
        >
          <Globe size={20} />
        </Link>

        <ProfileSheet />
      </div>
    </header>
  );
};

export default Header;