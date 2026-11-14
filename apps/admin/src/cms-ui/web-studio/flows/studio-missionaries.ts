"use client";

import { useQuery } from "@tanstack/react-query";

export type StudioMissionaryRow = {
  id: string;
  location?: string | null;
  missionField?: string | null;
  profile?: { full_name?: string | null; display_name?: string | null } | null;
};

export function studioMissionaryName(missionary: StudioMissionaryRow): string {
  return (
    missionary.profile?.full_name?.trim() ||
    missionary.profile?.display_name?.trim() ||
    missionary.id
  );
}

export function studioMissionaryContext(
  missionary: StudioMissionaryRow,
): string | null {
  return (
    [missionary.location?.trim(), missionary.missionField?.trim()]
      .filter(Boolean)
      .join(" · ") || null
  );
}

export function studioMissionaryOptions(missionaries: StudioMissionaryRow[]) {
  const nameCounts = new Map<string, number>();
  const labelCounts = new Map<string, number>();
  const options = missionaries.map((missionary) => {
    const name = studioMissionaryName(missionary);
    const context = studioMissionaryContext(missionary);
    const label = context ? `${name} · ${context}` : name;
    const nameKey = name.toLowerCase();
    const labelKey = label.toLowerCase();
    nameCounts.set(nameKey, (nameCounts.get(nameKey) ?? 0) + 1);
    labelCounts.set(labelKey, (labelCounts.get(labelKey) ?? 0) + 1);
    return { value: missionary.id, nameKey, labelKey, context, label };
  });
  return options.map(({ value, nameKey, labelKey, context, label }) => ({
    value,
    label:
      (labelCounts.get(labelKey) ?? 0) > 1 ||
      (!context && (nameCounts.get(nameKey) ?? 0) > 1)
        ? `${label} (${value})`
        : label,
  }));
}

const PAGE_SIZE = 200;
const LOAD_ERROR = "The missionary directory didn't load. Try again.";

export async function fetchStudioMissionaries(
  signal?: AbortSignal,
): Promise<StudioMissionaryRow[]> {
  const missionaries: StudioMissionaryRow[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const response = await fetch(
      `/api/admin/missionaries?limit=${PAGE_SIZE}&offset=${offset}`,
      { credentials: "include", signal },
    );
    if (!response.ok) throw new Error(LOAD_ERROR);
    const page = (await response.json()) as {
      missionaries?: StudioMissionaryRow[];
    };
    if (!Array.isArray(page.missionaries)) throw new Error(LOAD_ERROR);
    missionaries.push(...page.missionaries);
    if (page.missionaries.length < PAGE_SIZE) return missionaries;
  }
}

export function useStudioMissionaries() {
  return useQuery({
    queryKey: ["web-studio", "admin-missionaries"],
    queryFn: ({ signal }) => fetchStudioMissionaries(signal),
  });
}
