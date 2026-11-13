"use client";

import { useMC } from "@asym/lib/mission-control/context";
import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { TILES } from "@asym/lib/mission-control/tiles";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import Link from "next/link";

import { getIcon } from "../icon-map";

const ROLE_QUICK_ACTIONS: Record<
  string,
  { tileId: string; actionIndex: number }[]
> = {
  finance: [
    { tileId: "contributions", actionIndex: 0 },
    { tileId: "admin", actionIndex: 0 },
    { tileId: "reports", actionIndex: 0 },
    { tileId: "pdf", actionIndex: 0 },
  ],
  fundraising: [
    { tileId: "crm", actionIndex: 0 },
    { tileId: "email", actionIndex: 0 },
    { tileId: "crm", actionIndex: 2 },
    { tileId: "reports", actionIndex: 0 },
  ],
  mobilizers: [
    { tileId: "mobilize", actionIndex: 0 },
    { tileId: "crm", actionIndex: 0 },
    { tileId: "automations", actionIndex: 0 },
    { tileId: "tasks", actionIndex: 0 },
  ],
  member_care: [
    { tileId: "care", actionIndex: 0 },
    { tileId: "care", actionIndex: 1 },
    { tileId: "support", actionIndex: 0 },
    { tileId: "crm", actionIndex: 0 },
  ],
  // Events itself is not connected yet, so its staff start in giving.
  events: [
    { tileId: "contributions", actionIndex: 0 },
    { tileId: "reports", actionIndex: 0 },
    { tileId: "crm", actionIndex: 0 },
    { tileId: "tasks", actionIndex: 0 },
  ],
  staff: [
    { tileId: "crm", actionIndex: 0 },
    { tileId: "crm", actionIndex: 1 },
    { tileId: "crm", actionIndex: 2 },
    { tileId: "web-studio", actionIndex: 0 },
  ],
  admin: [
    { tileId: "crm", actionIndex: 0 },
    { tileId: "contributions", actionIndex: 0 },
    { tileId: "reports", actionIndex: 0 },
    { tileId: "admin", actionIndex: 0 },
  ],
};

export function QuickActionsRow() {
  const { role } = useMC();
  const actionRefs = ROLE_QUICK_ACTIONS[role] ?? ROLE_QUICK_ACTIONS.staff ?? [];

  const actions = actionRefs
    .flatMap(({ tileId, actionIndex }) => {
      const tile = TILES.find((t) => t.id === tileId);
      if (!tile || tile.unavailableReason || !tile.roles.includes(role))
        return [];
      const action = tile.quickActions[actionIndex];
      if (!action || (action.roles && !action.roles.includes(role))) return [];
      return [{ ...action, tile }];
    })
    .slice(0, 4);

  return (
    <div className="flex flex-wrap gap-4">
      {actions.map((action) => {
        const Icon = action.icon ? getIcon(action.icon) : null;
        return (
          <Link
            key={`${action.tile.id}-${action.label}`}
            href={resolveMissionControlHref(action.href)}
            className={buttonVariants({ variant: "outline" })}
          >
            {Icon && <Icon aria-hidden="true" data-icon="inline-start" />}
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
