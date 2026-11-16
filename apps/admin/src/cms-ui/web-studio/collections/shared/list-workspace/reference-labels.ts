"use client";

import { useEffect, useState } from "react";

import type { RelationshipFilterOptions } from "./payload-where-filters";
import type { FilterOption } from "@asym/ui/components/shadcn/data-table";

/** As many as the create flows offer to choose from. */
const REFERENCE_LIMIT = 200;

type ReferenceSource = {
  /** What the cells name: the column's heading once names show. */
  title: string;
  url: string;
  read: (body: unknown) => FilterOption[];
};

function trimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Text fields that hold an Asym record's id (Giving Pages' missionary,
 * Project Pages' fund), with the admin list that names those records: the
 * same lists, and the same names, the create flows choose from.
 */
const REFERENCE_SOURCES: Record<string, ReferenceSource> = {
  missionaryId: {
    title: "Missionary",
    url: `/api/admin/missionaries?limit=${REFERENCE_LIMIT}`,
    read: (body) => {
      const rows = (body as { missionaries?: unknown[] } | null)?.missionaries;
      return (rows ?? []).flatMap((raw) => {
        const row = (raw ?? {}) as {
          id?: unknown;
          profile?: { full_name?: unknown; display_name?: unknown } | null;
        };
        if (typeof row.id !== "string") return [];
        const label =
          trimmed(row.profile?.full_name) || trimmed(row.profile?.display_name);
        return label ? [{ value: row.id, label }] : [];
      });
    },
  },
  fundId: {
    title: "Fund",
    url: `/api/admin/funds?limit=${REFERENCE_LIMIT}`,
    read: (body) => {
      const rows = (body as { funds?: unknown[] } | null)?.funds;
      return (rows ?? []).flatMap((raw) => {
        const row = (raw ?? {}) as { id?: unknown; name?: unknown };
        if (typeof row.id !== "string") return [];
        const label = trimmed(row.name);
        return label ? [{ value: row.id, label }] : [];
      });
    },
  },
};

/** The source behind a reference-ID column (own keys only). */
function referenceSource(accessor: string): ReferenceSource | undefined {
  return Object.hasOwn(REFERENCE_SOURCES, accessor)
    ? REFERENCE_SOURCES[accessor]
    : undefined;
}

/** Whether `accessor` is a reference-ID column the list can name. */
export function isReferenceColumn(accessor: string): boolean {
  return referenceSource(accessor) !== undefined;
}

/**
 * A reference-ID column whose names have loaded: its cells show names, so
 * it is headed by the record it names. It keeps its sort, which Payload can
 * only apply to the stored ID, so every sort surface says the order is by
 * ID (a sorted header reads "Missionary (by ID)", the phone Sort menu offers
 * "Missionary ID"). Until names load, or when the viewer may not read the
 * list, its cells show IDs and it stays the ID column Payload describes. Either way its filter matches the stored ID, under the field's
 * own label ("Missionary ID"): the names list is capped, so a filter by
 * name could not reach every record or show every applied ID.
 */
export function isNamedReferenceColumn(
  accessor: string,
  labels: RelationshipFilterOptions | undefined,
): boolean {
  return isReferenceColumn(accessor) && (labels?.[accessor]?.length ?? 0) > 0;
}

/**
 * A named reference-ID column's heading: the record its cells name
 * ("Missionary", "Fund"), not the stored field's label ("Missionary ID").
 * Null for other columns. The copy button keeps the field's label, since it
 * copies the ID.
 */
export function referenceColumnTitle(
  accessor: string,
  labels: RelationshipFilterOptions | undefined,
): string | null {
  return isNamedReferenceColumn(accessor, labels)
    ? (referenceSource(accessor)?.title ?? null)
    : null;
}

/**
 * The Asym record a document references (a giving page's missionary, a
 * project page's fund): its field, stored ID and the label that ID goes by
 * ("Missionary ID"). Null when the document holds none.
 */
export function documentReferenceOf(
  data: Record<string, unknown> | null | undefined,
): { accessor: string; id: string; idLabel: string } | null {
  for (const accessor of Object.keys(REFERENCE_SOURCES)) {
    const value = data?.[accessor];
    if (typeof value === "string" && value.trim()) {
      return {
        accessor,
        id: value,
        idLabel: `${REFERENCE_SOURCES[accessor]!.title} ID`,
      };
    }
  }
  return null;
}

/**
 * Names for the reference-ID columns among `accessors`, keyed by accessor.
 * A list that fails to load (or that the viewer may not read) names nothing,
 * and its cells keep the short ID.
 */
export async function loadReferenceLabels({
  accessors,
  fetcher = fetch,
  signal,
}: {
  accessors: readonly string[];
  fetcher?: typeof fetch;
  signal?: AbortSignal;
}): Promise<RelationshipFilterOptions> {
  const entries = await Promise.all(
    accessors.flatMap((accessor) => {
      const source = referenceSource(accessor);
      if (!source) return [];
      return [
        (async () => {
          try {
            const response = await fetcher(source.url, {
              credentials: "include",
              signal,
            });
            if (!response.ok) return [accessor, []] as const;
            return [accessor, source.read(await response.json())] as const;
          } catch {
            return [accessor, []] as const;
          }
        })(),
      ];
    }),
  );
  return Object.fromEntries(entries);
}

/** Loaded names for the list's reference-ID columns, once per set. */
export function useReferenceLabels(
  accessors: readonly string[],
): RelationshipFilterOptions {
  const wanted = accessors.filter(isReferenceColumn);
  const key = wanted.join(",");
  const [labels, setLabels] = useState<RelationshipFilterOptions>({});

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    void loadReferenceLabels({
      accessors: key.split(","),
      signal: controller.signal,
    }).then((loaded) => {
      if (!controller.signal.aborted) setLabels(loaded);
    });
    return () => controller.abort();
  }, [key]);

  return labels;
}
