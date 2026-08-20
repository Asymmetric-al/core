"use client";

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
import { format, formatDistanceToNow, differenceInMonths } from "date-fns";
import {
  Mail,
  Phone,
  Plus,
  Pencil,
  User,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  MoreHorizontal,
  Tag,
} from "lucide-react";
import * as React from "react";

import { DonorTasks } from "./donor-tasks";
import {
  formatCurrency,
  getStatusBadge,
  getTagLabel,
  getTagStyle,
} from "./donors-model";
import { createGivingHistoryColumns } from "./donors-page-columns";
import { currentDisplayDate, parseDisplayDate } from "./donors-page-dates";
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
  const emailHref = selectedDonor
    ? getDonorEmailHref(selectedDonor.email, selectedDonor.is_anonymous)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...smoothTransition, delay: 0.3 }}
      className="lg:col-span-8 xl:col-span-9 min-h-0"
    >
      <AnimatePresence mode="wait">
        {selectedDonor ? (
          <motion.div
            key={selectedDonor.id}
            {...slideInRight}
            transition={smoothTransition}
            className="h-full"
          >
            <Card className="border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
              <div className="p-6 border-b border-zinc-100 bg-white shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden size-8 -ml-2 mt-1 text-zinc-400"
                      onClick={clearSelection}
                    >
                      <ArrowLeft className="size-4" />
                    </Button>
                    <Avatar className="size-16 rounded-2xl border border-zinc-100 shadow-sm">
                      <AvatarImage src={selectedDonor.avatar_url} />
                      <AvatarFallback className="rounded-2xl bg-zinc-100 text-zinc-500 font-semibold">
                        {selectedDonor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 truncate">
                          {selectedDonor.name}
                        </h2>
                        {getStatusBadge(selectedDonor.status)}
                      </div>
                      <p className="text-sm text-zinc-500 truncate">
                        {selectedDonor.location}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="flex flex-wrap items-center gap-2 shrink-0"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50"
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
                            buttonVariants({
                              variant: "outline",
                              size: "sm",
                            }),
                            "w-full h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50",
                          )}
                        >
                          <Phone data-icon="inline-start" /> Call
                        </a>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="w-full h-9 px-4 text-xs font-medium rounded-xl border-zinc-200"
                        >
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
                          className={cn(
                            buttonVariants({ size: "sm" }),
                            "w-full h-9 px-4 text-xs font-medium rounded-xl",
                          )}
                        >
                          <Mail data-icon="inline-start" /> Email
                        </a>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          className="w-full h-9 px-4 text-xs font-medium rounded-xl"
                        >
                          <Mail data-icon="inline-start" /> Email
                        </Button>
                      )}
                    </motion.div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 text-zinc-400 rounded-xl hover:bg-zinc-100"
                          >
                            <MoreHorizontal className="size-5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl border-zinc-100 shadow-xl"
                      >
                        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-100" />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={editDialog.open}
                            className="text-xs font-medium"
                          >
                            <Pencil data-icon="inline-start" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={tagEditor.open}
                            className="text-xs font-medium"
                          >
                            <Tag data-icon="inline-start" /> Manage Tags
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-zinc-100" />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => noteComposer.open("call")}
                            className="text-xs font-medium"
                          >
                            <Phone data-icon="inline-start" /> Log Call
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => noteComposer.open("meeting")}
                            className="text-xs font-medium"
                          >
                            <Briefcase data-icon="inline-start" /> Log Meeting
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => noteComposer.open("email")}
                            className="text-xs font-medium"
                          >
                            <Mail data-icon="inline-start" /> Log Email
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
                >
                  {[
                    {
                      label: "Lifetime",
                      value: formatCurrency(selectedDonor.total_given),
                    },
                    {
                      label: "Last Gift",
                      value: formatCurrency(selectedDonor.last_gift_amount),
                      extra: selectedDonor.last_gift_date
                        ? formatDistanceToNow(
                            parseDisplayDate(selectedDonor.last_gift_date),
                            { addSuffix: true },
                          )
                        : null,
                      showPulse:
                        selectedDonor.last_gift_date &&
                        differenceInMonths(
                          currentDisplayDate(),
                          parseDisplayDate(selectedDonor.last_gift_date),
                        ) < 1,
                    },
                    {
                      label: "Frequency",
                      value: selectedDonor.frequency || "N/A",
                      icon: ArrowUpRight,
                    },
                    {
                      label: "Partner Since",
                      value: selectedDonor.joined_date
                        ? format(
                            parseDisplayDate(selectedDonor.joined_date),
                            "MMM yyyy",
                          )
                        : "N/A",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      variants={fadeInUp}
                      transition={{
                        ...smoothTransition,
                        delay: 0.2 + i * 0.05,
                      }}
                      whileHover={{ y: -2 }}
                      className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        {stat.label}
                      </p>
                      <div className="flex items-center gap-2">
                        {stat.icon ? (
                          <stat.icon className="size-3.5 text-emerald-600" />
                        ) : null}
                        <p
                          className={cn(
                            stat.label === "Lifetime" ||
                              stat.label === "Last Gift"
                              ? "text-lg"
                              : "text-sm",
                            "font-semibold text-zinc-900",
                          )}
                        >
                          {stat.value}
                        </p>
                        {stat.showPulse ? (
                          <motion.div
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="size-2 bg-emerald-500 rounded-full"
                          />
                        ) : null}
                      </div>
                      {stat.extra ? (
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {stat.extra}
                        </p>
                      ) : null}
                    </motion.div>
                  ))}
                </motion.div>

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
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            getTagStyle(tag),
                          )}
                        >
                          {getTagLabel(tag)}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
                      onClick={tagEditor.open}
                    >
                      <Plus data-icon="inline-start" /> Add Tag
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="px-6 py-4 border-b border-zinc-100 shrink-0">
                  <TabsList className="bg-zinc-100/50 border border-zinc-100 p-1.5 h-auto rounded-2xl w-full sm:w-auto grid grid-cols-5 sm:flex">
                    {[
                      "overview",
                      "tasks",
                      "contact",
                      "recurring",
                      "giving",
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-xl data-active:bg-white data-active:shadow-sm px-4 sm:px-6 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 data-active:text-zinc-900 transition-colors"
                      >
                        {tab === "overview"
                          ? "Overview"
                          : tab === "tasks"
                            ? "Tasks"
                            : tab === "contact"
                              ? "Contact"
                              : tab === "recurring"
                                ? "Recurring"
                                : "Giving"}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        <DonorsPageDetailOverview />
                      </TabsContent>

                      <TabsContent value="tasks" className="mt-0 space-y-6">
                        <DonorTasks
                          donorId={selectedDonor.id}
                          donorName={selectedDonor.name}
                        />
                      </TabsContent>

                      <TabsContent value="contact" className="mt-0 space-y-6">
                        <DonorsPageDetailContact />
                      </TabsContent>

                      <TabsContent value="recurring" className="mt-0 space-y-6">
                        <DonorsPageDetailRecurring />
                      </TabsContent>

                      <TabsContent value="giving" className="mt-0">
                        <DataTableResponsive
                          columns={givingHistoryColumns}
                          data={givingHistoryRows}
                          config={{
                            enableRowSelection: false,
                            enableColumnVisibility: false,
                            enablePagination: true,
                            enableFilters: false,
                            enableSorting: true,
                          }}
                          emptyState={
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <p className="text-sm font-semibold text-zinc-900">
                                No giving history available
                              </p>
                              <p className="text-xs text-zinc-400 mt-1">
                                Gift activity will appear here once donations
                                are recorded.
                              </p>
                            </div>
                          }
                        />
                      </TabsContent>
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </Tabs>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="empty" {...scaleIn} transition={smoothTransition}>
            <Card className="border-zinc-200 border-dashed bg-zinc-50/30 rounded-[2.5rem] h-full min-h-[600px] flex items-center justify-center">
              <CardContent className="p-16">
                <Empty className="border-none bg-transparent min-h-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <User />
                    </EmptyMedia>
                    <EmptyTitle>Select a Partner</EmptyTitle>
                    <EmptyDescription>
                      Choose a donor from the list to view their profile,
                      recurring donations, and giving history.
                    </EmptyDescription>
                  </EmptyHeader>
                  {profile?.id ? (
                    <EmptyContent>
                      <AddPartnerDialog
                        missionaryId={profile.id}
                        onSuccess={refreshDonors}
                        trigger={
                          <Button className="h-11 px-8 rounded-2xl bg-zinc-900 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-zinc-800">
                            <Plus data-icon="inline-start" /> Add Partner
                          </Button>
                        }
                      />
                    </EmptyContent>
                  ) : null}
                </Empty>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
