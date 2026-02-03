"use client";

import { memo, useCallback, useMemo } from "react";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { Button } from "@asym/ui/components/shadcn/button";
import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { useMC, useRole } from "../context";
import type { Role } from "@asym/config/navigation";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  finance: "Finance",
  fundraising: "Fundraising",
  mobilizers: "Mobilizers",
  member_care: "Member Care",
  events: "Events",
};

export const ProfileMenu = memo(function ProfileMenu() {
  const { user, isDevMode, signOut } = useMC();
  const { role, setRole, roleLabel } = useRole();

  const initials = useMemo(
    () =>
      user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U",
    [user?.name],
  );

  const handleRoleChange = useCallback(
    (v: string) => setRole(v as Role),
    [setRole],
  );
  const handleSignOut = useCallback(() => signOut(), [signOut]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 gap-2 px-2 hover:bg-secondary">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-foreground text-background text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        {isDevMode && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs text-amber-600 dark:text-amber-400">
                [Dev] Switch Role ({roleLabel})
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={role}
                  onValueChange={handleRoleChange}
                >
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                    <DropdownMenuRadioItem
                      key={r}
                      value={r}
                      className="text-sm"
                    >
                      {ROLE_LABELS[r]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
