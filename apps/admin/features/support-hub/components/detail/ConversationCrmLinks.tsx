"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { buildCrmLinks } from "./conversation-crm-links";

import type { SupportContactRef } from "../../types";

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
