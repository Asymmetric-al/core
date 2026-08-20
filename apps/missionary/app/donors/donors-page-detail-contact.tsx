"use client";

import { motion } from "@asym/lib/motion";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";
import {
  Mail,
  Phone,
  MessageSquare,
  Copy,
  ExternalLink,
  Pencil,
  Calendar,
  Briefcase,
  Building2,
  Globe,
  Star,
  Home,
  Heart,
} from "lucide-react";

import { parseDisplayDate } from "./donors-page-dates";
import {
  fadeInUp,
  staggerContainer,
  smoothTransition,
} from "./donors-page-motion";
import { useDonorsPageViewFields } from "./use-donors-page-view";

export const CONTACT_COLOR_CLASSES = {
  blue: {
    surface: "bg-blue-50 text-blue-600",
    action: "text-zinc-400 hover:text-blue-600 hover:bg-blue-50",
  },
  emerald: {
    surface: "bg-emerald-50 text-emerald-600",
    action: "text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50",
  },
  purple: {
    surface: "bg-purple-50 text-purple-600",
    action: "text-zinc-400 hover:text-purple-600 hover:bg-purple-50",
  },
  zinc: {
    surface: "bg-zinc-50 text-zinc-600",
    action: "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50",
  },
} as const;

type ContactColor = keyof typeof CONTACT_COLOR_CLASSES;

export function DonorsPageDetailContact() {
  const view = useDonorsPageViewFields();
  const { selected: selectedDonor } = view.donors;
  const { editDialog } = view;
  const { copyToClipboard, formatAddress } = view.actions;

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
        <h3 className="text-sm font-semibold text-zinc-900">
          Contact Information
        </h3>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={editDialog.open}
            className="h-8 px-3 text-xs rounded-xl border-zinc-200"
          >
            <Pencil data-icon="inline-start" /> Edit
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
          {(
            [
              {
                icon: Mail,
                label: "Email",
                value: selectedDonor.email,
                preferred: selectedDonor.preferred_contact === "email",
                color: "blue",
              },
              {
                icon: Phone,
                label: "Primary Phone",
                value: selectedDonor.phone,
                preferred: selectedDonor.preferred_contact === "phone",
                color: "emerald",
              },
              {
                icon: MessageSquare,
                label: "Mobile / Text",
                value: selectedDonor.mobile,
                preferred: selectedDonor.preferred_contact === "text",
                color: "purple",
              },
              {
                icon: Briefcase,
                label: "Work Phone",
                value: selectedDonor.work_phone,
                preferred: false,
                color: "zinc",
              },
            ] as const satisfies ReadonlyArray<{
              icon: typeof Mail;
              label: string;
              value: string | undefined;
              preferred?: boolean;
              color: ContactColor;
            }>
          ).map((item, i) => (
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
                    CONTACT_COLOR_CLASSES[item.color].surface,
                  )}
                >
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      {item.label}
                    </p>
                    {item.preferred ? (
                      <Badge
                        className={cn(
                          CONTACT_COLOR_CLASSES[item.color].surface,
                          "border-0 text-[8px] font-semibold uppercase tracking-widest px-1.5 py-0",
                        )}
                      >
                        Preferred
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {item.value || "Not provided"}
                  </p>
                </div>
              </div>
              {item.value ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-9 rounded-xl shrink-0",
                      CONTACT_COLOR_CLASSES[item.color].action,
                    )}
                    onClick={() => copyToClipboard(item.value!, item.label)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </motion.div>
              ) : null}
            </motion.div>
          ))}
          {selectedDonor.website ? (
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
          ) : null}
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
                      {formatAddress(selectedDonor.address).map((line, i) => (
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
              {selectedDonor.address?.street ? (
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
              ) : null}
            </div>
          </motion.div>

          {selectedDonor.organization || selectedDonor.title ? (
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
                  {selectedDonor.organization ? (
                    <p className="text-sm font-medium text-zinc-900">
                      {selectedDonor.organization}
                    </p>
                  ) : null}
                  {selectedDonor.title ? (
                    <p className="text-sm text-zinc-500">
                      {selectedDonor.title}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            {selectedDonor.spouse ? (
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
            ) : null}
            {selectedDonor.birthday ? (
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
                        parseDisplayDate(selectedDonor.birthday),
                        "MMMM d",
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
            {selectedDonor.anniversary ? (
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
                        parseDisplayDate(selectedDonor.anniversary),
                        "MMMM d",
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>

          {selectedDonor.notes ? (
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -2 }}
              className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-2">
                Internal Notes
              </p>
              <p className="text-sm text-zinc-700">{selectedDonor.notes}</p>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
