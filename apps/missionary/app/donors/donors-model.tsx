import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Gift,
  Heart,
  Mail,
  MessageSquare,
  Phone,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

import type { ActivityType, GiftType, RecurringStatus } from "./donor-types";
import type { ElementType } from "react";

const NUMBER_FORMATTER_1 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export type {
  Activity,
  ActivityType,
  Address,
  Donor,
  GiftType,
  RecurringDonation,
  RecurringStatus,
} from "./donor-types";

export const AVAILABLE_TAGS = [
  {
    id: "major-donor",
    label: "Major Donor",
    variant: "info",
    color: "bg-info/10 text-info border-info/20",
  },
  {
    id: "monthly-partner",
    label: "Monthly Partner",
    variant: "success",
    color: "bg-success/10 text-success border-success/20",
  },
  {
    id: "prayer-partner",
    label: "Prayer Partner",
    variant: "info",
    color: "bg-info/10 text-info border-info/20",
  },
  {
    id: "church-contact",
    label: "Church Contact",
    variant: "info",
    color: "bg-info/10 text-info border-info/20",
  },
  {
    id: "family",
    label: "Family",
    variant: "secondary",
    color: "bg-muted text-muted-foreground border-border",
  },
  {
    id: "friend",
    label: "Friend",
    variant: "secondary",
    color: "bg-muted text-muted-foreground border-border",
  },
  {
    id: "first-time-giver",
    label: "First-Time Giver",
    variant: "info",
    color: "bg-info/10 text-info border-info/20",
  },
  {
    id: "legacy-giver",
    label: "Legacy Giver",
    variant: "secondary",
    color: "bg-muted text-muted-foreground border-border",
  },
  {
    id: "volunteer",
    label: "Volunteer",
    variant: "info",
    color: "bg-info/10 text-info border-info/20",
  },
  {
    id: "board-member",
    label: "Board Member",
    variant: "secondary",
    color: "bg-muted text-muted-foreground border-border",
  },
  {
    id: "needs-followup",
    label: "Needs Follow-up",
    variant: "warning",
    color: "bg-warning/10 text-warning border-warning/20",
  },
  {
    id: "lapsed-donor",
    label: "Lapsed Donor",
    variant: "secondary",
    color: "bg-muted text-muted-foreground border-border",
  },
] as const;

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "$0";

  return NUMBER_FORMATTER_1.format(value);
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-success";
    case "Lapsed":
      return "bg-muted-foreground";
    case "New":
      return "bg-info";
    case "At Risk":
      return "bg-warning";
    default:
      return "bg-muted-foreground";
  }
}

type StatusBadgeVariant = "success" | "info" | "warning" | "secondary";

export function getStatusBadge(status: string) {
  const variants: Record<string, StatusBadgeVariant> = {
    Active: "success",
    Lapsed: "secondary",
    New: "info",
    "At Risk": "warning",
  };

  return <Badge variant={variants[status] ?? "secondary"}>{status}</Badge>;
}

export function getRecurringStatusBadge(status: RecurringStatus) {
  const variants: Record<RecurringStatus, StatusBadgeVariant> = {
    active: "success",
    completed: "info",
    paused: "warning",
    cancelled: "secondary",
  };

  return <Badge variant={variants[status]}>{status}</Badge>;
}

export function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "gift":
      return <Heart className="size-3.5" />;
    case "call":
      return <Phone className="size-3.5" />;
    case "email":
      return <Mail className="size-3.5" />;
    case "note":
      return <MessageSquare className="size-3.5" />;
    case "meeting":
      return <Briefcase className="size-3.5" />;
    case "pledge_started":
      return <TrendingUp className="size-3.5" />;
    case "pledge_completed":
      return <Check className="size-3.5" />;
    default:
      return <Clock className="size-3.5" />;
  }
}

export function getActivityBg(type: ActivityType) {
  switch (type) {
    case "gift":
      return "bg-info text-info-foreground";
    case "call":
      return "bg-info text-info-foreground";
    case "email":
      return "bg-info text-info-foreground";
    case "note":
      return "bg-muted text-muted-foreground";
    case "meeting":
      return "bg-success text-success-foreground";
    case "pledge_started":
      return "bg-info text-info-foreground";
    case "pledge_completed":
      return "bg-success text-success-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getGiftTypeIcon(type: GiftType | string | undefined) {
  switch (type) {
    case "Online":
      return <CreditCard className="size-3.5" />;
    case "Check":
      return <Mail className="size-3.5" />;
    case "Cash":
      return <DollarSign className="size-3.5" />;
    case "Bank Transfer":
      return <Building2 className="size-3.5" />;
    case "Stock":
      return <TrendingUp className="size-3.5" />;
    case "In-Kind":
      return <Gift className="size-3.5" />;
    default:
      return <DollarSign className="size-3.5" />;
  }
}

export function getPaymentMethodIcon(method: string | undefined) {
  switch (method) {
    case "Online":
      return <CreditCard className="size-4 text-info" />;
    case "Check":
      return <Mail className="size-4 text-muted-foreground" />;
    case "Cash":
      return <DollarSign className="size-4 text-success" />;
    case "Bank Transfer":
      return <Building2 className="size-4 text-primary" />;
    default:
      return <CreditCard className="size-4 text-muted-foreground" />;
  }
}

export function getTagStyle(tagId: string) {
  const tag = AVAILABLE_TAGS.find((candidate) => candidate.id === tagId);
  return tag?.color || "bg-muted text-muted-foreground border-border";
}

export function getTagVariant(tagId: string): StatusBadgeVariant {
  return AVAILABLE_TAGS.find((tag) => tag.id === tagId)?.variant ?? "secondary";
}

export function getTagLabel(tagId: string) {
  const tag = AVAILABLE_TAGS.find((candidate) => candidate.id === tagId);

  return (
    tag?.label ||
    tagId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export const TASK_TYPE_CONFIG: Record<
  string,
  { label: string; icon: ElementType; color: string; bgColor: string }
> = {
  call: {
    label: "Call",
    icon: Phone,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  to_do: {
    label: "To-do",
    icon: CheckCircle2,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  follow_up: {
    label: "Follow Up",
    icon: User,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  thank_you: {
    label: "Thank You",
    icon: Heart,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    color: "text-info",
    bgColor: "bg-info/10",
  },
};
