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

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "completed";

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 gap-0 border-l border-border bg-background overflow-hidden flex flex-col h-full">
        <TaskDrawerContent
          task={task}
          TypeIcon={TypeIcon}
          statusColor={statusConfig.color}
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
