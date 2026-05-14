"use client";

import { Separator } from "@asym/ui/components/shadcn/separator";
import { memo } from "react";

import { GlobalSearch } from "./GlobalSearch";
import { MobileSidebar } from "./MobileSidebar";
import { NotificationsMenu } from "./NotificationsMenu";
import { ProfileMenu } from "./ProfileMenu";
import { TenantSwitcher } from "./TenantSwitcher";

export const TopBar = memo(function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200/60 bg-white/80 px-6 backdrop-blur-md">
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
