"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { SheetDescription, SheetTitle } from "@asym/ui/components/shadcn/sheet";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { VisuallyHidden } from "@asym/ui/components/shadcn/visually-hidden";
import { cn } from "@asym/ui/lib/utils";
import {
  AlertCircle,
  Bell,
  Calendar,
  ChevronDown,
  Link2,
  MessageSquare,
  Send,
  Trash2,
  User,
} from "lucide-react";

import { getTagConfig } from "./tags";
import { TASK_PRIORITIES, TASK_STATUSES } from "./types";

import type { StaffMember, Task, TaskPriority, TaskStatus } from "./types";
import type { ComponentType } from "react";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const TIME_AND_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const COMPACT_SECTION_LABEL_CLASS =
  "text-xs font-semibold text-muted-foreground";
const COMPACT_OUTLINE_BADGE_CLASS = "h-4 rounded-md border px-1.5 py-0 text-xs";
const COMPACT_BADGE_CLASS = "h-4 rounded-md px-1.5 text-xs";
const COMPACT_MUTED_TEXT_CLASS = "text-xs text-muted-foreground";
const COMPACT_MUTED_META_TEXT_CLASS =
  "text-xs text-muted-foreground font-medium";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "No date";
  return DATE_FORMATTER.format(new Date(dateStr));
}

function formatTime(timeStr?: string): string | null {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(":");
  const hour = Number.parseInt(hours ?? "0", 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

interface TaskDrawerContentProps {
  task: Task;
  TypeIcon: ComponentType<{ className?: string }>;
  statusColor: string;
  statusIconColor: string;
  statusLabel: string;
  priorityColor: string;
  priorityLabel: string;
  staffMembers: StaffMember[];
  isOverdue: boolean;
  newComment: string;
  onCommentChange: (value: string) => void;
  onAddComment: () => void;
  onStatusChange: (newStatus: TaskStatus) => void;
  onPriorityChange: (newPriority: TaskPriority) => void;
  onAssigneeChange: (staffId: string) => void;
  onDelete: () => void;
}

interface TaskSheetHeaderProps {
  taskTitle: string;
  TypeIcon: ComponentType<{ className?: string }>;
  statusIconColor: string;
}

function TaskSheetHeader({
  taskTitle,
  TypeIcon,
  statusIconColor,
}: TaskSheetHeaderProps) {
  return (
    <>
      <VisuallyHidden>
        <SheetTitle>Task Details: {taskTitle}</SheetTitle>
        <SheetDescription>View and manage task details</SheetDescription>
      </VisuallyHidden>
      <div className="h-14 bg-card border-b border-border flex items-center px-4 pr-14 shrink-0">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl p-2", statusIconColor)}>
            <TypeIcon className="size-4" />
          </div>
          <span className="text-sm font-bold text-foreground">
            Task Details
          </span>
        </div>
      </div>
    </>
  );
}

interface TaskOverviewSectionProps {
  task: Task;
  statusColor: string;
  statusLabel: string;
  priorityColor: string;
  priorityLabel: string;
  onStatusChange: (newStatus: TaskStatus) => void;
  onPriorityChange: (newPriority: TaskPriority) => void;
}

function TaskOverviewSection({
  task,
  statusColor,
  statusLabel,
  priorityColor,
  priorityLabel,
  onStatusChange,
  onPriorityChange,
}: TaskOverviewSectionProps) {
  return (
    <div className="space-y-4">
      <h2
        className={cn(
          "text-xl font-bold text-foreground leading-tight",
          task.status === "completed" && "line-through text-muted-foreground",
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
          className="h-7 gap-1.5 rounded-lg text-xs"
            >
              <Badge
                variant="outline"
                className={cn(COMPACT_OUTLINE_BADGE_CLASS, statusColor)}
              >
                {statusLabel}
              </Badge>
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-2xl p-2">
            {TASK_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => onStatusChange(status.value)}
                className="rounded-xl px-3 py-2"
              >
                <Badge
                  variant="outline"
                  className={cn(
                    COMPACT_OUTLINE_BADGE_CLASS,
                    "mr-2",
                    status.color,
                  )}
                >
                  {status.label}
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
          className="h-7 gap-1.5 rounded-lg text-xs"
            >
              <Badge
                variant="outline"
                className={cn(COMPACT_OUTLINE_BADGE_CLASS, priorityColor)}
              >
                {priorityLabel}
              </Badge>
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-2xl p-2">
            {TASK_PRIORITIES.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                onClick={() => onPriorityChange(priority.value)}
                className="rounded-xl px-3 py-2"
              >
                <Badge
                  variant="outline"
                  className={cn(
                    COMPACT_OUTLINE_BADGE_CLASS,
                    "mr-2",
                    priority.color,
                  )}
                >
                  {priority.label}
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
                "text-xs h-5 px-2 rounded-lg border-0",
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
  );
}

interface TaskDueAndAssigneeSectionProps {
  task: Task;
  isOverdue: boolean;
  staffMembers: StaffMember[];
  onAssigneeChange: (staffId: string) => void;
}

function TaskDueAndAssigneeSection({
  task,
  isOverdue,
  staffMembers,
  onAssigneeChange,
}: TaskDueAndAssigneeSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <p
          className={cn(
            COMPACT_SECTION_LABEL_CLASS,
            "flex items-center gap-1.5",
          )}
        >
          <Calendar className="size-3" /> Due Date
        </p>
        <p
          className={cn(
            "text-sm font-medium",
            isOverdue ? "text-destructive" : "text-foreground",
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
        <p
          className={cn(
            COMPACT_SECTION_LABEL_CLASS,
            "flex items-center gap-1.5",
          )}
        >
          <User className="size-3" /> Assigned To
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
              {task.assigned_to_name ? (
                <div className="flex items-center gap-2">
                  <Avatar className="size-6 border border-border">
                    <AvatarImage src={task.assigned_to_avatar} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
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
          <DropdownMenuContent align="start" className="rounded-2xl w-56 p-2">
            {staffMembers.map((staff) => (
              <DropdownMenuItem
                key={staff.id}
                onClick={() => onAssigneeChange(staff.id)}
                className="rounded-xl px-3 py-2"
              >
                <Avatar className="size-6 mr-2 border border-border">
                  <AvatarImage src={staff.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {staff.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{staff.name}</span>
                  <span className={COMPACT_MUTED_TEXT_CLASS}>{staff.role}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface TaskLinkedRecordSectionProps {
  linkedEntity: NonNullable<Task["linked_entity"]>;
}

function TaskLinkedRecordSection({
  linkedEntity,
}: TaskLinkedRecordSectionProps) {
  return (
    <div className="space-y-3">
      <p
        className={cn(COMPACT_SECTION_LABEL_CLASS, "flex items-center gap-1.5")}
      >
        <Link2 className="size-3" /> Linked Record
      </p>
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
        <Avatar className="size-10 border border-border">
          <AvatarImage src={linkedEntity.avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {linkedEntity.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{linkedEntity.name}</p>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(COMPACT_BADGE_CLASS, "capitalize")}
            >
              {linkedEntity.type}
            </Badge>
            {linkedEntity.email && (
              <span className={cn(COMPACT_MUTED_TEXT_CLASS, "truncate")}>
                {linkedEntity.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskRemindersSectionProps {
  reminders: Task["reminders"];
}

function TaskRemindersSection({ reminders }: TaskRemindersSectionProps) {
  return (
    <div className="space-y-3">
      <p
        className={cn(COMPACT_SECTION_LABEL_CLASS, "flex items-center gap-1.5")}
      >
        <Bell className="size-3" /> Reminders
      </p>
      <div className="space-y-2">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {TIME_AND_DATE_FORMATTER.format(new Date(reminder.remind_at))}
              </span>
              <Badge
                variant="secondary"
                className={cn(COMPACT_BADGE_CLASS, "capitalize")}
              >
                {reminder.type}
              </Badge>
            </div>
            {reminder.sent && (
              <Badge
                variant="outline"
                className={cn(
                  COMPACT_BADGE_CLASS,
                  "border-border bg-accent text-accent-foreground",
                )}
              >
                Sent
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TaskCommentsSectionProps {
  comments: Task["comments"];
  newComment: string;
  onCommentChange: (value: string) => void;
  onAddComment: () => void;
}

function TaskCommentsSection({
  comments,
  newComment,
  onCommentChange,
  onAddComment,
}: TaskCommentsSectionProps) {
  return (
    <div className="space-y-4">
      <p
        className={cn(COMPACT_SECTION_LABEL_CLASS, "flex items-center gap-1.5")}
      >
        <MessageSquare className="size-3" /> Activity & Comments
      </p>

      <div className="flex gap-3">
        <Avatar className="size-8 shrink-0 border border-border">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            Y
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(event) => onCommentChange(event.target.value)}
            className="min-h-20 resize-none rounded-xl text-sm"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={onAddComment}
              disabled={!newComment.trim()}
              className="h-8 px-4 text-xs font-semibold rounded-xl"
            >
              <Send className="size-3 mr-1.5" />
              Comment
            </Button>
          </div>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          {[...comments].reverse().map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="size-8 shrink-0 border border-border">
                <AvatarImage src={comment.user_avatar} />
                <AvatarFallback className="text-xs bg-muted">
                  {comment.user_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {comment.user_name}
                  </span>
                  <span className={COMPACT_MUTED_META_TEXT_CLASS}>
                    {TIME_AND_DATE_FORMATTER.format(
                      new Date(comment.created_at),
                    )}
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
  );
}

interface TaskDrawerFooterProps {
  task: Task;
  onDelete: () => void;
}

function TaskDrawerFooter({ task, onDelete }: TaskDrawerFooterProps) {
  return (
    <div className="p-4 border-t border-border bg-card shrink-0">
      <div className="flex items-center justify-between">
        <div className={COMPACT_MUTED_META_TEXT_CLASS}>
          <span>Created {formatDate(task.created_at)}</span>
          {task.completed_at && (
            <span className="ml-3 text-primary">
              Completed {formatDate(task.completed_at)}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
        >
          <Trash2 className="size-3.5 mr-1.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export function TaskDrawerContent({
  task,
  TypeIcon,
  statusColor,
  statusIconColor,
  statusLabel,
  priorityColor,
  priorityLabel,
  staffMembers,
  isOverdue,
  newComment,
  onCommentChange,
  onAddComment,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDelete,
}: TaskDrawerContentProps) {
  return (
    <>
      <TaskSheetHeader
        taskTitle={task.title}
        TypeIcon={TypeIcon}
        statusIconColor={statusIconColor}
      />

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <TaskOverviewSection
            task={task}
            statusColor={statusColor}
            statusLabel={statusLabel}
            priorityColor={priorityColor}
            priorityLabel={priorityLabel}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
          />

          <Separator />

          <TaskDueAndAssigneeSection
            task={task}
            isOverdue={isOverdue}
            staffMembers={staffMembers}
            onAssigneeChange={onAssigneeChange}
          />

          {task.linked_entity && (
            <>
              <Separator />
              <TaskLinkedRecordSection linkedEntity={task.linked_entity} />
            </>
          )}

          {task.reminders.length > 0 && (
            <>
              <Separator />
              <TaskRemindersSection reminders={task.reminders} />
            </>
          )}

          <Separator />

          <TaskCommentsSection
            comments={task.comments}
            newComment={newComment}
            onCommentChange={onCommentChange}
            onAddComment={onAddComment}
          />
        </div>
      </ScrollArea>

      <TaskDrawerFooter task={task} onDelete={onDelete} />
    </>
  );
}
