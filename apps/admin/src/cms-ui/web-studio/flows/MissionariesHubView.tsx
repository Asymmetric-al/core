"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { StudioLayout } from "../shell/studio-layout";

type MissionaryRow = {
  id: string;
  profile?: { full_name?: string | null; display_name?: string | null } | null;
};

export function MissionariesHubView() {
  const missionariesQuery = useQuery({
    queryKey: ["web-studio", "admin-missionaries-hub"],
    queryFn: async () => {
      const res = await fetch("/api/admin/missionaries?limit=200", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load missionaries");
      }
      const json = (await res.json()) as { missionaries?: MissionaryRow[] };
      return json.missionaries ?? [];
    },
  });

  return (
    <StudioLayout sectionLabel="Missionaries" currentLabel="Directory">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-2xl">
          <h1 className="font-semibold text-2xl tracking-tight">Missionary directory</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Canonical missionary records from Supabase. Use “Create giving page” to open the
            template flow with this missionary pre-selected.
          </p>
        </div>

        {missionariesQuery.isError ? (
          <p className="text-destructive text-sm">
            {(missionariesQuery.error as Error).message}
          </p>
        ) : null}

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Missionary ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missionariesQuery.isPending ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground text-sm">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : (
                (missionariesQuery.data ?? []).map((m) => {
                  const label =
                    m.profile?.full_name?.trim() ||
                    m.profile?.display_name?.trim() ||
                    m.id;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{label}</TableCell>
                      <TableCell className="font-mono text-muted-foreground text-xs">
                        {m.id}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" asChild>
                          <Link
                            href={`/web-studio/templates?pageType=missionary_giving&missionaryId=${encodeURIComponent(m.id)}`}
                          >
                            Create giving page
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </StudioLayout>
  );
}
