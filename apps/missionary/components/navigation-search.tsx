"use client";

import { NavigationCommandPalette } from "@asym/ui/components/primitives/navigation-command-palette";
import { useRouter } from "next/navigation";

import { getNavItems } from "./navigation-items";

export function MissionaryNavigationSearch() {
  const router = useRouter();

  return (
    <NavigationCommandPalette
      title="Missionary navigation"
      triggerLabel="Search missionary pages"
      items={getNavItems("missionary").map(({ title, href }) => ({
        label: title,
        href,
      }))}
      onNavigate={(href) => router.push(href)}
    />
  );
}
