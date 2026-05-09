"use client";

import {
  Building2,
  ExternalLink,
  Heart,
  Receipt,
  Sparkles,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

import type { SupportContactRef } from "../../types";

interface ConversationCrmLink {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Tooltip / aria-label content shown to assistive tech. */
  description: string;
}

interface ConversationCrmLinksProps {
  contact: SupportContactRef | null;
  donorEmail?: string | null;
}

/**
 * Renders the CRM-ready deep-link chips below the donor identity block.
 * Phase 7 keeps these intentionally light — every chip points at an
 * existing Mission Control route (`/crm`, `/contributions`) using a query
 * filter so the chip is safe even before CRM linkage is fully populated.
 *
 * Phase 8 will swap these for typed `/{section}/{id}` deep-links once the
 * underlying detail routes ship; the helper keeps the contract identical.
 */
export function ConversationCrmLinks({
  contact,
  donorEmail,
}: ConversationCrmLinksProps) {
  const links = buildCrmLinks(contact, donorEmail ?? null);
  if (links.length === 0) return null;
  return (
    <ul
      className="mt-2 flex flex-wrap items-center gap-1.5"
      aria-label="CRM cross-references"
    >
      {links.map((link) => (
        <li key={link.key}>
          <Link
            href={link.href}
            prefetch={false}
            aria-label={link.description}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:border-zinc-200 hover:text-zinc-900"
          >
            {link.icon}
            {link.label}
            <ExternalLink className="size-3 text-zinc-400" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function buildCrmLinks(
  contact: SupportContactRef | null,
  donorEmail: string | null,
): ConversationCrmLink[] {
  const links: ConversationCrmLink[] = [];

  if (contact?.contactId) {
    links.push({
      key: "contact",
      label: "Profile",
      href: `/crm?contact=${encodeURIComponent(contact.contactId)}`,
      icon: <UserPlus className="size-3 text-zinc-500" />,
      description: `Open CRM profile ${contact.contactId}`,
    });
  } else if (donorEmail) {
    links.push({
      key: "contact-search",
      label: "Find in CRM",
      href: `/crm?email=${encodeURIComponent(donorEmail)}`,
      icon: <UserPlus className="size-3 text-zinc-500" />,
      description: `Search CRM for ${donorEmail}`,
    });
  }

  if (contact?.donorId) {
    links.push({
      key: "donor",
      label: "Donor",
      href: `/contributions?donor=${encodeURIComponent(contact.donorId)}`,
      icon: <Heart className="size-3 text-rose-400" />,
      description: `Open donor giving history for ${contact.donorId}`,
    });
  }

  if (contact?.contributionId) {
    links.push({
      key: "gift",
      label: "Gift",
      href: `/contributions?contribution=${encodeURIComponent(contact.contributionId)}`,
      icon: <Receipt className="size-3 text-amber-500" />,
      description: `Open contribution ${contact.contributionId}`,
    });
  }

  if (contact?.missionaryId) {
    links.push({
      key: "missionary",
      label: "Missionary",
      href: `/crm?missionary=${encodeURIComponent(contact.missionaryId)}`,
      icon: <Sparkles className="size-3 text-violet-500" />,
      description: `Open missionary ${contact.missionaryId}`,
    });
  }

  if (contact?.churchId) {
    links.push({
      key: "church",
      label: "Church",
      href: `/crm?church=${encodeURIComponent(contact.churchId)}`,
      icon: <Building2 className="size-3 text-zinc-500" />,
      description: `Open church ${contact.churchId}`,
    });
  }

  return links;
}
