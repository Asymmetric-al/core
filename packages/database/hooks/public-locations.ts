"use client";

import { eq, useLiveQuery } from "@tanstack/react-db";
import { type z } from "zod";

import { locationsCollection } from "../collections/client-db";
import { type locationSchema } from "../collections/schemas/app";

export type PublicLocation = z.output<typeof locationSchema>;

export function usePublicLocations() {
  return useLiveQuery(
    (q) =>
      q
        .from({ location: locationsCollection.value })
        .where(({ location }) => eq(location.status, "published"))
        .orderBy(({ location }) => location.sort_key, "asc"),
    [],
  );
}
