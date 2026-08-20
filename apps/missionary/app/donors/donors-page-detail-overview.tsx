"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";
import {
  Phone,
  MessageSquare,
  Send,
  Calendar,
  Briefcase,
  Loader2,
} from "lucide-react";

import {
  formatCurrency,
  getActivityBg,
  getActivityIcon,
  getGiftTypeIcon,
} from "./donors-model";
import { parseDisplayDate } from "./donors-page-dates";
import {
  fadeInUp,
  smoothTransition,
  springTransition,
} from "./donors-page-motion";
import { useDonorsPageViewFields } from "./use-donors-page-view";

import type { DonorActivityType } from "./donor-mutation-client";
import type { ActivityType } from "./donor-types";

export function DonorsPageDetailOverview() {
  const view = useDonorsPageViewFields();
  const { selected: selectedDonor } = view.donors;
  const { noteComposer } = view;

  if (!selectedDonor) {
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.div
        {...fadeInUp}
        transition={smoothTransition}
        className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="overview-activity-note" className="sr-only">
              Activity note
            </FieldLabel>
            <Textarea
              id="overview-activity-note"
              placeholder="Log a call, meeting notes, or observation..."
              className="min-h-[80px] border-none bg-white focus:ring-0 resize-none text-sm p-3 rounded-xl shadow-sm"
              value={noteComposer.noteInput}
              onChange={(e) => noteComposer.setNoteInput(e.target.value)}
            />
          </Field>
        </FieldGroup>
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
                    noteComposer.setActivityType(type as DonorActivityType)
                  }
                >
                  <Icon data-icon="inline-start" />{" "}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              </motion.div>
            ))}
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              className="h-8 rounded-xl px-4 text-[10px] font-semibold uppercase tracking-widest"
              onClick={noteComposer.save}
              disabled={!noteComposer.noteInput.trim() || noteComposer.isSaving}
            >
              {noteComposer.isSaving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <>
                  Post <Send data-icon="inline-end" />
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
                    getActivityBg(activity.type as ActivityType),
                  )}
                >
                  {getActivityIcon(activity.type as ActivityType)}
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
                        {activity.amount ? (
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
                        ) : null}
                        {activity.gift_type ? (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                            {getGiftTypeIcon(activity.gift_type)}
                            {activity.gift_type}
                          </span>
                        ) : null}
                        {activity.status === "Failed" ? (
                          <Badge className="bg-rose-50 text-rose-600 border-0 text-[9px] font-semibold uppercase tracking-widest">
                            Failed
                          </Badge>
                        ) : null}
                      </div>
                      {activity.description ? (
                        <p className="text-sm text-zinc-500 leading-relaxed">
                          {activity.description}
                        </p>
                      ) : null}
                      {activity.note ? (
                        <p className="text-xs text-zinc-400 italic">
                          {activity.note}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                      {format(parseDisplayDate(activity.date), "MMM d, yyyy")}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
