"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";

import {
  SUPPORT_CONVERSATION_STATUSES,
  type SupportConversationStatus,
} from "../../types";

type StatusFilterValue = SupportConversationStatus | "all";

interface StatusFilterProps {
  value: StatusFilterValue;
  onValueChange: (next: StatusFilterValue) => void;
}

const STATUS_LABELS: Record<StatusFilterValue, string> = {
  all: "All statuses",
  open: "Open",
  pending: "Pending",
  snoozed: "Snoozed",
  resolved: "Resolved",
};

export function StatusFilter({ value, onValueChange }: StatusFilterProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as StatusFilterValue)}
    >
      <SelectTrigger
        aria-label="Status filter"
        className="h-10 w-[160px] rounded-xl border-zinc-200 bg-white text-[13px] font-medium text-zinc-700"
      >
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="all">{STATUS_LABELS.all}</SelectItem>
        {SUPPORT_CONVERSATION_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
