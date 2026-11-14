"use client";

import { useMediaQuery } from "@asym/lib/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { AddPartnerDialog } from "@asym/missionary/components/add-partner-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import {
  flexRender,
  type Row,
} from "@asym/ui/components/shadcn/data-table/tanstack";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  Mail,
  Phone,
  Plus,
  Pencil,
  User,
  ArrowLeft,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MapPin,
  Church,
  Building2,
  Tag,
} from "lucide-react";
import * as React from "react";

import { DonorTasks } from "./donor-tasks";
import {
  formatCurrency,
  getStatusBadge,
  getTagLabel,
  getTagVariant,
} from "./donors-model";
import { createGivingHistoryColumns } from "./donors-page-columns";
import { parseDisplayDate } from "./donors-page-dates";
import { DonorsPageDetailContact } from "./donors-page-detail-contact";
import { DonorsPageDetailOverview } from "./donors-page-detail-overview";
import { DonorsPageDetailRecurring } from "./donors-page-detail-recurring";
import {
  getDonorCallHref,
  getDonorEmailHref,
  getGivingHistoryRows,
} from "./donors-page-model";
import {
  fadeInUp,
  scaleIn,
  slideInRight,
  staggerContainer,
  smoothTransition,
  springTransition,
} from "./donors-page-motion";
import { useDonorsPageViewFields } from "./use-donors-page-view";

import type { Activity } from "./donor-types";

/** Matches the shared `scroll-fade-x` fade width (calc(var(--spacing) * 6)). */
const TAB_REVEAL_INSET = 24;

const DETAIL_TABS = [
  { value: "overview", label: "Overview" },
  { value: "tasks", label: "Tasks" },
  { value: "contact", label: "Contact" },
  { value: "recurring", label: "Recurring" },
  { value: "giving", label: "Giving" },
] as const;

/**
 * Scroll the horizontal tab rail (only) so `tab` sits clear of the edge fade.
 * Page and vertical scroll stay where they are.
 */
function revealTabInRail(rail: HTMLElement, tab: HTMLElement) {
  const railBounds = rail.getBoundingClientRect();
  const tabBounds = tab.getBoundingClientRect();
  if (tabBounds.right > railBounds.right) {
    rail.scrollLeft += tabBounds.right - railBounds.right + TAB_REVEAL_INSET;
  } else if (tabBounds.left < railBounds.left) {
    rail.scrollLeft = Math.max(
      0,
      rail.scrollLeft - (railBounds.left - tabBounds.left) - TAB_REVEAL_INSET,
    );
  }
}

const GIVING_HISTORY_LABELS: Record<string, string> = {
  date: "Date",
  title: "Type",
  gift_type: "Method",
  amount: "Amount",
  status: "Status",
};

function GivingHistoryCard({ row }: { row: Row<Activity> }) {
  return (
    <article aria-label={`Gift: ${row.original.title}`}>
      <Card>
        <CardContent>
          <dl className="flex flex-col gap-3">
            {row.getAllCells().map((cell) => (
              <div key={cell.id} className="grid grid-cols-3 gap-3">
                <dt className="text-sm text-muted-foreground">
                  {GIVING_HISTORY_LABELS[cell.column.id]}
                </dt>
                <dd className="col-span-2 min-w-0 text-sm whitespace-normal wrap-break-word">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </article>
  );
}

export function DonorsPageDetail() {
  const view = useDonorsPageViewFields();
  const { profile } = view;
  const { selected: selectedDonor, clearSelection } = view.donors;
  const { activeTab, setActiveTab } = view.tabs;
  const { noteComposer, tagEditor, editDialog } = view;
  const { refreshDonors } = view.actions;
  const givingHistoryColumns = React.useMemo(
    () => createGivingHistoryColumns(),
    [],
  );
  const givingHistoryRows = React.useMemo(
    () => getGivingHistoryRows(selectedDonor),
    [selectedDonor],
  );
  const callHref = selectedDonor ? getDonorCallHref(selectedDonor) : null;
  const isStacked = useMediaQuery("(max-width: 1023px)");
  const detailRef = React.useRef<HTMLDivElement | null>(null);
  const selectedDonorId = selectedDonor?.id ?? null;
  // Below lg the roster steps aside for the open partner, hiding the row that
  // had focus. Bring the detail's top into view and move focus to its "Back to
  // partner list" control so keyboard and screen-reader users follow along.
  // AnimatePresence (mode="wait") can mount the partner after this effect, so
  // focus is applied by whichever comes last: the effect or the button's ref.
  const backButtonNodeRef = React.useRef<HTMLButtonElement | null>(null);
  const pendingBackFocusRef = React.useRef(false);
  const backButtonRef = React.useCallback((node: HTMLButtonElement | null) => {
    backButtonNodeRef.current = node;
    if (node && pendingBackFocusRef.current) {
      pendingBackFocusRef.current = false;
      node.focus({ preventScroll: true });
    }
  }, []);
  React.useEffect(() => {
    if (!isStacked || !selectedDonorId) return;
    detailRef.current?.scrollIntoView({ block: "start" });
    const backButton = backButtonNodeRef.current;
    if (backButton) backButton.focus({ preventScroll: true });
    else pendingBackFocusRef.current = true;
  }, [isStacked, selectedDonorId]);
  const emailHref = selectedDonor
    ? getDonorEmailHref(selectedDonor.email, selectedDonor.is_anonymous)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...smoothTransition, delay: 0.3 }}
      ref={detailRef}
      // On phones the "select a partner" placeholder would trail the whole
      // list, so it only shows beside the roster.
      className={cn(
        "lg:col-span-7 xl:col-span-8 min-h-0 scroll-mt-16",
        !selectedDonor && "max-lg:hidden",
      )}
    >
      <AnimatePresence mode="wait">
        {selectedDonor ? (
          <motion.div
            key={selectedDonor.id}
            initial={slideInRight.initial}
            animate={slideInRight.animate}
            exit={slideInRight.exit}
            transition={smoothTransition}
            className="h-full"
          >
            <Card className="overflow-hidden h-full flex flex-col">
              <div className="p-4 sm:p-6 border-b border-border bg-card shrink-0">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <DonorDetailIdentity
                    backButtonRef={backButtonRef}
                    clearSelection={clearSelection}
                    selectedDonor={selectedDonor}
                  />
                  <DonorDetailActions
                    callHref={callHref}
                    emailHref={emailHref}
                    noteComposer={noteComposer}
                    editDialog={editDialog}
                    selectedDonor={selectedDonor}
                    tagEditor={tagEditor}
                  />
                </div>

                <DonorDetailStats selectedDonor={selectedDonor} />

                <DonorDetailTags
                  selectedDonor={selectedDonor}
                  tagEditor={tagEditor}
                />
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col min-h-0"
              >
                <DonorDetailTabRail activeTab={activeTab} />

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 sm:p-6">
                    <TabsContent
                      value="overview"
                      className="mt-0 flex flex-col gap-6"
                    >
                      <DonorsPageDetailOverview />
                    </TabsContent>

                    <TabsContent
                      value="tasks"
                      className="mt-0 flex flex-col gap-6"
                    >
                      <DonorTasks
                        donorId={selectedDonor.id}
                        donorName={selectedDonor.name}
                      />
                    </TabsContent>

                    <TabsContent
                      value="contact"
                      className="mt-0 flex flex-col gap-6"
                    >
                      <DonorsPageDetailContact />
                    </TabsContent>

                    <TabsContent
                      value="recurring"
                      className="mt-0 flex flex-col gap-6"
                    >
                      <DonorsPageDetailRecurring />
                    </TabsContent>

                    <TabsContent value="giving" className="mt-0">
                      <DataTableResponsive
                        columns={givingHistoryColumns}
                        data={givingHistoryRows}
                        mobileCardConfig={{
                          renderCard: (row) => <GivingHistoryCard row={row} />,
                        }}
                        config={{
                          enableRowSelection: false,
                          enableColumnVisibility: false,
                          enablePagination: true,
                          enableFilters: false,
                          enableSorting: true,
                        }}
                        emptyState={
                          <Empty className="py-12">
                            <EmptyHeader>
                              <EmptyTitle>
                                No giving history available
                              </EmptyTitle>
                              <EmptyDescription>
                                Gift activity will appear here once donations
                                are recorded.
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        }
                      />
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </Card>
          </motion.div>
        ) : (
          <DonorDetailEmpty profile={profile} refreshDonors={refreshDonors} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * The five tabs fit on wider screens. On a phone they run past the card, so
 * the rail scrolls sideways: the edge fade plus a chevron mark each side that
 * still has tabs, the chosen tab is scrolled into view when a partner opens,
 * and a keyboard-focused tab is revealed as Base UI moves focus.
 */
function DonorDetailTabRail({ activeTab }: { activeTab: string }) {
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  React.useLayoutEffect(() => {
    const frame = frameRef.current;
    const rail = frame?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    const tab = frame?.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]',
    );
    if (rail && tab) revealTabInRail(rail, tab);
  }, [activeTab]);

  return (
    <div
      ref={frameRef}
      className="group/tab-rail relative shrink-0 border-b border-border px-4 py-3 sm:px-6 sm:py-4"
    >
      <ScrollArea
        edgeFade="x"
        onFocusCapture={(event) => {
          const tab = event.target;
          const rail = event.currentTarget.querySelector<HTMLElement>(
            '[data-slot="scroll-area-viewport"]',
          );
          // Base UI preserves page scroll during keyboard focus; reveal the
          // focused tab within this horizontal rail only.
          if (
            rail &&
            tab instanceof HTMLElement &&
            tab.getAttribute("role") === "tab"
          ) {
            revealTabInRail(rail, tab);
          }
        }}
      >
        {/* Clip the triggers' hidden line-variant indicator (::after, below
            the list) so the rail has no 1px vertical overflow and no
            vertical scrollbar. */}
        <div className="min-w-full w-max overflow-y-clip">
          <TabsList className="w-full">
            {DETAIL_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </ScrollArea>
      {/* Base UI marks the rail while tabs sit past an edge. The chevrons
          sit over the faded edge on a disc in the card colour (the fade is a
          transparency mask, so bare chevrons would land on half-faded tab
          text); taps pass through to the tab beneath. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 hidden w-6 items-center justify-start text-muted-foreground group-has-data-[overflow-x-start]/tab-rail:flex sm:left-6"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-card">
          <ChevronLeft className="size-4" />
        </span>
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-4 hidden w-6 items-center justify-end text-muted-foreground group-has-data-[overflow-x-end]/tab-rail:flex sm:right-6"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-card">
          <ChevronRight className="size-4" />
        </span>
      </span>
    </div>
  );
}

function DonorDetailIdentity({
  backButtonRef,
  clearSelection,
  selectedDonor,
}: {
  backButtonRef: React.Ref<HTMLButtonElement>;
  clearSelection: ReturnType<
    typeof useDonorsPageViewFields
  >["donors"]["clearSelection"];
  selectedDonor: NonNullable<
    ReturnType<typeof useDonorsPageViewFields>["donors"]["selected"]
  >;
}) {
  return (
    <div className="flex w-full min-w-0 items-start gap-4 sm:flex-1">
      <Button
        ref={backButtonRef}
        variant="ghost"
        size="icon"
        className="lg:hidden -ml-2 mt-1"
        onClick={clearSelection}
        aria-label="Back to partner list"
      >
        <ArrowLeft data-icon="inline-start" />
      </Button>
      <Avatar className="size-12 sm:size-16">
        <AvatarImage src={selectedDonor.avatar_url} />
        <AvatarFallback>{selectedDonor.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl tracking-tight text-foreground truncate">
            {selectedDonor.name}
          </h2>
          {getStatusBadge(selectedDonor.status)}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {selectedDonor.location || "Unknown"}
          </span>
          <span className="flex items-center gap-1">
            {selectedDonor.type === "Church" ? (
              <Church className="size-3" />
            ) : selectedDonor.type === "Organization" ? (
              <Building2 className="size-3" />
            ) : (
              <User className="size-3" />
            )}
            {selectedDonor.type}
          </span>
        </div>
      </div>
    </div>
  );
}

function DonorDetailActions({
  callHref,
  emailHref,
  noteComposer,
  editDialog,
  selectedDonor,
  tagEditor,
}: {
  callHref: string | null;
  emailHref: string | null;
  noteComposer: ReturnType<typeof useDonorsPageViewFields>["noteComposer"];
  editDialog: ReturnType<typeof useDonorsPageViewFields>["editDialog"];
  selectedDonor: NonNullable<
    ReturnType<typeof useDonorsPageViewFields>["donors"]["selected"]
  >;
  tagEditor: ReturnType<typeof useDonorsPageViewFields>["tagEditor"];
}) {
  const handleEditDialogOpen = editDialog.open;
  const handleTagEditorOpen = tagEditor.open;
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 sm:flex-none"
      >
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => noteComposer.open("note")}
        >
          <Pencil data-icon="inline-start" /> Note
        </Button>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 sm:flex-none"
      >
        {callHref ? (
          <a
            href={callHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full",
            )}
          >
            <Phone data-icon="inline-start" /> Call
          </a>
        ) : (
          <Button variant="outline" size="sm" disabled className="w-full">
            <Phone data-icon="inline-start" /> Call
          </Button>
        )}
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 sm:flex-none"
      >
        {emailHref ? (
          <a
            href={emailHref}
            className={cn(buttonVariants({ size: "sm" }), "w-full")}
          >
            <Mail data-icon="inline-start" /> Email
          </a>
        ) : (
          <Button size="sm" disabled className="w-full">
            <Mail data-icon="inline-start" /> Email
          </Button>
        )}
      </motion.div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Partner actions">
              <MoreHorizontal className="size-5" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleEditDialogOpen}
              disabled={selectedDonor.is_anonymous}
            >
              <Pencil data-icon="inline-start" /> Edit partner
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleTagEditorOpen}
              disabled={selectedDonor.is_anonymous}
            >
              <Tag data-icon="inline-start" /> Manage tags
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => noteComposer.open("call")}>
              <Phone data-icon="inline-start" /> Log a call
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => noteComposer.open("meeting")}>
              <Briefcase data-icon="inline-start" /> Log a meeting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => noteComposer.open("email")}>
              <Mail data-icon="inline-start" /> Log an email
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

function DonorDetailStats({
  selectedDonor,
}: {
  selectedDonor: NonNullable<
    ReturnType<typeof useDonorsPageViewFields>["donors"]["selected"]
  >;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 sm:mt-6"
    >
      {[
        {
          label: "Lifetime",
          value: formatCurrency(selectedDonor.total_given, null),
          extra: "Currency is not established for this total.",
        },
        {
          label: "Last gift",
          value: selectedDonor.last_gift_date
            ? formatCurrency(selectedDonor.last_gift_amount, null)
            : "—",
          extra: selectedDonor.last_gift_date
            ? formatDistanceToNow(
                parseDisplayDate(selectedDonor.last_gift_date),
                { addSuffix: true },
              )
            : null,
        },
        {
          label: "Gives",
          value: selectedDonor.frequency || "—",
        },
        {
          label: "Partner since",
          value: selectedDonor.joined_date
            ? format(parseDisplayDate(selectedDonor.joined_date), "MMM yyyy")
            : "—",
        },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          variants={fadeInUp}
          transition={{
            ...smoothTransition,
            delay: 0.2 + i * 0.05,
          }}
          className="flex flex-col gap-1 rounded-2xl border border-border bg-muted p-3 sm:p-4"
        >
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {stat.value}
          </p>
          {stat.extra ? (
            <p className="text-xs text-muted-foreground">{stat.extra}</p>
          ) : null}
        </motion.div>
      ))}
    </motion.div>
  );
}

function DonorDetailTags({
  selectedDonor,
  tagEditor,
}: {
  selectedDonor: NonNullable<
    ReturnType<typeof useDonorsPageViewFields>["donors"]["selected"]
  >;
  tagEditor: ReturnType<typeof useDonorsPageViewFields>["tagEditor"];
}) {
  const handleTagEditorOpen = tagEditor.open;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap items-center gap-1.5 mt-4"
    >
      <AnimatePresence mode="popLayout">
        {(selectedDonor.tags || []).map((tag, i) => (
          <motion.div
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              ...springTransition,
              delay: i * 0.03,
            }}
          >
            <Badge variant={getTagVariant(tag)}>{getTagLabel(tag)}</Badge>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTagEditorOpen}
          disabled={selectedDonor.is_anonymous}
        >
          <Plus data-icon="inline-start" /> Add tag
        </Button>
      </motion.div>
    </motion.div>
  );
}

function DonorDetailEmpty({
  profile,
  refreshDonors,
}: {
  profile: ReturnType<typeof useDonorsPageViewFields>["profile"];
  refreshDonors: ReturnType<
    typeof useDonorsPageViewFields
  >["actions"]["refreshDonors"];
}) {
  return (
    <motion.div
      key="empty"
      initial={scaleIn.initial}
      animate={scaleIn.animate}
      exit={scaleIn.exit}
      transition={smoothTransition}
    >
      <Card className="h-full min-h-150 flex items-center justify-center">
        <CardContent className="w-full">
          <Empty className="min-h-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <User />
              </EmptyMedia>
              <EmptyTitle>Choose a partner</EmptyTitle>
              <EmptyDescription>
                Pick someone from the list to see their contact details,
                recurring gifts and giving history.
              </EmptyDescription>
            </EmptyHeader>
            {profile?.id ? (
              <EmptyContent>
                <AddPartnerDialog
                  missionaryId={profile.id}
                  onSuccess={refreshDonors}
                  trigger={
                    <Button>
                      <Plus data-icon="inline-start" /> Add partner
                    </Button>
                  }
                />
              </EmptyContent>
            ) : null}
          </Empty>
        </CardContent>
      </Card>
    </motion.div>
  );
}
