"use client";

import { useCrmContacts } from "@asym/database/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { formatCurrency } from "@asym/lib/utils";
import {
  crmRecordAvatarTransitionName,
  crmRecordTitleTransitionName,
} from "@asym/lib/view-transitions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DataTableResponsive,
  type DataTableFilterField,
} from "@asym/ui/components/shadcn/data-table";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { Sheet, SheetContent } from "@asym/ui/components/shadcn/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import {
  Plus,
  List,
  Columns,
  X,
  User,
  Paperclip,
  History,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import React, { useState, useMemo } from "react";

import { getColumns } from "./columns";
import { STAGES, STAGE_COLORS } from "./types";

import type { Contact } from "./types";

const filterFields: DataTableFilterField<Contact>[] = [
  {
    id: "stage",
    label: "Stage",
    variant: "select",
    options: [
      { label: "New", value: "New" },
      { label: "Contacted", value: "Contacted" },
      { label: "Meeting", value: "Meeting" },
      { label: "Proposal", value: "Proposal" },
      { label: "Won", value: "Won" },
    ],
  },
  {
    id: "owner",
    label: "Owner",
    variant: "select",
    options: [
      { label: "Me", value: "Me" },
      { label: "Sarah", value: "Sarah" },
    ],
  },
];

function DetailDrawer({
  contact,
  onClose,
}: {
  contact: Contact;
  onClose: () => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<{
    category: string;
    focus: string;
    nextMove: string;
  } | null>(null);

  const summarizeContact = async () => {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSummary({
      category: "Active Partner",
      focus: "Sustainable infrastructure and water projects.",
      nextMove: "Share the Chiang Mai impact video.",
    });
    setIsAnalyzing(false);
  };

  return (
    <Sheet open={!!contact} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl p-0 gap-0 border-l border-border bg-background shadow-2xl overflow-hidden flex flex-col h-full text-left">
        <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Contact Details</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-[10px] font-bold uppercase tracking-wider gap-2 border border-border bg-card text-muted-foreground hover:bg-muted"
              onClick={summarizeContact}
              disabled={isAnalyzing}
            >
              <FileText
                className={cn("h-3.5 w-3.5", isAnalyzing && "animate-pulse")}
              />
              {isAnalyzing ? "Summarizing..." : "Quick Summary"}
            </Button>
            <div className="h-4 w-px bg-border mx-2" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            <div className="flex gap-6 items-start">
              <SharedNamedViewTransition
                name={crmRecordAvatarTransitionName(contact.id)}
              >
                <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xl">
                    {contact.name[0]}
                  </AvatarFallback>
                </Avatar>
              </SharedNamedViewTransition>
              <div className="space-y-1 pt-1">
                <SharedNamedViewTransition
                  name={crmRecordTitleTransitionName(contact.id)}
                >
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    {contact.name}
                  </h2>
                </SharedNamedViewTransition>
                <p className="text-sm text-muted-foreground font-medium">
                  {contact.title} at{" "}
                  <span className="text-foreground">{contact.company}</span>
                </p>
                <div className="flex gap-2 pt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 text-[10px] font-bold uppercase tracking-wider border shadow-none",
                      STAGE_COLORS[contact.stage],
                    )}
                  >
                    {contact.stage}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="h-5 text-[10px] font-bold uppercase tracking-wider border-none bg-muted text-muted-foreground"
                  >
                    {formatCurrency(contact.value)}
                  </Badge>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-2 text-foreground font-bold text-[10px] uppercase tracking-[0.2em]">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                    Highlights
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Type
                      </span>
                      <p className="text-sm font-bold text-foreground">
                        {summary.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Ministry Focus
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {summary.focus}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Next Step
                      </span>
                      <p className="text-xs text-foreground font-bold">
                        {summary.nextMove}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Tabs defaultValue="activity">
              <TabsList className="bg-transparent h-9 p-0 gap-6 border-b border-border w-full rounded-none justify-start">
                <TabsTrigger
                  value="activity"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none px-0 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-none"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="properties"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none px-0 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-none"
                >
                  Properties
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="pt-6 space-y-6">
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
                  <textarea
                    placeholder="Log a note, call, or meeting..."
                    className="w-full h-20 bg-muted border-none focus:ring-0 text-sm resize-none p-0 rounded-lg"
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-muted">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <History className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 px-4 text-[10px] font-bold uppercase tracking-wider"
                    >
                      Save Note
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 pl-4 border-l border-border ml-2">
                  {contact.activities.map((act) => (
                    <div key={act.id} className="relative group">
                      <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full border-2 border-background bg-muted z-10 transition-colors group-hover:bg-foreground" />
                      <div className="pb-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {act.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {new Date(act.date).toLocaleDateString()}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed bg-card p-3 rounded-lg border border-border shadow-sm">
                            {act.description}
                          </p>
                        )}
                        {act.amount && (
                          <p className="text-xs font-bold text-emerald-600">
                            +{formatCurrency(act.amount)} Gift Received
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent
                value="properties"
                className="pt-6 grid grid-cols-2 gap-8 text-left"
              >
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Email
                    </p>
                    <p className="text-sm font-bold text-foreground truncate hover:text-primary cursor-pointer">
                      {contact.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Phone
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {contact.phone}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      City
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {contact.city}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Owner
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {contact.owner}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contact.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="text-[9px] px-1.5 h-4 bg-muted text-muted-foreground border-none shadow-none"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function KanbanView({
  contacts,
  onSelectContact,
}: {
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
}) {
  return (
    <div className="h-full overflow-x-auto flex p-4 md:p-6 gap-4 items-start">
      {STAGES.map((stage) => (
        <div
          key={stage}
          className="flex-shrink-0 w-80 flex flex-col h-full bg-muted/30 rounded-xl border border-border/50 overflow-hidden"
        >
          <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
            <Badge
              variant="secondary"
              className={cn(
                "px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] rounded shadow-none border",
                STAGE_COLORS[stage],
              )}
            >
              {stage}
            </Badge>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {contacts.filter((c) => c.stage === stage).length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {contacts
              .filter((c) => c.stage === stage)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectContact(c)}
                  className="w-full bg-card p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 text-left"
                >
                  <div className="flex justify-between items-start">
                    <SharedNamedViewTransition
                      name={crmRecordTitleTransitionName(c.id)}
                    >
                      <span className="font-bold text-foreground text-xs truncate leading-none inline-block max-w-[85%]">
                        {c.name}
                      </span>
                    </SharedNamedViewTransition>
                    <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-border">
                      {c.company[0]}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium truncate">
                      {c.company}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-muted">
                    <span className="text-[10px] font-bold text-foreground tabular-nums">
                      {formatCurrency(c.value)}
                    </span>
                    <SharedNamedViewTransition
                      name={crmRecordAvatarTransitionName(c.id)}
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={c.avatar} />
                        <AvatarFallback className="text-[8px] font-bold">
                          {c.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </SharedNamedViewTransition>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MissionControlCRM() {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const contactsQuery = useCrmContacts();
  const contacts = contactsQuery.data ?? [];

  const columns = useMemo(
    () => getColumns({ onViewContact: setSelectedContact }),
    [],
  );

  return (
    <>
      <PageShell
        title="CRM"
        description="Manage contacts, donors, and partner relationships."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                onClick={() => setView("table")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  view === "table"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  view === "kanban"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Columns className="h-4 w-4" />
              </button>
            </div>
            <Button className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200 gap-2">
              <Plus className="h-3.5 w-3.5" /> New Record
            </Button>
          </div>
        }
      >
        <div className="flex flex-col min-h-[400px] overflow-hidden">
          <AnimatePresence mode="wait">
            {view === "table" ? (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <DataTableResponsive
                  columns={columns}
                  data={contacts}
                  isLoading={contactsQuery.isLoading}
                  filterFields={filterFields}
                  searchColumnId="name"
                  searchPlaceholder="Search contacts..."
                  getRowId={(contact) => contact.id}
                  config={{
                    enableRowSelection: true,
                    enableColumnVisibility: true,
                    enablePagination: true,
                    enableFilters: true,
                    enableSorting: true,
                    enableKeyboardNavigation: true,
                  }}
                  initialState={{
                    pagination: { pageIndex: 0, pageSize: 5 },
                    columnVisibility: {
                      email: false,
                      city: false,
                      lastActivity: false,
                    },
                  }}
                  mobileCardConfig={{
                    primaryField: "name",
                    secondaryField: "company",
                    badgeField: "stage",
                    renderCard: (row) => {
                      const contact = row.original;
                      return (
                        <button
                          type="button"
                          onClick={() => setSelectedContact(contact)}
                          className="w-full p-4 cursor-pointer space-y-3 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <SharedNamedViewTransition
                                name={crmRecordAvatarTransitionName(contact.id)}
                              >
                                <Avatar className="h-10 w-10 border border-border">
                                  <AvatarImage src={contact.avatar} />
                                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                                    {contact.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </SharedNamedViewTransition>
                              <div>
                                <SharedNamedViewTransition
                                  name={crmRecordTitleTransitionName(
                                    contact.id,
                                  )}
                                >
                                  <div className="font-semibold text-sm text-foreground">
                                    {contact.name}
                                  </div>
                                </SharedNamedViewTransition>
                                <div className="text-xs text-muted-foreground">
                                  {contact.company}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] uppercase font-semibold tracking-wide px-2 py-0.5 shadow-none rounded-lg border-transparent",
                                STAGE_COLORS[contact.stage],
                              )}
                            >
                              {contact.stage}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {contact.title}
                            </span>
                            <span className="font-bold tabular-nums">
                              {formatCurrency(contact.value)}
                            </span>
                          </div>
                        </button>
                      );
                    },
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <KanbanView
                  contacts={contacts}
                  onSelectContact={setSelectedContact}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageShell>

      {selectedContact && (
        <DetailDrawer
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </>
  );
}
