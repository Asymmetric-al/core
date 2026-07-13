"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";

import { useSupportAgents } from "../../hooks/use-support-agents";

interface AssigneeFilterProps {
  value: string;
  onValueChange: (next: string) => void;
}

const ANY_VALUE = "__any__";

/**
 * Assignee filter dropdown. Sentinel "any" maps back to an empty URL value so
 * the URL does not carry a default; "me" and "unassigned" are the named
 * sentinels documented in the route-state contract.
 */
export function AssigneeFilter({ value, onValueChange }: AssigneeFilterProps) {
  const { data: agents } = useSupportAgents();
  const selectValue = value.length === 0 ? ANY_VALUE : value;

  const handleChange = (next: string | null) => {
    if (next === null) {
      return;
    }
    if (next === ANY_VALUE) {
      onValueChange("");
      return;
    }
    onValueChange(next);
  };

  return (
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger
        aria-label="Assignee filter"
        className="h-10 w-[180px] rounded-xl border-zinc-200 bg-white text-[13px] font-medium text-zinc-700"
      >
        <SelectValue placeholder="Any assignee" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value={ANY_VALUE}>Any assignee</SelectItem>
        <SelectItem value="me">Assigned to me</SelectItem>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            <span className="flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarImage src={agent.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {agent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{agent.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
