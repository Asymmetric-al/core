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
    surface: "bg-accent text-primary",
    action: "text-muted-foreground hover:text-primary hover:bg-accent",
  },
  emerald: {
    surface: "bg-primary/10 text-primary",
    action: "text-muted-foreground hover:text-primary hover:bg-primary/10",
  },
  purple: {
    surface: "bg-accent text-primary",
    action: "text-muted-foreground hover:text-primary hover:bg-accent",
  },
  zinc: {
    surface: "bg-muted text-muted-foreground",
    action: "text-muted-foreground hover:text-muted-foreground hover:bg-muted",
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
    <div className="flex flex-col gap-6">
      <motion.div
        {...fadeInUp}
        transition={smoothTransition}
        className="flex items-center justify-between mb-2"
      >
        <h3 className="text-sm font-semibold text-foreground">
          Contact Information
        </h3>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={editDialog.open}
            disabled={selectedDonor.is_anonymous}
            className="h-8 px-3 text-xs rounded-xl border-border"
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
          className="flex flex-col gap-3"
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
              className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border group hover:border-border transition-[color,background-color,border-color,box-shadow,transform,opacity]"
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
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                  <p className="text-sm font-medium text-foreground truncate">
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
                    aria-label={`Copy ${item.label}`}
                    onClick={() => copyToClipboard(item.value!, item.label)}
                  >
                    <Copy data-icon="inline-start" />
                  </Button>
                </motion.div>
              ) : null}
            </motion.div>
          ))}
          {selectedDonor.website ? (
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -2 }}
              className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border group hover:border-border transition-[color,background-color,border-color,box-shadow,transform,opacity]"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Globe className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Website
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedDonor.website}
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.97 }}
              >
                <a
                  aria-label="Open partner website"
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
                    "size-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl shrink-0",
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
          className="flex flex-col gap-4"
        >
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -2 }}
            className="p-4 bg-muted rounded-2xl border border-border"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <Home className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
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
                              ? "font-medium text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {line}
                        </p>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
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
                    aria-label="Open partner address in maps"
                    href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(selectedDonor.address).join(", "))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        size: "icon",
                      }),
                      "size-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl shrink-0",
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
              className="p-4 bg-muted rounded-2xl border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    Organization
                  </p>
                  {selectedDonor.organization ? (
                    <p className="text-sm font-medium text-foreground">
                      {selectedDonor.organization}
                    </p>
                  ) : null}
                  {selectedDonor.title ? (
                    <p className="text-sm text-muted-foreground">
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
                className="p-4 bg-muted rounded-2xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                    <Heart className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Spouse
                    </p>
                    <p className="text-sm font-medium text-foreground">
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
                className="p-4 bg-muted rounded-2xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <Star className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Birthday
                    </p>
                    <p className="text-sm font-medium text-foreground">
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
                className="p-4 bg-muted rounded-2xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Anniversary
                    </p>
                    <p className="text-sm font-medium text-foreground">
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
              className="p-4 bg-muted/50 rounded-2xl border border-border"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Internal Notes
              </p>
              <p className="text-sm text-foreground">{selectedDonor.notes}</p>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
