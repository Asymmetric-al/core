import { Badge } from "@asym/ui/components/shadcn/badge";
import { cn } from "@asym/ui/lib/utils";
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

import type { ElementType } from "react";

export type ActivityType =
  | "gift"
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "pledge_started"
  | "pledge_completed";

export type GiftType =
  | "Online"
  | "Check"
  | "Cash"
  | "Bank Transfer"
  | "Stock"
  | "In-Kind";

export type RecurringStatus = "active" | "completed" | "paused" | "cancelled";

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  description?: string;
  amount?: number;
  status?: string;
  gift_type?: GiftType;
  note?: string;
}

export interface RecurringDonation {
  id: string;
  amount: number;
  frequency: string;
  status: RecurringStatus;
  start_date: string;
  end_date?: string;
  next_payment_date?: string;
  total_paid: number;
  total_expected: number;
  payments_completed: number;
  payments_remaining: number;
  payment_method?: string;
}

export interface Address {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface Donor {
  id: string;
  name: string;
  initials: string;
  type: "Individual" | "Organization" | "Church";
  status: "Active" | "Lapsed" | "New" | "At Risk";
  total_given: number;
  last_gift_date: string | null;
  last_gift_amount: number | null;
  frequency: string;
  email: string;
  phone: string;
  mobile?: string;
  work_phone?: string;
  preferred_contact: "email" | "phone" | "text";
  avatar_url?: string;
  location: string;
  address: Address;
  work_address?: Address;
  website?: string;
  organization?: string;
  title?: string;
  joined_date: string;
  birthday?: string;
  anniversary?: string;
  spouse?: string;
  notes?: string;
  tags: string[];
  score: number;
  activities: Activity[];
  recurring_donations: RecurringDonation[];
  has_active_pledge: boolean;
}

export const AVAILABLE_TAGS = [
  {
    id: "major-donor",
    label: "Major Donor",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "monthly-partner",
    label: "Monthly Partner",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "prayer-partner",
    label: "Prayer Partner",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "church-contact",
    label: "Church Contact",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "family",
    label: "Family",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "friend",
    label: "Friend",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  {
    id: "first-time-giver",
    label: "First-Time Giver",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "legacy-giver",
    label: "Legacy Giver",
    color: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  {
    id: "volunteer",
    label: "Volunteer",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    id: "board-member",
    label: "Board Member",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    id: "needs-followup",
    label: "Needs Follow-up",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "lapsed-donor",
    label: "Lapsed Donor",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
] as const;

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-500";
    case "Lapsed":
      return "bg-zinc-400";
    case "New":
      return "bg-blue-500";
    case "At Risk":
      return "bg-amber-500";
    default:
      return "bg-zinc-400";
  }
}

export function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Lapsed: "bg-zinc-100 text-zinc-500 border-zinc-200",
    New: "bg-blue-50 text-blue-700 border-blue-100",
    "At Risk": "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-black border text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full",
        styles[status] || styles.Lapsed,
      )}
    >
      {status}
    </Badge>
  );
}

export function getRecurringStatusBadge(status: RecurringStatus) {
  const styles: Record<RecurringStatus, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    completed: "bg-blue-50 text-blue-700 border-blue-100",
    paused: "bg-amber-50 text-amber-700 border-amber-100",
    cancelled: "bg-zinc-100 text-zinc-500 border-zinc-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-black border text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full",
        styles[status],
      )}
    >
      {status}
    </Badge>
  );
}

export function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "gift":
      return <Heart className="h-3.5 w-3.5 text-white" />;
    case "call":
      return <Phone className="h-3.5 w-3.5 text-white" />;
    case "email":
      return <Mail className="h-3.5 w-3.5 text-white" />;
    case "note":
      return <MessageSquare className="h-3.5 w-3.5 text-white" />;
    case "meeting":
      return <Briefcase className="h-3.5 w-3.5 text-white" />;
    case "pledge_started":
      return <TrendingUp className="h-3.5 w-3.5 text-white" />;
    case "pledge_completed":
      return <Check className="h-3.5 w-3.5 text-white" />;
    default:
      return <Clock className="h-3.5 w-3.5 text-white" />;
  }
}

export function getActivityBg(type: ActivityType) {
  switch (type) {
    case "gift":
      return "bg-rose-500";
    case "call":
      return "bg-blue-500";
    case "email":
      return "bg-purple-500";
    case "note":
      return "bg-zinc-600";
    case "meeting":
      return "bg-emerald-500";
    case "pledge_started":
      return "bg-indigo-500";
    case "pledge_completed":
      return "bg-teal-500";
    default:
      return "bg-zinc-400";
  }
}

export function getGiftTypeIcon(type: GiftType | string | undefined) {
  switch (type) {
    case "Online":
      return <CreditCard className="h-3.5 w-3.5" />;
    case "Check":
      return <Mail className="h-3.5 w-3.5" />;
    case "Cash":
      return <DollarSign className="h-3.5 w-3.5" />;
    case "Bank Transfer":
      return <Building2 className="h-3.5 w-3.5" />;
    case "Stock":
      return <TrendingUp className="h-3.5 w-3.5" />;
    case "In-Kind":
      return <Gift className="h-3.5 w-3.5" />;
    default:
      return <DollarSign className="h-3.5 w-3.5" />;
  }
}

export function getPaymentMethodIcon(method: string | undefined) {
  switch (method) {
    case "Online":
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case "Check":
      return <Mail className="h-4 w-4 text-zinc-500" />;
    case "Cash":
      return <DollarSign className="h-4 w-4 text-emerald-500" />;
    case "Bank Transfer":
      return <Building2 className="h-4 w-4 text-indigo-500" />;
    default:
      return <CreditCard className="h-4 w-4 text-zinc-400" />;
  }
}

export function getTagStyle(tagId: string) {
  const tag = AVAILABLE_TAGS.find((candidate) => candidate.id === tagId);
  return tag?.color || "bg-zinc-100 text-zinc-600 border-zinc-200";
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
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  to_do: {
    label: "To-do",
    icon: CheckCircle2,
    color: "text-zinc-600",
    bgColor: "bg-zinc-100",
  },
  follow_up: {
    label: "Follow Up",
    icon: User,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  thank_you: {
    label: "Thank You",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
};
