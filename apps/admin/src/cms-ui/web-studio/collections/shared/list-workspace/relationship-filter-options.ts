"use client";

import { useConfig } from "@payloadcms/ui";
import { isFieldDisabled } from "payload/shared";
import { useEffect, useMemo, useState } from "react";

import type { RelationshipFilterOptions } from "./payload-where-filters";
import type { FilterOption } from "@asym/ui/components/shadcn/data-table";

/** Enough documents to choose from in a filter (tenants, authors…). */
const OPTION_LIMIT = 100;

type RelationshipFieldLike = {
  name?: string;
  type?: string;
  relationTo?: string | string[];
  admin?: { hidden?: boolean; disabled?: unknown } | null;
};

/** Top-level relationships to a single collection, keyed by field name. */
export function filterableRelationships(
  fields: readonly unknown[],
): Array<{ name: string; relationTo: string }> {
  return fields.flatMap((raw) => {
    const field = (raw ?? {}) as RelationshipFieldLike;
    if (
      field.type !== "relationship" ||
      !field.name ||
      typeof field.relationTo !== "string" ||
      field.admin?.hidden ||
      isFieldDisabled(field, "filter")
    ) {
      return [];
    }
    return [{ name: field.name, relationTo: field.relationTo }];
  });
}

/**
 * Loads the documents each relationship can point at, as filter options
 * (label from the related collection's title field, value its id), through
 * Payload's REST API with the signed-in user's access. A collection that
 * fails to load offers no options rather than failing the list.
 */
export async function loadRelationshipFilterOptions({
  relationships,
  apiURL,
  titleFieldOf,
  fetcher = fetch,
  signal,
}: {
  relationships: ReadonlyArray<{ name: string; relationTo: string }>;
  apiURL: string;
  titleFieldOf: (collectionSlug: string) => string;
  fetcher?: typeof fetch;
  signal?: AbortSignal;
}): Promise<RelationshipFilterOptions> {
  const entries = await Promise.all(
    relationships.map(async ({ name, relationTo }) => {
      const titleField = titleFieldOf(relationTo);
      const params = new URLSearchParams({
        depth: "0",
        limit: String(OPTION_LIMIT),
        sort: titleField,
        [`select[${titleField}]`]: "true",
      });
      try {
        const response = await fetcher(
          `${apiURL}/${encodeURIComponent(relationTo)}?${params}`,
          { credentials: "include", signal },
        );
        if (!response.ok) return [name, []] as const;
        const body = (await response.json()) as {
          docs?: Array<Record<string, unknown>>;
        };
        const options: FilterOption[] = (body.docs ?? []).flatMap((doc) => {
          if (doc.id === undefined || doc.id === null) return [];
          const id = String(doc.id);
          const title = doc[titleField];
          return [
            {
              label:
                typeof title === "string" && title.trim() ? title : `#${id}`,
              value: id,
            },
          ];
        });
        return [name, options] as const;
      } catch {
        return [name, []] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

/** Relationship filter options for a collection's fields, loaded once. */
export function useRelationshipFilterOptions(
  fields: readonly unknown[],
): RelationshipFilterOptions {
  const { config, getEntityConfig } = useConfig();
  const relationships = useMemo(
    () => filterableRelationships(fields),
    [fields],
  );
  const key = relationships
    .map(({ name, relationTo }) => `${name}:${relationTo}`)
    .join(",");
  const apiURL = `${config?.serverURL ?? ""}${config?.routes?.api ?? "/api"}`;
  const [options, setOptions] = useState<RelationshipFilterOptions>({});

  useEffect(() => {
    if (relationships.length === 0) return;
    const controller = new AbortController();
    void loadRelationshipFilterOptions({
      relationships,
      apiURL,
      titleFieldOf: (collectionSlug) => {
        const entity = getEntityConfig?.({ collectionSlug }) as
          { admin?: { useAsTitle?: string } } | undefined;
        return entity?.admin?.useAsTitle ?? "id";
      },
      signal: controller.signal,
    }).then((loaded) => {
      if (!controller.signal.aborted) setOptions(loaded);
    });
    return () => controller.abort();
    // `key` stands for `relationships`; getEntityConfig is stable per config.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO(payload-relationship-config-stability) Relationship keys represent stable config selections.
  }, [key, apiURL]);

  return options;
}

/**
 * The label of a related document from the loaded options, given the id (or
 * a populated document) stored on a row; null while the option is unknown.
 */
export function relationshipLabel(
  value: unknown,
  options: readonly FilterOption[] | undefined,
): string | null {
  if (!options || value === null || value === undefined) return null;
  const id =
    typeof value === "object" && "id" in value
      ? (value as { id: unknown }).id
      : value;
  if (id === null || id === undefined) return null;
  const match = options.find((option) => String(option.value) === String(id));
  return match ? String(match.label) : null;
}
