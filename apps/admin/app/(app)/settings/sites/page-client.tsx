"use client";

import { TenantLink as Link } from "@asym/auth/tenant-navigation";
import { useMC } from "@asym/lib/mission-control/context";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
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
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useId, useRef, useState } from "react";
import { toast } from "sonner";

import {
  SITE_SETTINGS_QUERY_KEY,
  createSite,
  errorText,
  isInvalidNameError,
  isNoAccessError,
  loadSiteSettings,
  setDonorAccountName,
  setSiteStatus,
  stripNameEdges,
  type SiteSummary,
} from "./site-settings-api";

const TITLE = "Sites";
const DESCRIPTION =
  "Create Sites, turn them off and on, and set the name donors see on their account.";
const NAME_DESCRIPTION = "Up to 160 characters.";

type Settle = () => Promise<void>;

function SitesNoAccess() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION} density="compact">
      <Alert role="note">
        <AlertTitle>No access to Sites</AlertTitle>
        <AlertDescription>
          <p>
            Your active assignment can&apos;t manage Sites. Ask an administrator
            of this organization.
          </p>
          <div className="pt-2">
            <ButtonLink variant="outline" render={<Link href="/" />}>
              Go to home
            </ButtonLink>
          </div>
        </AlertDescription>
      </Alert>
    </PageShell>
  );
}

function SitesLoading() {
  const labelId = useId();
  return (
    <section
      aria-labelledby={labelId}
      aria-busy="true"
      className="flex max-w-4xl flex-col gap-3"
    >
      <p id={labelId} className="sr-only">
        Loading Sites…
      </p>
      <Skeleton className="h-9 w-full max-w-md" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </section>
  );
}

function SitesLoadFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-4xl">
      <Alert variant="destructive">
        <AlertTitle>Sites can&apos;t be loaded right now.</AlertTitle>
        <AlertDescription>
          <div className="pt-2">
            <Button type="button" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function DonorAccountNameSection({
  stored,
  onSettled,
}: {
  stored: string | null;
  onSettled: Settle;
}) {
  const headingId = useId();
  const fieldId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const [value, setValue] = useState(stored ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const inFlightRef = useRef(false);
  const invalid = isInvalidNameError(error);
  const unchanged = stripNameEdges(value) === (stored ?? "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const displayName = stripNameEdges(value);
    setValue(displayName);
    setError(null);
    setPending(true);
    try {
      const brand = await setDonorAccountName(displayName);
      toast.success(`Donor account name saved as ${brand.display_name}.`);
    } catch (caught) {
      setError(caught);
    } finally {
      inFlightRef.current = false;
      setPending(false);
      await onSettled();
    }
  };

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-base font-semibold">
        Donor account name
      </h2>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="flex max-w-xl flex-col gap-3"
      >
        <Field data-invalid={invalid || undefined}>
          <FieldLabel htmlFor={fieldId}>Donor account name</FieldLabel>
          <div className="flex gap-2">
            <Input
              id={fieldId}
              value={value}
              autoComplete="off"
              aria-invalid={invalid || undefined}
              aria-describedby={
                invalid ? `${descriptionId} ${errorId}` : descriptionId
              }
              onChange={(event) => setValue(event.target.value)}
            />
            <Button type="submit" disabled={pending || unchanged}>
              Save
            </Button>
          </div>
          <FieldDescription id={descriptionId}>
            Shown to donors on their account pages. Up to 160 characters.
          </FieldDescription>
          {invalid ? (
            <FieldError id={errorId}>{errorText(error)}</FieldError>
          ) : null}
        </Field>
        {error && !invalid ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{errorText(error)}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </section>
  );
}

function CreateSiteDialog({
  open,
  onOpenChange,
  onSettled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettled: Settle;
}) {
  const fieldId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlightRef = useRef(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const invalid = isInvalidNameError(error);

  const handleOpenChange = (next: boolean) => {
    if (!next && inFlightRef.current) return;
    if (!next) {
      setName("");
      setError(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const stripped = stripNameEdges(name);
    setName(stripped);
    setError(null);
    setPending(true);
    let created = false;
    try {
      const site = await createSite(stripped);
      created = true;
      toast.success(`${site.name} was created.`);
    } catch (caught) {
      setError(caught);
    } finally {
      await onSettled();
      inFlightRef.current = false;
      setPending(false);
      if (created) {
        setName("");
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent initialFocus={inputRef}>
        <DialogHeader>
          <DialogTitle>Create a Site</DialogTitle>
          <DialogDescription>
            A new Site starts active, with no domain.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex flex-col gap-4"
        >
          <Field data-invalid={invalid || undefined}>
            <FieldLabel htmlFor={fieldId}>Site name</FieldLabel>
            <Input
              id={fieldId}
              ref={inputRef}
              value={name}
              autoComplete="off"
              aria-invalid={invalid || undefined}
              aria-describedby={
                invalid ? `${descriptionId} ${errorId}` : descriptionId
              }
              onChange={(event) => setName(event.target.value)}
            />
            <FieldDescription id={descriptionId}>
              {NAME_DESCRIPTION}
            </FieldDescription>
            {invalid ? (
              <FieldError id={errorId}>{errorText(error)}</FieldError>
            ) : null}
          </Field>
          {error && !invalid ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{errorText(error)}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Create Site
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeactivateSiteDialog({
  target,
  onClose,
  onSettled,
  finalFocus,
}: {
  target: SiteSummary | null;
  onClose: () => void;
  onSettled: Settle;
  finalFocus: () => HTMLElement | boolean;
}) {
  const inFlightRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const handleOpenChange = (next: boolean) => {
    if (next || inFlightRef.current) return;
    setError(null);
    onClose();
  };

  const handleDeactivate = async () => {
    if (inFlightRef.current || !target) return;
    inFlightRef.current = true;
    setError(null);
    setPending(true);
    let changed = false;
    try {
      const site = await setSiteStatus(target.id, "inactive");
      changed = true;
      toast.success(`${site.name} is now inactive.`);
    } catch (caught) {
      setError(caught);
    } finally {
      await onSettled();
      inFlightRef.current = false;
      setPending(false);
      if (changed) onClose();
    }
  };

  return (
    <AlertDialog open={target !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent finalFocus={finalFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {target?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            While it&apos;s inactive, its pages aren&apos;t shown to visitors.
            You can reactivate it at any time, and its pages come back without
            republishing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{errorText(error)}</AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => void handleDeactivate()}
          >
            Deactivate
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SitesSection({
  sites,
  onSettled,
}: {
  sites: SiteSummary[];
  onSettled: Settle;
}) {
  const headingId = useId();
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<SiteSummary | null>(
    null,
  );
  const [reactivating, setReactivating] = useState<string | null>(null);
  const [reactivateError, setReactivateError] = useState<unknown>(null);
  const reactivateInFlightRef = useRef(false);
  const actionRefs = useRef(new Map<string, HTMLButtonElement>());
  const lastTargetRef = useRef<string | null>(null);

  const handleReactivate = async (site: SiteSummary) => {
    if (reactivateInFlightRef.current) return;
    reactivateInFlightRef.current = true;
    setReactivateError(null);
    setReactivating(site.id);
    try {
      const updated = await setSiteStatus(site.id, "active");
      toast.success(`${updated.name} is now active.`);
    } catch (caught) {
      setReactivateError(caught);
    } finally {
      await onSettled();
      reactivateInFlightRef.current = false;
      setReactivating(null);
    }
  };

  const finalFocus = useCallback(() => {
    const id = lastTargetRef.current;
    return (id ? actionRefs.current.get(id) : undefined) ?? true;
  }, []);

  const createButton = (
    <Button type="button" onClick={() => setCreateOpen(true)}>
      Create Site
    </Button>
  );

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-base font-semibold">
          Sites
        </h2>
        {sites.length > 0 ? createButton : null}
      </div>
      {reactivateError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{errorText(reactivateError)}</AlertDescription>
        </Alert>
      ) : null}
      {sites.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No Sites yet</EmptyTitle>
            <EmptyDescription>
              Create a Site to give your organization a public website.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>{createButton}</EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption className="sr-only">
              Sites in this organization
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => {
                const active = site.status === "active";
                return (
                  <TableRow key={site.id}>
                    <TableCell>
                      <span className="font-medium">{site.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={active ? "secondary" : "outline"}>
                          {active ? "Active" : "Inactive"}
                        </Badge>
                        {site.is_default ? (
                          <Badge variant="outline">Default</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {site.primary_domain ?? (
                        <span className="text-muted-foreground">
                          Not connected
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {site.is_default ? (
                          <span className="text-sm text-muted-foreground">
                            Always active
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={reactivating === site.id}
                            ref={(element) => {
                              if (element) {
                                actionRefs.current.set(site.id, element);
                              } else {
                                actionRefs.current.delete(site.id);
                              }
                            }}
                            onClick={() => {
                              if (active) {
                                lastTargetRef.current = site.id;
                                setDeactivateTarget(site);
                              } else {
                                void handleReactivate(site);
                              }
                            }}
                          >
                            {active ? "Deactivate" : "Reactivate"}{" "}
                            <span className="sr-only">{site.name}</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <CreateSiteDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSettled={onSettled}
      />
      <DeactivateSiteDialog
        target={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onSettled={onSettled}
        finalFocus={finalFocus}
      />
    </section>
  );
}

function SiteSettingsScreen() {
  const queryClient = useQueryClient();
  const settings = useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: ({ signal }) => loadSiteSettings(signal),
    retry: false,
  });
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY }),
    [queryClient],
  );

  if (settings.isError && isNoAccessError(settings.error)) {
    return <SitesNoAccess />;
  }

  let body: React.ReactNode;
  if (settings.isPending) {
    body = <SitesLoading />;
  } else if (settings.isError) {
    body = <SitesLoadFailed onRetry={() => void settings.refetch()} />;
  } else {
    const stored = settings.data.brand?.display_name ?? null;
    body = (
      <div className="flex max-w-4xl flex-col gap-8">
        <DonorAccountNameSection
          key={stored ?? ""}
          stored={stored}
          onSettled={refresh}
        />
        <SitesSection sites={settings.data.sites} onSettled={refresh} />
      </div>
    );
  }

  return (
    <PageShell title={TITLE} description={DESCRIPTION} density="compact">
      {body}
    </PageShell>
  );
}

export default function SitesPage() {
  const { capabilities = [] } = useMC();
  if (!capabilities.includes("sites.manage")) return <SitesNoAccess />;
  return <SiteSettingsScreen />;
}
