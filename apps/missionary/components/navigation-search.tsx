"use client";

import { useTenantRouter as useRouter } from "@asym/auth/tenant-navigation";
import { NavigationCommandPalette } from "@asym/ui/components/primitives/navigation-command-palette";

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
