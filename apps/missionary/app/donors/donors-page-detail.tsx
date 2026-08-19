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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import { format, formatDistanceToNow, differenceInMonths } from "date-fns";
import {
  Mail,
  Phone,
  MapPin,
  Plus,
  Heart,
  MessageSquare,
  Send,
  Copy,
  ExternalLink,
  Pencil,
  User,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Briefcase,
  Clock,
  MoreHorizontal,
  Tag,
  Building2,
  Globe,
  Star,
  Home,
  Loader2,
  Repeat,
} from "lucide-react";
import * as React from "react";

import { DonorTasks } from "./donor-tasks";
import {
  formatCurrency,
  getActivityBg,
  getActivityIcon,
  getGiftTypeIcon,
  getPaymentMethodIcon,
  getRecurringStatusBadge,
  getStatusBadge,
  getTagLabel,
  getTagStyle,
} from "./donors-model";
import { createGivingHistoryColumns } from "./donors-page-columns";
import { currentDisplayDate, parseDisplayDate } from "./donors-page-dates";
import { getGivingHistoryRows } from "./donors-page-model";
import {
  fadeInUp,
  scaleIn,
  slideInRight,
  staggerContainer,
  smoothTransition,
  springTransition,
} from "./donors-page-motion";
import { useDonorsPageViewFields } from "./use-donors-page-view";

import type { DonorActivityType } from "./donor-mutation-client";
import type { ActivityType, RecurringStatus } from "./donor-types";

export function DonorsPageDetail() {
  const view = useDonorsPageViewFields();
  const { profile } = view;
  const { selected: selectedDonor, clearSelection } = view.donors;
  const { activeTab, setActiveTab } = view.tabs;
  const { noteComposer, tagEditor, editDialog } = view;
  const { refreshDonors, copyToClipboard, formatAddress } = view.actions;
  const givingHistoryColumns = React.useMemo(
    () => createGivingHistoryColumns(),
    [],
  );
  const givingHistoryRows = React.useMemo(
    () => getGivingHistoryRows(selectedDonor),
    [selectedDonor],
  );
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...smoothTransition, delay: 0.25 }}
      className="lg:col-span-8 xl:col-span-9"
    >
      <AnimatePresence mode="wait">
        {selectedDonor ? (
          <motion.div
            key={selectedDonor.id}
            {...slideInRight}
            transition={smoothTransition}
          >
            <Card className="border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
              <div className="border-b border-zinc-100 p-6 shrink-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden size-9 text-zinc-400 rounded-xl hover:bg-zinc-100"
                        onClick={clearSelection}
                      >
                        <ArrowLeft className="size-5" />
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={springTransition}
                    >
                      <Avatar className="size-14 border-2 border-white shadow-lg rounded-2xl">
                        <AvatarImage src={selectedDonor.avatar_url} />
                        <AvatarFallback className="text-lg font-semibold bg-zinc-100 text-zinc-500">
                          {selectedDonor.initials}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...smoothTransition, delay: 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
                          {selectedDonor.name}
                        </h2>
                        {getStatusBadge(selectedDonor.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />{" "}
                          {selectedDonor.location || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          {selectedDonor.type === "Church" ? (
                            <Building2 className="size-3" />
                          ) : selectedDonor.type === "Organization" ? (
                            <Briefcase className="size-3" />
                          ) : (
                            <User className="size-3" />
                          )}
                          {selectedDonor.type}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...smoothTransition, delay: 0.15 }}
                    className="flex items-center gap-2 w-full sm:w-auto"
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
                        <Pencil className="size-3.5 mr-1.5" /> Note
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none"
                    >
                      <a
                        href={`tel:${selectedDonor.phone || selectedDonor.mobile}`}
                        className={cn(
                          buttonVariants({
                            variant: "outline",
                            size: "sm",
                          }),
                          "w-full h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50",
                        )}
                      >
                        <Phone className="size-3.5 mr-1.5" /> Call
                      </a>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none"
                    >
                      <a
                        href={`mailto:${selectedDonor.email}`}
                        className={cn(
                          buttonVariants({ size: "sm" }),
                          "w-full h-9 px-4 text-xs font-medium rounded-xl",
                        )}
                      >
                        <Mail className="size-3.5 mr-1.5" /> Email
                      </a>
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
                        <DropdownMenuItem
                          onClick={editDialog.open}
                          className="text-xs font-medium"
                        >
                          <Pencil className="size-3.5 mr-2" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={tagEditor.open}
                          className="text-xs font-medium"
                        >
                          <Tag className="size-3.5 mr-2" /> Manage Tags
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-100" />
                        <DropdownMenuItem
                          onClick={() => noteComposer.open("call")}
                          className="text-xs font-medium"
                        >
                          <Phone className="size-3.5 mr-2" /> Log Call
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => noteComposer.open("meeting")}
                          className="text-xs font-medium"
                        >
                          <Briefcase className="size-3.5 mr-2" /> Log Meeting
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => noteComposer.open("email")}
                          className="text-xs font-medium"
                        >
                          <Mail className="size-3.5 mr-2" /> Log Email
                        </DropdownMenuItem>
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
                        {stat.icon && (
                          <stat.icon className="size-3.5 text-emerald-600" />
                        )}
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
                        {stat.showPulse && (
                          <motion.div
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="size-2 bg-emerald-500 rounded-full"
                          />
                        )}
                      </div>
                      {stat.extra && (
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {stat.extra}
                        </p>
                      )}
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
                      <Plus className="size-3 mr-1" /> Add Tag
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
                        <motion.div
                          {...fadeInUp}
                          transition={smoothTransition}
                          className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100"
                        >
                          <Textarea
                            placeholder="Log a call, meeting notes, or observation..."
                            className="min-h-[80px] border-none bg-white focus:ring-0 resize-none text-sm p-3 rounded-xl shadow-sm"
                            value={noteComposer.noteInput}
                            onChange={(e) =>
                              noteComposer.setNoteInput(e.target.value)
                            }
                          />
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
                            <div className="flex gap-2">
                              {[
                                {
                                  type: "call",
                                  icon: Phone,
                                  bg: "bg-blue-50 text-blue-600",
                                },
                                {
                                  type: "meeting",
                                  icon: Briefcase,
                                  bg: "bg-emerald-50 text-emerald-600",
                                },
                                {
                                  type: "note",
                                  icon: MessageSquare,
                                  bg: "bg-zinc-200 text-zinc-700",
                                  hidden: "hidden sm:flex",
                                },
                              ].map(({ type, icon: Icon, bg, hidden }) => (
                                <motion.div
                                  key={type}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "h-8 rounded-lg text-[10px] font-semibold uppercase tracking-widest",
                                      hidden,
                                      noteComposer.activityType === type
                                        ? bg
                                        : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100",
                                    )}
                                    onClick={() =>
                                      noteComposer.setActivityType(
                                        type as DonorActivityType,
                                      )
                                    }
                                  >
                                    <Icon className="size-3.5 mr-1.5" />{" "}
                                    {type.charAt(0).toUpperCase() +
                                      type.slice(1)}
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                size="sm"
                                className="h-8 rounded-xl px-4 text-[10px] font-semibold uppercase tracking-widest"
                                onClick={noteComposer.save}
                                disabled={
                                  !noteComposer.noteInput.trim() ||
                                  noteComposer.isSaving
                                }
                              >
                                {noteComposer.isSaving ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <>
                                    Post <Send className="size-3 ml-1.5" />
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>

                        <div className="space-y-4 relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-100" />

                          {selectedDonor.activities.length === 0 ? (
                            <motion.div
                              {...fadeInUp}
                              className="flex flex-col items-center justify-center py-16 text-center ml-8"
                            >
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={springTransition}
                                className="size-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4"
                              >
                                <Calendar className="size-7 text-zinc-300" />
                              </motion.div>
                              <p className="text-sm font-semibold text-zinc-900">
                                No activity recorded yet
                              </p>
                              <p className="text-xs text-zinc-400 mt-1">
                                Start by logging your first interaction
                              </p>
                            </motion.div>
                          ) : (
                            <AnimatePresence>
                              {selectedDonor.activities.map((activity, i) => (
                                <motion.div
                                  key={activity.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    ...smoothTransition,
                                    delay: i * 0.05,
                                  }}
                                  className="relative pl-10 group"
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.15 }}
                                    className={cn(
                                      "absolute left-0 top-1 size-8 rounded-xl flex items-center justify-center shadow-sm z-10",
                                      getActivityBg(
                                        activity.type as ActivityType,
                                      ),
                                    )}
                                  >
                                    {getActivityIcon(
                                      activity.type as ActivityType,
                                    )}
                                  </motion.div>

                                  <motion.div
                                    whileHover={{
                                      y: -2,
                                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                                    }}
                                    className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                                      <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-sm font-semibold text-zinc-900">
                                            {activity.title}
                                          </span>
                                          {activity.amount && (
                                            <Badge
                                              className={cn(
                                                "font-semibold px-2 h-5 rounded-lg text-[9px] uppercase tracking-widest border-0",
                                                activity.status === "Failed"
                                                  ? "bg-rose-50 text-rose-600"
                                                  : "bg-emerald-50 text-emerald-700",
                                              )}
                                            >
                                              {formatCurrency(activity.amount)}
                                            </Badge>
                                          )}
                                          {activity.gift_type && (
                                            <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                                              {getGiftTypeIcon(
                                                activity.gift_type,
                                              )}
                                              {activity.gift_type}
                                            </span>
                                          )}
                                          {activity.status === "Failed" && (
                                            <Badge className="bg-rose-50 text-rose-600 border-0 text-[9px] font-semibold uppercase tracking-widest">
                                              Failed
                                            </Badge>
                                          )}
                                        </div>
                                        {activity.description && (
                                          <p className="text-sm text-zinc-500 leading-relaxed">
                                            {activity.description}
                                          </p>
                                        )}
                                        {activity.note && (
                                          <p className="text-xs text-zinc-400 italic">
                                            {activity.note}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                                        {format(
                                          parseDisplayDate(activity.date),
                                          "MMM d, yyyy",
                                        )}
                                      </span>
                                    </div>
                                  </motion.div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="tasks" className="mt-0 space-y-6">
                        <DonorTasks
                          donorId={selectedDonor.id}
                          donorName={selectedDonor.name}
                        />
                      </TabsContent>

                      <TabsContent value="contact" className="mt-0 space-y-6">
                        <motion.div
                          {...fadeInUp}
                          transition={smoothTransition}
                          className="flex items-center justify-between mb-2"
                        >
                          <h3 className="text-sm font-semibold text-zinc-900">
                            Contact Information
                          </h3>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={editDialog.open}
                              className="h-8 px-3 text-xs rounded-xl border-zinc-200"
                            >
                              <Pencil className="size-3.5 mr-1.5" /> Edit
                            </Button>
                          </motion.div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="space-y-3"
                          >
                            {[
                              {
                                icon: Mail,
                                label: "Email",
                                value: selectedDonor.email,
                                preferred:
                                  selectedDonor.preferred_contact === "email",
                                color: "blue",
                              },
                              {
                                icon: Phone,
                                label: "Primary Phone",
                                value: selectedDonor.phone,
                                preferred:
                                  selectedDonor.preferred_contact === "phone",
                                color: "emerald",
                              },
                              {
                                icon: MessageSquare,
                                label: "Mobile / Text",
                                value: selectedDonor.mobile,
                                preferred:
                                  selectedDonor.preferred_contact === "text",
                                color: "purple",
                              },
                              {
                                icon: Briefcase,
                                label: "Work Phone",
                                value: selectedDonor.work_phone,
                                color: "zinc",
                              },
                            ].map((item, i) => (
                              <motion.div
                                key={item.label}
                                variants={fadeInUp}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -2 }}
                                className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "size-10 rounded-xl flex items-center justify-center shrink-0",
                                      `bg-${item.color}-50 text-${item.color}-600`,
                                    )}
                                  >
                                    <item.icon className="size-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                        {item.label}
                                      </p>
                                      {item.preferred && (
                                        <Badge
                                          className={cn(
                                            `bg-${item.color}-50 text-${item.color}-600`,
                                            "border-0 text-[8px] font-semibold uppercase tracking-widest px-1.5 py-0",
                                          )}
                                        >
                                          Preferred
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm font-medium text-zinc-900 truncate">
                                      {item.value || "Not provided"}
                                    </p>
                                  </div>
                                </div>
                                {item.value && (
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "size-9 rounded-xl shrink-0",
                                        `text-zinc-400 hover:text-${item.color}-600 hover:bg-${item.color}-50`,
                                      )}
                                      onClick={() =>
                                        copyToClipboard(item.value!, item.label)
                                      }
                                    >
                                      <Copy className="size-4" />
                                    </Button>
                                  </motion.div>
                                )}
                              </motion.div>
                            ))}
                            {selectedDonor.website && (
                              <motion.div
                                variants={fadeInUp}
                                whileHover={{ y: -2 }}
                                className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Globe className="size-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                      Website
                                    </p>
                                    <p className="text-sm font-medium text-zinc-900 truncate">
                                      {selectedDonor.website}
                                    </p>
                                  </div>
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <a
                                    href={
                                      selectedDonor.website.startsWith("http")
                                        ? selectedDonor.website
                                        : `https://${selectedDonor.website}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      buttonVariants({
                                        variant: "ghost",
                                        size: "icon",
                                      }),
                                      "size-9 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-xl shrink-0",
                                    )}
                                  >
                                    <ExternalLink className="size-4" />
                                  </a>
                                </motion.div>
                              </motion.div>
                            )}
                          </motion.div>

                          <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="space-y-4"
                          >
                            <motion.div
                              variants={fadeInUp}
                              whileHover={{ y: -2 }}
                              className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="size-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                                    <Home className="size-4" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                                      Mailing Address
                                    </p>
                                    {selectedDonor.address?.street ? (
                                      <>
                                        {formatAddress(
                                          selectedDonor.address,
                                        ).map((line, i) => (
                                          <p
                                            key={`${line}-${selectedDonor.id}`}
                                            className={cn(
                                              "text-sm",
                                              i === 0
                                                ? "font-medium text-zinc-900"
                                                : "text-zinc-500",
                                            )}
                                          >
                                            {line}
                                          </p>
                                        ))}
                                      </>
                                    ) : (
                                      <p className="text-sm text-zinc-400 italic">
                                        No address on file
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {selectedDonor.address?.street && (
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    <a
                                      href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(selectedDonor.address).join(", "))}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn(
                                        buttonVariants({
                                          variant: "ghost",
                                          size: "icon",
                                        }),
                                        "size-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl shrink-0",
                                      )}
                                    >
                                      <ExternalLink className="size-4" />
                                    </a>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>

                            {(selectedDonor.organization ||
                              selectedDonor.title) && (
                              <motion.div
                                variants={fadeInUp}
                                whileHover={{ y: -2 }}
                                className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="size-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                                    <Building2 className="size-4" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                                      Organization
                                    </p>
                                    {selectedDonor.organization && (
                                      <p className="text-sm font-medium text-zinc-900">
                                        {selectedDonor.organization}
                                      </p>
                                    )}
                                    {selectedDonor.title && (
                                      <p className="text-sm text-zinc-500">
                                        {selectedDonor.title}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                              {selectedDonor.spouse && (
                                <motion.div
                                  variants={fadeInUp}
                                  whileHover={{ y: -2 }}
                                  className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                      <Heart className="size-4" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                        Spouse
                                      </p>
                                      <p className="text-sm font-medium text-zinc-900">
                                        {selectedDonor.spouse}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                              {selectedDonor.birthday && (
                                <motion.div
                                  variants={fadeInUp}
                                  whileHover={{ y: -2 }}
                                  className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                      <Star className="size-4" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                        Birthday
                                      </p>
                                      <p className="text-sm font-medium text-zinc-900">
                                        {format(
                                          parseDisplayDate(
                                            selectedDonor.birthday,
                                          ),
                                          "MMMM d",
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                              {selectedDonor.anniversary && (
                                <motion.div
                                  variants={fadeInUp}
                                  whileHover={{ y: -2 }}
                                  className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                      <Calendar className="size-4" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                        Anniversary
                                      </p>
                                      <p className="text-sm font-medium text-zinc-900">
                                        {format(
                                          parseDisplayDate(
                                            selectedDonor.anniversary,
                                          ),
                                          "MMMM d",
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {selectedDonor.notes && (
                              <motion.div
                                variants={fadeInUp}
                                whileHover={{ y: -2 }}
                                className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100"
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-2">
                                  Internal Notes
                                </p>
                                <p className="text-sm text-zinc-700">
                                  {selectedDonor.notes}
                                </p>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      </TabsContent>

                      <TabsContent value="recurring" className="mt-0 space-y-6">
                        <motion.div
                          {...fadeInUp}
                          transition={smoothTransition}
                          className="flex items-center justify-between mb-2"
                        >
                          <div>
                            <h3 className="text-sm font-semibold text-zinc-900">
                              Recurring Donations
                            </h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Scheduled giving commitments for this partner
                            </p>
                          </div>
                        </motion.div>

                        {selectedDonor.recurring_donations.length === 0 ? (
                          <motion.div
                            {...fadeInUp}
                            className="flex flex-col items-center justify-center py-16 text-center bg-zinc-50 rounded-2xl border border-zinc-100"
                          >
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={springTransition}
                              className="size-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                            >
                              <Repeat className="size-7 text-zinc-300" />
                            </motion.div>
                            <p className="text-sm font-semibold text-zinc-900">
                              No recurring donations
                            </p>
                            <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
                              When this partner sets up a recurring gift, it
                              will appear here with all the details.
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="space-y-4"
                          >
                            {selectedDonor.recurring_donations.map(
                              (recurring, i) => (
                                <motion.div
                                  key={recurring.id}
                                  variants={fadeInUp}
                                  transition={{ delay: i * 0.1 }}
                                  whileHover={{ y: -2 }}
                                  className={cn(
                                    "p-5 rounded-2xl border transition-[color,background-color,border-color,box-shadow,transform,opacity]",
                                    recurring.status === "active"
                                      ? "bg-linear-to-br from-emerald-50/80 to-emerald-50/30 border-emerald-200"
                                      : "bg-zinc-50 border-zinc-200",
                                  )}
                                >
                                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
                                    <div className="flex items-start gap-4">
                                      <motion.div
                                        whileHover={{
                                          scale: 1.1,
                                          rotate: 5,
                                        }}
                                        className={cn(
                                          "size-12 rounded-xl flex items-center justify-center shrink-0",
                                          recurring.status === "active"
                                            ? "bg-emerald-100"
                                            : "bg-zinc-100",
                                        )}
                                      >
                                        {getPaymentMethodIcon(
                                          recurring.payment_method,
                                        )}
                                      </motion.div>
                                      <div>
                                        <div className="flex items-center gap-3 mb-1">
                                          <h4 className="text-xl font-semibold text-zinc-900">
                                            {formatCurrency(
                                              Number(recurring.amount),
                                            )}
                                          </h4>
                                          <span className="text-sm font-medium text-zinc-500">
                                            /{" "}
                                            {recurring.frequency.toLowerCase()}
                                          </span>
                                          {getRecurringStatusBadge(
                                            recurring.status as RecurringStatus,
                                          )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="size-3.5" />
                                            Started{" "}
                                            {format(
                                              parseDisplayDate(
                                                recurring.start_date,
                                              ),
                                              "MMM d, yyyy",
                                            )}
                                          </span>
                                          {recurring.end_date ? (
                                            <span className="flex items-center gap-1 text-amber-600">
                                              <Clock className="size-3.5" />
                                              Ends{" "}
                                              {format(
                                                parseDisplayDate(
                                                  recurring.end_date,
                                                ),
                                                "MMM d, yyyy",
                                              )}
                                            </span>
                                          ) : (
                                            <span className="text-emerald-600">
                                              No end date
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {recurring.status === "active" &&
                                      recurring.next_payment_date && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            scale: 0.9,
                                          }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="bg-white p-3 rounded-xl border border-emerald-100 text-center lg:text-right"
                                        >
                                          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                            Next Payment
                                          </p>
                                          <p className="text-lg font-semibold text-zinc-900">
                                            {format(
                                              parseDisplayDate(
                                                recurring.next_payment_date,
                                              ),
                                              "MMM d",
                                            )}
                                          </p>
                                          <p className="text-xs text-zinc-500">
                                            {formatDistanceToNow(
                                              parseDisplayDate(
                                                recurring.next_payment_date,
                                              ),
                                              { addSuffix: true },
                                            )}
                                          </p>
                                        </motion.div>
                                      )}
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-white/60 rounded-xl border border-zinc-100">
                                    {[
                                      {
                                        label: "Payment Method",
                                        value:
                                          recurring.payment_method || "Online",
                                        icon: true,
                                      },
                                      {
                                        label: "Total Paid",
                                        value: formatCurrency(
                                          Number(recurring.total_paid),
                                        ),
                                        color: "text-emerald-600",
                                      },
                                      {
                                        label: "Expected",
                                        value: formatCurrency(
                                          Number(recurring.total_expected),
                                        ),
                                      },
                                      {
                                        label: "Completed",
                                        value: `${recurring.payments_completed} payments`,
                                      },
                                      {
                                        label: "Remaining",
                                        value:
                                          recurring.payments_remaining > 0
                                            ? `${recurring.payments_remaining} payments`
                                            : "Ongoing",
                                      },
                                    ].map((item) => (
                                      <div key={item.label}>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                                          {item.label}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                          {item.icon &&
                                            getPaymentMethodIcon(
                                              recurring.payment_method,
                                            )}
                                          <p
                                            className={cn(
                                              "text-sm font-semibold",
                                              item.color || "text-zinc-900",
                                            )}
                                          >
                                            {item.value}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="mt-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                                        Progress
                                      </span>
                                      <span className="text-xs font-semibold text-zinc-600">
                                        {Number(recurring.total_expected) > 0
                                          ? `${Math.round((Number(recurring.total_paid) / Number(recurring.total_expected)) * 100)}%`
                                          : "Ongoing"}
                                      </span>
                                    </div>
                                    <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                          width:
                                            Number(recurring.total_expected) > 0
                                              ? `${Math.min((Number(recurring.total_paid) / Number(recurring.total_expected)) * 100, 100)}%`
                                              : "100%",
                                        }}
                                        transition={{
                                          duration: 0.8,
                                          ease: "easeOut",
                                        }}
                                        className={cn(
                                          "h-full rounded-full",
                                          recurring.status === "active"
                                            ? "bg-emerald-500"
                                            : recurring.status === "completed"
                                              ? "bg-blue-500"
                                              : "bg-zinc-400",
                                        )}
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              ),
                            )}
                          </motion.div>
                        )}
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
              <CardContent className="p-16 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={springTransition}
                  className="size-20 rounded-3xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-8"
                >
                  <User className="size-10 text-zinc-200" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-semibold text-2xl text-zinc-900 tracking-tight"
                >
                  Select a Partner
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-2 text-sm font-medium text-zinc-400 max-w-[280px] mx-auto"
                >
                  Choose a donor from the list to view their profile, recurring
                  donations, and giving history.
                </motion.p>
                {profile?.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AddPartnerDialog
                      missionaryId={profile.id}
                      onSuccess={refreshDonors}
                      trigger={
                        <Button className="mt-10 h-11 px-8 rounded-2xl bg-zinc-900 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-zinc-800">
                          <Plus className="size-4 mr-2" /> Add Partner
                        </Button>
                      }
                    />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
