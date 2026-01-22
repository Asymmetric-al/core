"use client";

import { memo } from "react";
import { GlobalSearch } from "./app-shell/global-search";
import { NotificationsMenu } from "./notifications-menu";
import { ProfileMenu } from "./profile-menu";
import { TenantSwitcher } from "./tenant-switcher";
import { MobileSidebar } from "./mobile-sidebar";
import { Separator } from "@asym/ui/components/shadcn/separator";

export const TopBar = memo(function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
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
