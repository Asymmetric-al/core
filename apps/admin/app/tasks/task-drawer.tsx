"use client";

import { Sheet, SheetContent } from "@asym/ui/components/shadcn/sheet";
import {
  CheckSquare,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Users,
} from "lucide-react";
import { type ComponentType, useState } from "react";

import { TaskDrawerContent } from "./task-drawer-sections";
import { getPriorityConfig, getStatusConfig } from "./types";

import type {
  Task,
  TaskType,
  TaskPriority,
  TaskStatus,
  StaffMember,
  LinkedEntity,
} from "./types";

const TYPE_ICONS: Record<TaskType, ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  follow_up: MessageSquare,
  todo: CheckSquare,
  review: FileText,
};

interface TaskDrawerProps {
  task: Task | null;
  staffMembers: StaffMember[];
  linkedEntities: LinkedEntity[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function parseDueDateToLocalDay(dueDate: string): Date | null {
  const datePart = dueDate.split("T")[0] ?? dueDate;
  const [yearText, monthText, dayText] = datePart.split("-");
  const year = Number.parseInt(yearText ?? "", 10);
  const month = Number.parseInt(monthText ?? "", 10);
  const day = Number.parseInt(dayText ?? "", 10);

  if (
    Number.isFinite(year) &&
    Number.isFinite(month) &&
    Number.isFinite(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31
  ) {
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function isTaskOverdue(
  dueDate: string | undefined,
  status: TaskStatus,
): boolean {
  if (!dueDate || status === "completed") return false;
  const dueDay = parseDueDateToLocalDay(dueDate);
  if (!dueDay) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDay.getTime() < today.getTime();
}

export function TaskDrawer({
  task,
  staffMembers,
  onClose,
  onUpdate,
  onDelete,
}: TaskDrawerProps) {
  const [newComment, setNewComment] = useState("");

  if (!task) return null;

  const TypeIcon = TYPE_ICONS[task.type];
  const priorityConfig = getPriorityConfig(task.priority)!;
  const statusConfig = getStatusConfig(task.status)!;

  const handleStatusChange = (newStatus: TaskStatus) => {
    onUpdate({
      ...task,
      status: newStatus,
      completed_at:
        newStatus === "completed" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    });
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    onUpdate({
      ...task,
      priority: newPriority,
      updated_at: new Date().toISOString(),
    });
  };

  const handleAssigneeChange = (staffId: string) => {
    const staff = staffMembers.find((s) => s.id === staffId);
    onUpdate({
      ...task,
      assigned_to: staffId,
      assigned_to_name: staff?.name,
      assigned_to_avatar: staff?.avatar_url,
      updated_at: new Date().toISOString(),
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: `com-${Date.now()}`,
      task_id: task.id,
      user_id: "current-user",
      user_name: "You",
      content: newComment.trim(),
      created_at: new Date().toISOString(),
    };
    onUpdate({
      ...task,
      comments: [...task.comments, comment],
      updated_at: new Date().toISOString(),
    });
    setNewComment("");
  };

  const isOverdue = isTaskOverdue(task.due_date, task.status);

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 gap-0 border-l border-border bg-background overflow-hidden flex flex-col h-full">
        <TaskDrawerContent
          task={task}
          TypeIcon={TypeIcon}
          statusColor={statusConfig.color}
          statusIconColor={statusConfig.iconColor}
          statusLabel={statusConfig.label}
          priorityColor={priorityConfig.color}
          priorityLabel={priorityConfig.label}
          staffMembers={staffMembers}
          isOverdue={Boolean(isOverdue)}
          newComment={newComment}
          onCommentChange={setNewComment}
          onAddComment={handleAddComment}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onAssigneeChange={handleAssigneeChange}
          onDelete={() => onDelete(task.id)}
        />
      </SheetContent>
    </Sheet>
  );
}
