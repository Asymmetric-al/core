"use client";

import {
  TenantLink as Link,
  useRoutePathname,
} from "@asym/auth/tenant-navigation";
import { ownApiFetch } from "@asym/database/own-api";
import { useMC } from "@asym/lib/mission-control/context";
import {
  DataGridPanel,
  DataGridSearch,
  DataGridSortSelect,
  dataGridFeatures,
  useTable,
  type DataGridColumnDef,
  type PaginationState,
  type SortingState,
} from "@asym/ui/components/data-grid-panel";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, UserPlus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  STAFF_SUBROLE_OPTIONS,
  loadPendingInvitations,
  loadStaffAccounts,
  memberRowKey,
  staffName,
  staffRoleLabel,
  staffSubroleLabel,
  type PendingInvitation,
  type StaffAccount,
  type StaffSubroleValue,
} from "./staff-directory";

const WEB_STUDIO_EDITORS_HREF = "/web-studio/collections/cms-users";

function isStaffSubrole(
  value: string | null | undefined,
): value is StaffSubroleValue {
  return STAFF_SUBROLE_OPTIONS.some((option) => option.value === value);
}

function isPendingInvitationLive(invitation: PendingInvitation): boolean {
  if (invitation.status !== "issued") return false;
  const expiresMs = Date.parse(invitation.expires_at);
  return Number.isNaN(expiresMs) ? true : expiresMs > Date.now();
}

function formatExpiry(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type CreatedInviteBanner = {
  email: string;
  role: "staff" | "missionary";
  staffRole: string | null;
  isTenantAdmin: boolean;
  invitePath: string;
  expiresAt: string;
};

export default function TeamsPage() {
  const mc = useMC();
  const canManage = mc.canManageMembers ?? mc.role === "admin";
  const currentMembershipId = mc.currentMembershipId ?? null;
  const currentUserId = mc.user?.id ?? null;

  return (
    <MembersDirectory
      canManage={canManage}
      currentMembershipId={currentMembershipId}
      currentUserId={currentUserId}
    />
  );
}

function MembersDirectory({
  canManage,
  currentMembershipId,
  currentUserId,
}: {
  canManage: boolean;
  currentMembershipId: string | null;
  currentUserId: string | null;
}) {
  const queryClient = useQueryClient();

  const people = useQuery({
    queryKey: ["admin", "members-directory"],
    queryFn: ({ signal }) => loadStaffAccounts(signal),
    staleTime: 60_000,
    retry: false,
  });

  const invitations = useQuery({
    queryKey: ["admin", "member-invitations"],
    enabled: canManage,
    queryFn: ({ signal }) => loadPendingInvitations(signal),
    staleTime: 30_000,
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

  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<StaffAccount | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<StaffAccount | null>(null);
  const [revokeInviteTarget, setRevokeInviteTarget] =
    useState<PendingInvitation | null>(null);

  const headingId = useId();
  const invitationsHeadingId = useId();

  const isOwnRow = useCallback(
    (account: StaffAccount): boolean => {
      if (currentMembershipId && account.membership_id) {
        return account.membership_id === currentMembershipId;
      }
      return Boolean(currentUserId && account.id === currentUserId);
    },
    [currentMembershipId, currentUserId],
  );

  const refreshAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin", "members-directory"],
    });
    if (canManage) {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "member-invitations"],
      });
    }
  };

  const columns = useMemo<DataGridColumnDef<StaffAccount>[]>(() => {
    const base: DataGridColumnDef<StaffAccount>[] = [
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
        id: "role",
        accessorFn: (account) => {
          const baseLabel = staffRoleLabel(account);
          if (
            (account.is_tenant_admin || account.role === "admin") &&
            account.staff_role
          ) {
            return `${baseLabel} ${staffSubroleLabel(account.staff_role)}`;
          }
          return baseLabel;
        },
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
          const account = row.original;
          const isAdmin =
            Boolean(account.is_tenant_admin) || account.role === "admin";
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <span>{staffRoleLabel(account)}</span>
              {isAdmin && account.staff_role ? (
                <Badge variant="outline">
                  {staffSubroleLabel(account.staff_role)}
                </Badge>
              ) : null}
            </div>
          );
        },
        meta: { headerTitle: "Role" },
      },
    ];

    if (!canManage) {
      return base;
    }

    return [
      ...base,
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const account = row.original;
          const self = isOwnRow(account);
          const isStaff = account.role === "staff" || account.role === "admin";
          const isAdmin =
            Boolean(account.is_tenant_admin) || account.role === "admin";
          const name = staffName(account);

          return (
            <div className="flex flex-wrap justify-end gap-2">
              {isStaff && !self ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Change role for ${name}`}
                  onClick={() => setRoleTarget(account)}
                >
                  Change role
                </Button>
              ) : null}
              {isStaff && self && isAdmin ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRoleTarget(account)}
                >
                  Give up admin
                </Button>
              ) : null}
              {!self ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Revoke ${name}`}
                  onClick={() => setRevokeTarget(account)}
                >
                  Revoke
                </Button>
              ) : null}
            </div>
          );
        },
        meta: { headerTitle: "Actions" },
      },
    ];
  }, [canManage, isOwnRow]);

  const rows = (people.data ?? []).filter((account) =>
    `${staffName(account)} ${account.email ?? ""} ${staffRoleLabel(account)} ${account.staff_role ? staffSubroleLabel(account.staff_role) : ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns,
    getRowId: memberRowKey,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const pendingInvitations = (invitations.data ?? []).filter(
    isPendingInvitationLive,
  );

  return (
    <PageShell
      title="Members"
      description="Staff and missionaries in this organization, their roles and invitations."
      density="compact"
      actions={
        canManage ? (
          <Button type="button" onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden="true" className="size-4" />
            Invite member
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6">
        <section aria-labelledby={headingId} className="flex flex-col gap-3">
          <h2 id={headingId} className="text-lg font-semibold">
            People
          </h2>
          <p className="text-sm text-muted-foreground">
            {canManage
              ? "Active staff and missionary memberships in this organization."
              : "Active staff and missionary memberships in this organization. Only administrators can invite members or change roles."}
          </p>
          {people.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load members</AlertTitle>
              <AlertDescription>
                <p>
                  The member directory is unavailable. Try again in a moment.
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
              renderMobileRow={({ original }) => {
                const self = isOwnRow(original);
                const isStaff =
                  original.role === "staff" || original.role === "admin";
                const isAdmin =
                  Boolean(original.is_tenant_admin) ||
                  original.role === "admin";
                return (
                  <Item variant="outline" render={<div />}>
                    <ItemContent>
                      <ItemTitle>{staffName(original)}</ItemTitle>
                      <ItemDescription>
                        {original.email || "No email on file"}
                      </ItemDescription>
                      <ItemDescription>
                        {staffRoleLabel(original)}
                        {isAdmin && original.staff_role
                          ? ` · ${staffSubroleLabel(original.staff_role)}`
                          : ""}
                      </ItemDescription>
                    </ItemContent>
                    {canManage ? (
                      <ItemActions>
                        {isStaff && !self ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRoleTarget(original)}
                          >
                            Change role
                          </Button>
                        ) : null}
                        {isStaff && self && isAdmin ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRoleTarget(original)}
                          >
                            Give up admin
                          </Button>
                        ) : null}
                        {!self ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRevokeTarget(original)}
                          >
                            Revoke
                          </Button>
                        ) : null}
                      </ItemActions>
                    ) : null}
                  </Item>
                );
              }}
              empty={
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>
                      {search ? "No matching members" : "No members found"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {search
                        ? "Try a different name, email or role."
                        : "Members appear here once people hold a staff or missionary membership."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              }
            />
          )}
        </section>

        {canManage ? (
          <section
            aria-labelledby={invitationsHeadingId}
            className="flex flex-col gap-3"
          >
            <h2 id={invitationsHeadingId} className="text-lg font-semibold">
              Pending invitations
            </h2>
            {invitations.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Could not load invitations</AlertTitle>
                <AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void invitations.refetch()}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : pendingInvitations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending invitations.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pendingInvitations.map((invitation) => (
                  <li key={invitation.id}>
                    <Item variant="outline" render={<div />}>
                      <ItemContent>
                        <ItemTitle>{invitation.email}</ItemTitle>
                        <ItemDescription>
                          {invitation.role === "missionary"
                            ? "Missionary"
                            : invitation.is_tenant_admin
                              ? `Administrator · ${staffSubroleLabel(invitation.staff_role)}`
                              : staffSubroleLabel(invitation.staff_role)}
                          {` · Expires ${formatExpiry(invitation.expires_at)}`}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Revoke invitation for ${invitation.email}`}
                          onClick={() => setRevokeInviteTarget(invitation)}
                        >
                          Revoke invitation
                        </Button>
                      </ItemActions>
                    </Item>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        <Alert role="note">
          <AlertTitle>
            {canManage ? "Website editors" : "Read-only directory"}
          </AlertTitle>
          <AlertDescription>
            {!canManage ? (
              <p>
                Ask an organization administrator to invite members, change
                roles, or revoke access.
              </p>
            ) : null}
            <p>
              Review synced website editor accounts in{" "}
              <Link href={WEB_STUDIO_EDITORS_HREF}>Web Studio editors</Link>.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      {canManage ? (
        <>
          <InviteMemberDialog
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            onInvited={() => void refreshAll()}
          />
          <ChangeRoleDialog
            target={roleTarget}
            isSelf={roleTarget ? isOwnRow(roleTarget) : false}
            onClose={() => setRoleTarget(null)}
            onChanged={() => void refreshAll()}
          />
          <RevokeMembershipDialog
            target={revokeTarget}
            onClose={() => setRevokeTarget(null)}
            onRevoked={() => void refreshAll()}
          />
          <RevokeInvitationDialog
            target={revokeInviteTarget}
            onClose={() => setRevokeInviteTarget(null)}
            onRevoked={() => void refreshAll()}
          />
        </>
      ) : null}
    </PageShell>
  );
}

function InviteMemberDialog({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
}) {
  const emailId = useId();
  const roleId = useId();
  const subroleId = useId();
  const adminId = useId();
  const reasonId = useId();
  const linkId = useId();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "missionary">("staff");
  const [staffRole, setStaffRole] = useState<StaffSubroleValue>("development");
  const [isTenantAdmin, setIsTenantAdmin] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedInviteBanner | null>(null);
  const [copied, setCopied] = useState(false);
  const pathname = useRoutePathname();
  const initialPathnameRef = useRef(pathname);

  const resetForm = useCallback(() => {
    setEmail("");
    setRole("staff");
    setStaffRole("development");
    setIsTenantAdmin(false);
    setReason("");
    setError(null);
    setCreated(null);
    setCopied(false);
  }, []);

  useEffect(() => {
    if (initialPathnameRef.current !== pathname) {
      initialPathnameRef.current = pathname;
      resetForm();
      onOpenChange(false);
    }
  }, [onOpenChange, pathname, resetForm]);

  useEffect(() => {
    return () => {
      setCreated(null);
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await ownApiFetch("/api/admin/members/invitations", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          role,
          staffRole: role === "staff" ? staffRole : null,
          isTenantAdmin: role === "staff" ? isTenantAdmin : false,
          reason,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        invitePath?: string;
        invitation?: {
          expires_at: string;
          role: "staff" | "missionary";
          staff_role: string | null;
          is_tenant_admin: boolean;
        };
      };
      if (!response.ok || !payload.invitePath || !payload.invitation) {
        setError(payload.error || "Could not create invitation.");
        return;
      }
      setCreated({
        email: email.trim(),
        role: payload.invitation.role,
        staffRole: payload.invitation.staff_role,
        isTenantAdmin: payload.invitation.is_tenant_admin,
        invitePath: payload.invitePath,
        expiresAt: payload.invitation.expires_at,
      });
      onInvited();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const invitationAddress = created
    ? created.role === "staff"
      ? typeof window !== "undefined"
        ? `${window.location.origin}${created.invitePath}`
        : created.invitePath
      : created.invitePath
    : "";

  const isMissionaryInvitation = created?.role === "missionary";

  const handleCopy = async () => {
    if (!created || !invitationAddress) return;
    try {
      await navigator.clipboard.writeText(invitationAddress);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {created ? "Invitation link created" : "Invite member"}
          </DialogTitle>
          <DialogDescription>
            {created
              ? "Share this one-time link with the invited person. It is shown once."
              : "Invite a staff member or missionary who already has a Core account."}
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <div className="flex flex-col gap-4">
            <Alert role="status">
              <AlertTitle>Shown once</AlertTitle>
              <AlertDescription>
                No email was sent. Copy this link now; it cannot be shown again.
              </AlertDescription>
            </Alert>
            <div data-sentry-block="" className="flex flex-col gap-1.5">
              <Label htmlFor={linkId}>
                {isMissionaryInvitation
                  ? "Missionary workspace invitation path"
                  : "Invitation link"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={linkId}
                  readOnly
                  autoComplete="off"
                  data-sentry-mask="true"
                  value={invitationAddress}
                  aria-label={
                    isMissionaryInvitation
                      ? "Missionary workspace invitation path"
                      : "Invitation link"
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCopy()}
                >
                  {copied ? (
                    <Check aria-hidden="true" className="size-4" />
                  ) : (
                    <Copy aria-hidden="true" className="size-4" />
                  )}
                  {copied
                    ? "Copied"
                    : isMissionaryInvitation
                      ? "Copy path"
                      : "Copy link"}
                </Button>
              </div>
              {isMissionaryInvitation ? (
                <p className="text-xs text-muted-foreground">
                  Open this path on your missionary workspace address. Opening
                  it on Mission Control will land in the wrong app.
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="flex flex-col gap-4"
          >
            {error ? (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={emailId}>Email address</Label>
              <Input
                id={emailId}
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="person@organization.org"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={roleId}>Membership class</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  if (value === "staff" || value === "missionary") {
                    setRole(value);
                    if (value === "missionary") setIsTenantAdmin(false);
                  }
                }}
              >
                <SelectTrigger id={roleId} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="missionary">Missionary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "staff" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={subroleId}>Staff sub-role</Label>
                  <Select
                    value={staffRole}
                    onValueChange={(value) => {
                      if (isStaffSubrole(value)) setStaffRole(value);
                    }}
                  >
                    <SelectTrigger id={subroleId} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_SUBROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={adminId}
                    checked={isTenantAdmin}
                    onCheckedChange={(checked) =>
                      setIsTenantAdmin(checked === true)
                    }
                  />
                  <Label htmlFor={adminId}>Organization administrator</Label>
                </div>
              </>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={reasonId}>Reason</Label>
              <Input
                id={reasonId}
                required
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Why is this person being invited?"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create invitation"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChangeRoleDialog({
  target,
  isSelf,
  onClose,
  onChanged,
}: {
  target: StaffAccount | null;
  isSelf: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const subroleId = useId();
  const adminId = useId();
  const reasonId = useId();

  const initialSubrole: StaffSubroleValue = isStaffSubrole(target?.staff_role)
    ? target.staff_role
    : "development";
  const initialAdmin = Boolean(
    target && (target.is_tenant_admin || target.role === "admin"),
  );

  const [staffRole, setStaffRole] = useState<StaffSubroleValue>(initialSubrole);
  const [isTenantAdmin, setIsTenantAdmin] = useState(
    isSelf ? false : initialAdmin,
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleConflict, setStaleConflict] = useState(false);
  const [lastTargetKey, setLastTargetKey] = useState<string | null>(null);

  const currentKey = target ? memberRowKey(target) : null;
  if (currentKey !== lastTargetKey) {
    setLastTargetKey(currentKey);
    setStaffRole(initialSubrole);
    setIsTenantAdmin(isSelf ? false : initialAdmin);
    setReason("");
    setError(null);
    setStaleConflict(false);
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!target?.membership_id || !target.updated_at) {
      setError("Reload the member list before changing this role.");
      return;
    }
    setError(null);
    setStaleConflict(false);
    setSubmitting(true);
    try {
      const response = await ownApiFetch("/api/admin/members/role", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          membershipId: target.membership_id,
          role: "staff",
          staffRole: isSelf ? initialSubrole : staffRole,
          isTenantAdmin: isSelf ? false : isTenantAdmin,
          reason,
          expectedUpdatedAt: target.updated_at,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
      if (!response.ok) {
        if (
          response.status === 409 &&
          payload.code === "CONCURRENT_MODIFICATION"
        ) {
          setStaleConflict(true);
        }
        setError(payload.error || "Could not update member role.");
        return;
      }
      onChanged();
      onClose();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSelf
              ? "Give up administrator role"
              : `Change role for ${target ? staffName(target) : ""}`}
          </DialogTitle>
          <DialogDescription>
            {isSelf
              ? "Clear the administrator flag on your own membership. Another administrator must remain active."
              : "Update the staff sub-role or administrator flag for this membership."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex flex-col gap-4"
        >
          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>
                <p>{error}</p>
                {staleConflict ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onChanged();
                      onClose();
                    }}
                  >
                    Reload members
                  </Button>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          {!isSelf ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={subroleId}>Staff sub-role</Label>
                <Select
                  value={staffRole}
                  onValueChange={(value) => {
                    if (isStaffSubrole(value)) setStaffRole(value);
                  }}
                >
                  <SelectTrigger id={subroleId} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_SUBROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={adminId}
                  checked={isTenantAdmin}
                  onCheckedChange={(checked) =>
                    setIsTenantAdmin(checked === true)
                  }
                />
                <Label htmlFor={adminId}>Organization administrator</Label>
              </div>
            </>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={reasonId}>Reason</Label>
            <Input
              id={reasonId}
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why is this role changing?"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving…"
                : isSelf
                  ? "Give up administrator role"
                  : "Save role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RevokeMembershipDialog({
  target,
  onClose,
  onRevoked,
}: {
  target: StaffAccount | null;
  onClose: () => void;
  onRevoked: () => void;
}) {
  const reasonId = useId();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  const currentKey = target ? memberRowKey(target) : null;
  if (currentKey !== lastKey) {
    setLastKey(currentKey);
    setReason("");
    setError(null);
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!target?.membership_id) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await ownApiFetch("/api/admin/members/revoke", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          membershipId: target.membership_id,
          reason,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error || "Could not revoke membership.");
        return;
      }
      onRevoked();
      onClose();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Revoke {target ? staffName(target) : "membership"}
          </DialogTitle>
          <DialogDescription>
            This immediately ends access for this membership in this
            organization.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex flex-col gap-4"
        >
          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={reasonId}>Reason</Label>
            <Input
              id={reasonId}
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why is this membership being revoked?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting ? "Revoking…" : "Revoke membership"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RevokeInvitationDialog({
  target,
  onClose,
  onRevoked,
}: {
  target: PendingInvitation | null;
  onClose: () => void;
  onRevoked: () => void;
}) {
  const reasonId = useId();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);

  const currentId = target?.id ?? null;
  if (currentId !== lastId) {
    setLastId(currentId);
    setReason("");
    setError(null);
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!target) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await ownApiFetch(
        `/api/admin/members/invitations/${target.id}/revoke`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ reason }),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error || "Could not revoke invitation.");
        return;
      }
      onRevoked();
      onClose();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke invitation</DialogTitle>
          <DialogDescription>
            Withdraw the pending invitation for {target?.email}. The invitation
            link will stop working immediately.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex flex-col gap-4"
        >
          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={reasonId}>Reason</Label>
            <Input
              id={reasonId}
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why is this invitation being revoked?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting ? "Revoking…" : "Revoke invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
