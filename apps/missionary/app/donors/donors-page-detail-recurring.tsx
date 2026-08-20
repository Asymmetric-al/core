"use client";

import { motion } from "@asym/lib/motion";
import { Progress } from "@asym/ui/components/shadcn/progress";
import { cn } from "@asym/ui/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { Calendar, Clock, Repeat } from "lucide-react";

import {
  formatCurrency,
  getPaymentMethodIcon,
  getRecurringStatusBadge,
} from "./donors-model";
import { parseDisplayDate } from "./donors-page-dates";
import {
  fadeInUp,
  staggerContainer,
  smoothTransition,
  springTransition,
} from "./donors-page-motion";
import { useDonorsPageViewFields } from "./use-donors-page-view";

import type { RecurringStatus } from "./donor-types";

export function DonorsPageDetailRecurring() {
  const view = useDonorsPageViewFields();
  const { selected: selectedDonor } = view.donors;

  if (!selectedDonor) {
    return null;
  }

  return (
    <div className="space-y-6">
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
            When this partner sets up a recurring gift, it will appear here with
            all the details.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {selectedDonor.recurring_donations.map((recurring, i) => {
            const expected = Number(recurring.total_expected);
            const paid = Number(recurring.total_paid);
            const percent =
              expected > 0 ? Math.min((paid / expected) * 100, 100) : 100;

            return (
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
                      {getPaymentMethodIcon(recurring.payment_method)}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-xl font-semibold text-zinc-900">
                          {formatCurrency(Number(recurring.amount))}
                        </h4>
                        <span className="text-sm font-medium text-zinc-500">
                          / {recurring.frequency.toLowerCase()}
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
                            parseDisplayDate(recurring.start_date),
                            "MMM d, yyyy",
                          )}
                        </span>
                        {recurring.end_date ? (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Clock className="size-3.5" />
                            Ends{" "}
                            {format(
                              parseDisplayDate(recurring.end_date),
                              "MMM d, yyyy",
                            )}
                          </span>
                        ) : (
                          <span className="text-emerald-600">No end date</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {recurring.status === "active" &&
                  recurring.next_payment_date ? (
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
                          parseDisplayDate(recurring.next_payment_date),
                          "MMM d",
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDistanceToNow(
                          parseDisplayDate(recurring.next_payment_date),
                          { addSuffix: true },
                        )}
                      </p>
                    </motion.div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-white/60 rounded-xl border border-zinc-100">
                  {[
                    {
                      label: "Payment Method",
                      value: recurring.payment_method || "Online",
                      icon: true,
                    },
                    {
                      label: "Total Paid",
                      value: formatCurrency(Number(recurring.total_paid)),
                      color: "text-emerald-600",
                    },
                    {
                      label: "Expected",
                      value: formatCurrency(Number(recurring.total_expected)),
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
                        {item.icon
                          ? getPaymentMethodIcon(recurring.payment_method)
                          : null}
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
                      {expected > 0 ? `${Math.round(percent)}%` : "Ongoing"}
                    </span>
                  </div>
                  <Progress value={percent} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
