"use client";

import { useQuery } from "@tanstack/react-query";

export type DemoRole = "admin" | "missionary" | "donor";

export type DemoAvailability = Record<DemoRole, boolean>;

export const DEMO_AVAILABILITY_FALLBACK: Readonly<DemoAvailability> =
  Object.freeze({
    admin: false,
    missionary: false,
    donor: false,
  });

interface DemoAccountStatusResponse {
  availableRoles?: Partial<Record<DemoRole, boolean>>;
}

function toDemoAvailability(
  availableRoles: DemoAccountStatusResponse["availableRoles"],
): DemoAvailability {
  return {
    admin: Boolean(availableRoles?.admin),
    missionary: Boolean(availableRoles?.missionary),
    donor: Boolean(availableRoles?.donor),
  };
}

export async function fetchDemoAvailability(): Promise<DemoAvailability> {
  const response = await fetch("/api/auth/demo-account");
  if (!response.ok) {
    throw new Error("Demo status unavailable");
  }

  const data = (await response.json()) as DemoAccountStatusResponse;
  return toDemoAvailability(data.availableRoles);
}

export function useDemoAvailability() {
  return useQuery({
    queryKey: ["auth", "demo-account", "availability"],
    queryFn: fetchDemoAvailability,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
