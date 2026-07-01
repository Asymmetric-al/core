"use client";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { useQuery } from "@tanstack/react-query";
import { UserRound } from "lucide-react";

import { Link } from "../routing";
import { StudioLayout } from "../shell/studio-layout";

type MissionaryRow = {
  id: string;
  profile?: { display_name?: string | null; full_name?: string | null } | null;
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
          <h1 className="font-semibold text-2xl tracking-tight">
            Missionary directory
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Canonical missionary records from Supabase. Use the create action to
            open the template flow with this missionary pre-selected.
          </p>
        </div>

        {missionariesQuery.isError ? (
          <p className="text-destructive text-sm">
            {(missionariesQuery.error as Error).message}
          </p>
        ) : null}

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Missionary ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <MissionariesHubTableRows
                isPending={missionariesQuery.isPending}
                missionaries={missionariesQuery.data}
              />
            </TableBody>
          </Table>
        </div>
      </div>
    </StudioLayout>
  );
}

function MissionariesHubTableRows({
  isPending,
  missionaries,
}: {
  isPending: boolean;
  missionaries?: MissionaryRow[];
}) {
  if (isPending) {
    return Array.from({ length: 4 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-5 w-40" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-56" />
        </TableCell>
        <TableCell className="flex justify-end">
          <Skeleton className="h-8 w-36" />
        </TableCell>
      </TableRow>
    ));
  }

  const rows = missionaries ?? [];

  if (rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3}>
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRound className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No missionaries found</EmptyTitle>
              <EmptyDescription>
                Missionary records will appear here after they are available
                from Supabase.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TableCell>
      </TableRow>
    );
  }

  return rows.map((missionary) => {
    const label =
      missionary.profile?.full_name?.trim() ||
      missionary.profile?.display_name?.trim() ||
      missionary.id;

    return (
      <TableRow key={missionary.id}>
        <TableCell className="font-medium">{label}</TableCell>
        <TableCell className="font-mono text-muted-foreground text-xs">
          {missionary.id}
        </TableCell>
        <TableCell className="text-right">
          <Link
            href={`/web-studio/templates?pageType=missionary_giving&missionaryId=${encodeURIComponent(missionary.id)}`}
            className={buttonVariants({ size: "sm" })}
          >
            Create giving page
          </Link>
        </TableCell>
      </TableRow>
    );
  });
}
