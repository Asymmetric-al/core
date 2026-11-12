"use client";

import { useMC } from "@asym/lib/mission-control/context";
import {
  DataGridPanel,
  DataGridSearch,
  DataGridSortSelect,
  dataGridFeatures,
  useTable,
  type DataGridColumnDef,
  type SortingState,
  type PaginationState,
} from "@asym/ui/components/data-grid-panel";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@asym/ui/components/shadcn/item";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useId, useState } from "react";

import {
  loadStaffAccounts,
  staffName,
  STAFF_ROLE_LABELS,
  type StaffAccount,
} from "./staff-directory";

const COLUMNS: DataGridColumnDef<StaffAccount>[] = [
  {
    id: "name",
    accessorFn: staffName,
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Name" />
    ),
    meta: { headerTitle: "Name" },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => row.original.email || "No email on file",
    meta: { headerTitle: "Email" },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) =>
      STAFF_ROLE_LABELS[row.original.role] ?? row.original.role,
    meta: { headerTitle: "Role" },
  },
];

const WEB_STUDIO_EDITORS_HREF = "/web-studio/collections/cms-users";

/** Up to three platform administrators, by name, to ask about a role. */
function roleChangeContact(accounts: StaffAccount[] | undefined) {
  const names = (accounts ?? [])
    .filter((account) => account.role === "super_admin")
    .map(staffName)
    .sort((first, second) => first.localeCompare(second));
  if (names.length === 0) {
    return "Ask your Mission Control provider to change a role.";
  }
  const shown = names.slice(0, 3).join(", ");
  const more = names.length > 3 ? ` and ${names.length - 3} more` : "";
  return `Ask a platform administrator (${shown}${more}) to change a role.`;
}

export default function TeamsPage() {
  const { role } = useMC();
  if (role !== "admin") {
    return (
      <PageShell
        title="Staff directory"
        description="Staff accounts in this organization and their roles."
        density="compact"
      >
        {/* The account directory is an admin-only read; without this the
            page would only fail to load. */}
        <Alert role="note">
          <AlertTitle>Only administrators can see staff accounts.</AlertTitle>
          <AlertDescription>
            Ask an administrator if you need to know who has access.
          </AlertDescription>
        </Alert>
      </PageShell>
    );
  }
  return <StaffDirectory />;
}

function StaffDirectory() {
  const people = useQuery({
    queryKey: ["admin", "staff-directory"],
    queryFn: ({ signal }) => loadStaffAccounts(signal),
    staleTime: 60_000,
    retry: false,
  });
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const headingId = useId();
  const rows = (people.data ?? []).filter((account) =>
    `${staffName(account)} ${account.email ?? ""} ${STAFF_ROLE_LABELS[account.role] ?? account.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns: COLUMNS,
    getRowId: (account) => account.id,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });
  return (
    <PageShell
      title="Staff directory"
      description="Staff accounts in this organization and their roles."
      density="compact"
    >
      <div className="flex flex-col gap-6">
        <section aria-labelledby={headingId} className="flex flex-col gap-3">
          <h2 id={headingId} className="text-lg font-semibold">
            People
          </h2>
          <p className="text-sm text-muted-foreground">
            Staff accounts in this organization, from the account directory.
            Roles are read-only here.
          </p>
          {people.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load staff</AlertTitle>
              <AlertDescription>
                <p>
                  The account directory is unavailable. Try again in a moment.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={people.isFetching}
                  onClick={() => void people.refetch()}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <DataGridPanel
              table={table}
              view="auto"
              label="People"
              labelledBy={headingId}
              recordCount={rows.length}
              isLoading={people.isPending}
              pagination={rows.length > 10}
              toolbar={
                <>
                  <DataGridSearch
                    label="Search people"
                    placeholder="Search people…"
                    value={search}
                    onValueChange={(value) => {
                      setSearch(value);
                      setPagination((previous) => ({
                        ...previous,
                        pageIndex: 0,
                      }));
                    }}
                  />
                  <DataGridSortSelect
                    whenCards
                    label="Sort people"
                    sorting={sorting}
                    onSortingChange={setSorting}
                    fallback="name:asc"
                    options={{
                      "name:asc": "Name: A–Z",
                      "name:desc": "Name: Z–A",
                      "role:asc": "Role: A–Z",
                      "role:desc": "Role: Z–A",
                    }}
                  />
                </>
              }
              renderMobileRow={({ original }) => (
                // The panel's <li> carries the list semantics; render the
                // card as a plain div so it is not a second list item.
                <Item variant="outline" render={<div />}>
                  <ItemContent>
                    <ItemTitle>{staffName(original)}</ItemTitle>
                    <ItemDescription>
                      {original.email || "No email on file"}
                    </ItemDescription>
                    <ItemDescription>
                      {STAFF_ROLE_LABELS[original.role] ?? original.role}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              )}
              empty={
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>
                      {search
                        ? "No matching staff accounts"
                        : "No staff accounts found"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {search
                        ? "Try a different name, email or role."
                        : "Accounts appear here once people are given a staff role."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              }
            />
          )}
        </section>
        {/* After the people, so the directory is not pushed down. */}
        <Alert role="note">
          <AlertTitle>Roles are read-only here</AlertTitle>
          <AlertDescription>
            <p>
              Each account’s role decides what it can open. Mission Control has
              no teams yet, and roles can’t be changed in Mission Control.{" "}
              {people.isSuccess
                ? roleChangeContact(people.data)
                : "A platform administrator sets each role."}
            </p>
            <p>
              Review synced website editor accounts in{" "}
              <Link href={WEB_STUDIO_EDITORS_HREF}>Web Studio editors</Link>.
              For access changes, contact your platform administrator or Mission
              Control provider.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </PageShell>
  );
}
