import {
  SHARED_PAYMENT_STATUS_LABELS,
  SHARED_RECEIPT_STATUS_LABELS,
  type SharedContributionReceiptStatus,
} from "@asym/api/admin/contribution-shared";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { cn } from "@asym/ui/lib/utils";
import {
  CircleCheck,
  CircleDashed,
  Clock,
  LoaderCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type { ContributionStatus } from "./types";
import type { ComponentProps } from "react";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

/**
 * One status vocabulary for every contribution surface: the hub grid, the
 * mobile cards and the detail sheet render the same badge for a status.
 */
export const CONTRIBUTION_STATUS_PRESENTATION: Record<
  ContributionStatus,
  { icon: typeof CircleCheck; variant: BadgeVariant; label: string }
> = {
  completed: {
    icon: CircleCheck,
    variant: "success",
    label: SHARED_PAYMENT_STATUS_LABELS.completed,
  },
  pending: {
    icon: Clock,
    variant: "warning",
    label: SHARED_PAYMENT_STATUS_LABELS.pending,
  },
  processing: { icon: LoaderCircle, variant: "info", label: "Processing" },
  failed: {
    icon: XCircle,
    variant: "destructive-subtle",
    label: SHARED_PAYMENT_STATUS_LABELS.failed,
  },
  refunded: {
    icon: RotateCcw,
    variant: "outline",
    label: SHARED_PAYMENT_STATUS_LABELS.refunded,
  },
};

export function ContributionStatusBadge({
  status,
}: {
  status: ContributionStatus;
}) {
  const presentation =
    CONTRIBUTION_STATUS_PRESENTATION[status] ??
    CONTRIBUTION_STATUS_PRESENTATION.pending;
  const Icon = presentation.icon;
  return (
    <Badge variant={presentation.variant}>
      <Icon aria-hidden="true" />
      {presentation.label}
    </Badge>
  );
}

const RECEIPT_PRESENTATION: Record<
  SharedContributionReceiptStatus,
  { icon: typeof CircleCheck; className: string }
> = {
  sent: { icon: CircleCheck, className: "text-success" },
  pending: { icon: Clock, className: "text-muted-foreground" },
  failed: { icon: XCircle, className: "text-destructive" },
  not_sent: { icon: CircleDashed, className: "text-muted-foreground" },
};

/** Receipt state as quiet icon + text, so a row keeps one status badge. */
export function ContributionReceiptStatus({
  status,
  label = SHARED_RECEIPT_STATUS_LABELS[status],
}: {
  status: SharedContributionReceiptStatus;
  label?: string;
}) {
  const presentation = RECEIPT_PRESENTATION[status];
  const Icon = presentation.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-foreground">
      <Icon
        aria-hidden="true"
        className={cn("size-3.5 shrink-0", presentation.className)}
      />
      {label}
    </span>
  );
}
