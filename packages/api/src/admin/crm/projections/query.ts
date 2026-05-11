import type { CrmProjectionTargetSurface } from "@asym/database/types";

export const SUPPORTED_CRM_PROJECTION_TARGET_SURFACES = [
  "donor",
  "missionary",
  "cms",
  "event",
  "reporting",
] as const satisfies readonly CrmProjectionTargetSurface[];

export interface AdminCrmProjectionShadowParams {
  search: string | null;
  targetSurfaces: CrmProjectionTargetSurface[];
}

function isProjectionTargetSurface(
  value: string,
): value is CrmProjectionTargetSurface {
  return (
    SUPPORTED_CRM_PROJECTION_TARGET_SURFACES as readonly string[]
  ).includes(value);
}

function parseTargetSurfaces(values: string[]): CrmProjectionTargetSurface[] {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(isProjectionTargetSurface),
    ),
  );
}

export function parseAdminCrmProjectionShadowParams(
  searchParams: URLSearchParams,
): AdminCrmProjectionShadowParams {
  return {
    search: searchParams.get("q")?.trim() || null,
    targetSurfaces: parseTargetSurfaces(searchParams.getAll("surface")),
  };
}
