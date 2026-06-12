"use client";

import { motion, useReducedMotion } from "@asym/lib/motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";
import {
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  TASK_TYPE_CONFIG,
  PRIORITY_CONFIG,
  getDueDateStatus,
  smoothTransition,
} from "./task-config";

import type { Task } from "../../types";

interface TaskRowProps {
  task: Task;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

export function TaskRow({
  task,
  onComplete,
  onEdit,
  onDelete,
  index,
}: TaskRowProps) {
  const reduceMotion = useReducedMotion();
  const typeConfig = TASK_TYPE_CONFIG[task.task_type];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const dueDateStatus = getDueDateStatus(task.due_date);
  const isCompleted = task.status === "completed";
  const Icon = typeConfig.icon;

  // Stagger entrance only — no per-row `layout` (was causing the
  // CSS+JS double grammar with the hover lift); hover lift moves to
  // the touch-safe `hover-lift` utility; no per-element whileTap on
  // the checkbox.
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { ...smoothTransition, delay: Math.min(index, 6) * 0.02 }
      }
      className={cn(
        "relative group flex items-start gap-5 p-6 border rounded-[2rem]",
        "transition-[border-color,box-shadow] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)]",
        isCompleted
          ? "bg-[oklch(0.985_0.002_265)]/50 border-[oklch(0.915_0.003_265)] opacity-75"
          : "bg-white border-[oklch(0.915_0.003_265)] hover-lift hover:border-[oklch(0.205_0.015_265)] hover:shadow-xl",
      )}
    >
      <div className="mt-1.5 relative z-10">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onComplete}
          className="size-6 rounded-lg border-[oklch(0.915_0.003_265)] data-checked:bg-[oklch(0.205_0.015_265)] data-checked:border-[oklch(0.205_0.015_265)] transition-colors cursor-pointer"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {task.is_auto_generated && (
                <Badge className="bg-[oklch(0.205_0.015_265)] text-white border-0 text-[8px] font-black uppercase tracking-[0.2em] px-2 h-5 rounded-full">
                  Automated
                </Badge>
              )}
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                  typeConfig.color,
                  "bg-white",
                )}
              >
                <Icon className="size-3" />
                {typeConfig.label}
              </div>
            </div>

            <h3
              className={cn(
                "text-lg font-black tracking-tight leading-tight",
                isCompleted
                  ? "line-through text-[oklch(0.45_0.008_265)]"
                  : "text-[oklch(0.145_0.015_265)]",
              )}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={cn(
                  "text-sm font-medium mt-1 line-clamp-2 transition-colors",
                  isCompleted
                    ? "text-[oklch(0.708_0.01_265)]"
                    : "text-[oklch(0.45_0.008_265)]",
                )}
              >
                {task.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 text-[oklch(0.915_0.003_265)] hover:text-[oklch(0.145_0.015_265)] hover:bg-[oklch(0.965_0.003_265)] rounded-xl"
                />
              }
            >
              <MoreHorizontal className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-2xl border-[oklch(0.915_0.003_265)] p-2 shadow-2xl min-w-[180px]"
            >
              <DropdownMenuItem
                onClick={onEdit}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 cursor-pointer"
              >
                <Pencil className="mr-3 size-4 text-[oklch(0.45_0.008_265)]" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onComplete}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 cursor-pointer"
              >
                <CheckCircle2 className="mr-3 size-4 text-[oklch(0.45_0.008_265)]" />
                {isCompleted ? "Reopen Task" : "Mark Complete"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-[oklch(0.965_0.003_265)]" />
              <DropdownMenuItem
                onClick={onDelete}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 text-[oklch(0.55_0.2_25)] focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="mr-3 size-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {task.donor && (
            <Link href={`/donors?selected=${task.donor.id}`}>
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[oklch(0.985_0.002_265)] border border-[oklch(0.915_0.003_265)] hover:bg-white hover:border-[oklch(0.205_0.015_265)] transition-colors cursor-pointer group/donor">
                <Avatar className="size-5 border-2 border-white shadow-sm">
                  <AvatarImage src={task.donor.avatar_url || undefined} />
                  <AvatarFallback className="text-[8px] font-black bg-[oklch(0.915_0.003_265)] text-[oklch(0.45_0.008_265)]">
                    {task.donor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-black text-[oklch(0.45_0.008_265)] uppercase tracking-widest group-hover/donor:text-[oklch(0.145_0.015_265)] transition-colors">
                  {task.donor.name}
                </span>
              </div>
            </Link>
          )}

          {dueDateStatus && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-sm",
                dueDateStatus.color.includes("rose")
                  ? "bg-rose-50 border-rose-100 text-rose-700"
                  : "bg-[oklch(0.985_0.002_265)] border-[oklch(0.915_0.003_265)] text-[oklch(0.45_0.008_265)]",
              )}
            >
              <Clock className="size-3.5" />
              {dueDateStatus.label}
            </div>
          )}

          {task.priority !== "none" && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-sm",
                priorityConfig.badgeColor,
              )}
            >
              <Sparkles className="size-3.5" />
              {priorityConfig.label} Priority
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
