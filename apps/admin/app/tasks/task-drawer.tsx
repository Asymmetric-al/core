"use client";

import { useState } from "react";
import {
  User,
  Calendar,
  Bell,
  Link2,
  MessageSquare,
  Send,
  Trash2,
  Phone,
  Mail,
  Users,
  CheckSquare,
  FileText,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@asym/ui/components/shadcn/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";

import type {
  Task,
  TaskType,
  TaskPriority,
  TaskStatus,
  StaffMember,
  LinkedEntity,
} from "./types";
import {
  getPriorityConfig,
  getStatusConfig,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "./types";
import { getTagConfig } from "./tags";

const TYPE_ICONS: Record<
  TaskType,
  React.ComponentType<{ className?: string }>
> = {
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No date";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours ?? "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
        <VisuallyHidden>
          <SheetTitle>Task Details: {task.title}</SheetTitle>
          <SheetDescription>View and manage task details</SheetDescription>
        </VisuallyHidden>
        <div className="h-14 bg-card border-b border-border flex items-center px-4 pr-14 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn("p-2 rounded-xl", statusConfig.color.split(" ")[0])}
            >
              <TypeIcon className="size-4" />
            </div>
            <span className="text-sm font-bold text-foreground uppercase tracking-wider">
              Task Details
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h2
                className={cn(
                  "text-xl font-bold text-foreground leading-tight",
                  task.status === "completed" &&
                    "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs rounded-xl"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4 border rounded-md",
                          statusConfig.color,
                        )}
                      >
                        {statusConfig.label}
                      </Badge>
                      <ChevronDown className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="rounded-2xl p-2"
                  >
                    {TASK_STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s.value}
                        onClick={() => handleStatusChange(s.value)}
                        className="rounded-xl px-3 py-2"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 border mr-2 rounded-md",
                            s.color,
                          )}
                        >
                          {s.label}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs rounded-xl"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4 border rounded-md",
                          priorityConfig.color,
                        )}
                      >
                        {priorityConfig.label}
                      </Badge>
                      <ChevronDown className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="rounded-2xl p-2"
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <DropdownMenuItem
                        key={p.value}
                        onClick={() => handlePriorityChange(p.value)}
                        className="rounded-xl px-3 py-2"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 border mr-2 rounded-md",
                            p.color,
                          )}
                        >
                          {p.label}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {task.tags.map((tagId) => {
                  const tagConfig = getTagConfig(tagId);
                  return (
                    <Badge
                      key={tagId}
                      className={cn(
                        "text-[9px] h-5 px-2 rounded-lg border-0",
                        tagConfig?.color || "bg-muted text-muted-foreground",
                      )}
                    >
                      {tagConfig?.label || tagId}
                    </Badge>
                  );
                })}
              </div>

              {task.description && (
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-xl">
                  {task.description}
                </p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="size-3" /> Due Date
                </label>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isOverdue
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground",
                  )}
                >
                  {isOverdue && <AlertCircle className="size-3 inline mr-1" />}
                  {formatDate(task.due_date)}
                  {task.due_time && (
                    <span className="text-muted-foreground ml-1">
                      at {formatTime(task.due_time)}
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <User className="size-3" /> Assigned To
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      {task.assigned_to_name ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6 border border-border">
                            <AvatarImage src={task.assigned_to_avatar} />
                            <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">
                              {task.assigned_to_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {task.assigned_to_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="rounded-2xl w-56 p-2"
                  >
                    {staffMembers.map((staff) => (
                      <DropdownMenuItem
                        key={staff.id}
                        onClick={() => handleAssigneeChange(staff.id)}
                        className="rounded-xl px-3 py-2"
                      >
                        <Avatar className="size-6 mr-2 border border-border">
                          <AvatarImage src={staff.avatar_url} />
                          <AvatarFallback className="text-[9px]">
                            {staff.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {staff.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {staff.role}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {task.linked_entity && (
              <>
                <Separator />
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Link2 className="size-3" /> Linked Record
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
                    <Avatar className="size-10 border border-border">
                      <AvatarImage src={task.linked_entity.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {task.linked_entity.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {task.linked_entity.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 px-1.5 capitalize rounded-md"
                        >
                          {task.linked_entity.type}
                        </Badge>
                        {task.linked_entity.email && (
                          <span className="text-xs text-muted-foreground truncate">
                            {task.linked_entity.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {task.reminders.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Bell className="size-3" /> Reminders
                  </label>
                  <div className="space-y-2">
                    {task.reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="size-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(new Date(reminder.remind_at))}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[9px] h-4 px-1.5 capitalize rounded-md"
                          >
                            {reminder.type}
                          </Badge>
                        </div>
                        {reminder.sent && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 rounded-md"
                          >
                            Sent
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-4">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare className="size-3" /> Activity & Comments
              </label>

              <div className="flex gap-3">
                <Avatar className="size-8 shrink-0 border border-border">
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    Y
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none rounded-xl text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="h-8 px-4 text-xs font-semibold rounded-xl"
                    >
                      <Send className="size-3 mr-1.5" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>

              {task.comments.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  {[...task.comments].reverse().map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="size-8 shrink-0 border border-border">
                        <AvatarImage src={comment.user_avatar} />
                        <AvatarFallback className="text-[10px] bg-muted">
                          {comment.user_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {comment.user_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(new Date(comment.created_at))}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-card shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-muted-foreground font-medium">
              <span>Created {formatDate(task.created_at)}</span>
              {task.completed_at && (
                <span className="ml-3 text-emerald-600 dark:text-emerald-400">
                  Completed {formatDate(task.completed_at)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
