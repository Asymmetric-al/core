"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@asym/ui/components/shadcn/empty";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";
import { Phone, MessageSquare, Send, Calendar, Briefcase } from "lucide-react";

import {
  formatCurrency,
  getActivityBg,
  getActivityIcon,
  getGiftTypeIcon,
} from "./donors-model";
import { parseDisplayDate } from "./donors-page-dates";
import { fadeInUp, smoothTransition } from "./donors-page-motion";
import { useDonorsPageViewFields } from "./use-donors-page-view";

import type { ActivityType } from "./donor-types";

export function DonorsPageDetailOverview() {
  const view = useDonorsPageViewFields();
  const { selected: selectedDonor } = view.donors;
  const { noteComposer } = view;

  if (!selectedDonor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        {...fadeInUp}
        transition={smoothTransition}
        className="bg-muted p-4 rounded-2xl border border-border"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="overview-activity-note" className="sr-only">
              Activity note
            </FieldLabel>
            <Textarea
              id="overview-activity-note"
              placeholder="Log a call, meeting notes, or observation..."
              className="min-h-[80px] border-none bg-card focus:ring-0 resize-none text-sm p-3 rounded-xl shadow-sm"
              value={noteComposer.noteInput}
              onChange={(e) => noteComposer.setNoteInput(e.target.value)}
            />
          </Field>
        </FieldGroup>
        <div className="flex flex-wrap justify-between items-center gap-3 mt-3 pt-3 border-t border-border">
          <ToggleGroup
            aria-label="Activity type"
            className="flex-wrap"
            value={[noteComposer.activityType]}
            onValueChange={(value) => {
              const next = value[0];
              if (next === "call" || next === "meeting" || next === "note")
                noteComposer.setActivityType(next);
            }}
            size="sm"
            variant="outline"
          >
            <ToggleGroupItem value="call">
              <Phone data-icon="inline-start" />
              Call
            </ToggleGroupItem>
            <ToggleGroupItem value="meeting">
              <Briefcase data-icon="inline-start" />
              Meeting
            </ToggleGroupItem>
            <ToggleGroupItem value="note">
              <MessageSquare data-icon="inline-start" />
              Note
            </ToggleGroupItem>
          </ToggleGroup>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              className="h-8 rounded-xl px-4 text-[10px] font-semibold uppercase tracking-widest"
              onClick={noteComposer.save}
              disabled={!noteComposer.noteInput.trim() || noteComposer.isSaving}
            >
              {noteComposer.isSaving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <>
                  Post <Send data-icon="inline-end" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4 relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

        {selectedDonor.activities.length === 0 ? (
          <Empty className="ml-8 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar />
              </EmptyMedia>
              <EmptyTitle>No activity recorded yet</EmptyTitle>
              <EmptyDescription>
                Start by logging your first interaction
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
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

                <motion.div className="hover-lift bg-card p-4 rounded-2xl border border-border hover:border-border transition-[color,background-color,border-color,box-shadow,transform,opacity]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {activity.title}
                        </span>
                        {activity.amount ? (
                          <Badge
                            className={cn(
                              "font-semibold px-2 h-5 rounded-lg text-[9px] uppercase tracking-widest border-0",
                              activity.status === "Failed"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {formatCurrency(activity.amount)}
                          </Badge>
                        ) : null}
                        {activity.gift_type ? (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                            {getGiftTypeIcon(activity.gift_type)}
                            {activity.gift_type}
                          </span>
                        ) : null}
                        {activity.status === "Failed" ? (
                          <Badge className="bg-destructive/10 text-destructive border-0 text-[9px] font-semibold uppercase tracking-widest">
                            Failed
                          </Badge>
                        ) : null}
                      </div>
                      {activity.description ? (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activity.description}
                        </p>
                      ) : null}
                      {activity.note ? (
                        <p className="text-xs text-muted-foreground italic">
                          {activity.note}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
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
