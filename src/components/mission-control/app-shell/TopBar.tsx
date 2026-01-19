"use client";

import { memo } from "react";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsMenu } from "./NotificationsMenu";
import { ProfileMenu } from "./ProfileMenu";
import { TenantSwitcher } from "./TenantSwitcher";
import { MobileSidebar } from "./MobileSidebar";
import { Separator } from "@/components/ui/separator";

export const TopBar = memo(function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1">
        <TenantSwitcher />
        <Separator orientation="vertical" className="mx-2 h-6" />
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
});
