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
  DropdownMenuGroup,
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

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

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
const COMPACT_MUTED_TEXT_CLASS = "text-xs text-muted-foreground";
const COMPACT_MUTED_META_TEXT_CLASS =
  "text-xs text-muted-foreground font-medium";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "No date";
  return DATE_FORMATTER.format(makeDisplayDate(dateStr));
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
  statusLabel: string;
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
}

function TaskSheetHeader({ taskTitle, TypeIcon }: TaskSheetHeaderProps) {
  return (
    <>
      <VisuallyHidden>
        <SheetTitle>Task Details: {taskTitle}</SheetTitle>
        <SheetDescription>View and manage task details</SheetDescription>
      </VisuallyHidden>
      <div className="h-14 bg-card border-b border-border flex items-center px-4 pr-14 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2 text-foreground">
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
  statusLabel: string;
  priorityLabel: string;
  onStatusChange: (newStatus: TaskStatus) => void;
  onPriorityChange: (newPriority: TaskPriority) => void;
}

function TaskOverviewSection({
  task,
  statusLabel,
  priorityLabel,
  onStatusChange,
  onPriorityChange,
}: TaskOverviewSectionProps) {
  return (
    <div className="flex flex-col gap-4">
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
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                <Badge
                  variant={
                    task.status === "completed"
                      ? "default"
                      : task.status === "in_progress"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {statusLabel}
                </Badge>
                <ChevronDown className="size-3" />
              </Button>
            }
          />
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              {TASK_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => onStatusChange(status.value)}
                >
                  <Badge
                    variant={
                      status.value === "completed"
                        ? "default"
                        : status.value === "in_progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {status.label}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                <Badge
                  variant={
                    task.priority === "urgent"
                      ? "destructive"
                      : task.priority === "high"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {priorityLabel}
                </Badge>
                <ChevronDown className="size-3" />
              </Button>
            }
          />
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              {TASK_PRIORITIES.map((priority) => (
                <DropdownMenuItem
                  key={priority.value}
                  onClick={() => onPriorityChange(priority.value)}
                >
                  <Badge
                    variant={
                      priority.value === "urgent"
                        ? "destructive"
                        : priority.value === "high"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {priority.label}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {task.tags.map((tagId) => {
          const tagConfig = getTagConfig(tagId);
          return (
            <Badge key={tagId} variant="secondary">
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <p
          className={cn(
            COMPACT_SECTION_LABEL_CLASS,
            "flex items-center gap-1.5",
          )}
        >
          <Calendar className="size-3" /> Due Date
        </p>
        <p className="text-sm font-medium text-foreground">
          {isOverdue && (
            <>
              <AlertCircle className="size-3 inline mr-1 text-destructive" />
              <span className="sr-only">Overdue: </span>
            </>
          )}
          {formatDate(task.due_date)}
          {task.due_time && (
            <span className="text-muted-foreground ml-1">
              at {formatTime(task.due_time)}
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p
          className={cn(
            COMPACT_SECTION_LABEL_CLASS,
            "flex items-center gap-1.5",
          )}
        >
          <User className="size-3" /> Assigned To
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost">
                {task.assigned_to_name ? (
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage src={task.assigned_to_avatar} />
                      <AvatarFallback>
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
            }
          />
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              {staffMembers.map((staff) => (
                <DropdownMenuItem
                  key={staff.id}
                  onClick={() => onAssigneeChange(staff.id)}
                >
                  <Avatar className="mr-2" size="sm">
                    <AvatarImage src={staff.avatar_url} />
                    <AvatarFallback>{staff.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{staff.name}</span>
                    <span className={COMPACT_MUTED_TEXT_CLASS}>
                      {staff.role}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
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
    <div className="flex flex-col gap-3">
      <p
        className={cn(COMPACT_SECTION_LABEL_CLASS, "flex items-center gap-1.5")}
      >
        <Link2 className="size-3" /> Linked Record
      </p>
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
        <Avatar size="lg">
          <AvatarImage src={linkedEntity.avatar} />
          <AvatarFallback>{linkedEntity.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{linkedEntity.name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{linkedEntity.type}</Badge>
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
    <div className="flex flex-col gap-3">
      <p
        className={cn(COMPACT_SECTION_LABEL_CLASS, "flex items-center gap-1.5")}
      >
        <Bell className="size-3" /> Reminders
      </p>
      <div className="flex flex-col gap-2">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {TIME_AND_DATE_FORMATTER.format(
                  makeDisplayDate(reminder.remind_at),
                )}
              </span>
              <Badge variant="secondary">{reminder.type}</Badge>
            </div>
            {reminder.sent && <Badge variant="outline">Sent</Badge>}
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
    <div className="flex flex-col gap-4">
      <p
        className={cn(COMPACT_SECTION_LABEL_CLASS, "flex items-center gap-1.5")}
      >
        <MessageSquare className="size-3" /> Activity & Comments
      </p>

      <div className="flex gap-3">
        <Avatar className="shrink-0">
          <AvatarFallback>Y</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(event) => onCommentChange(event.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={onAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="size-3 mr-1.5" />
              Comment
            </Button>
          </div>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="flex flex-col gap-4 pt-4 border-t border-border">
          {[...comments].reverse().map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="shrink-0">
                <AvatarImage src={comment.user_avatar} />
                <AvatarFallback>{comment.user_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {comment.user_name}
                  </span>
                  <span className={COMPACT_MUTED_META_TEXT_CLASS}>
                    {TIME_AND_DATE_FORMATTER.format(
                      makeDisplayDate(comment.created_at),
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
        <Button variant="ghost" size="sm" onClick={onDelete}>
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
  statusLabel,
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
    <div className="flex min-h-0 flex-1 flex-col">
      <TaskSheetHeader taskTitle={task.title} TypeIcon={TypeIcon} />

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-6 flex flex-col gap-6">
          <TaskOverviewSection
            task={task}
            statusLabel={statusLabel}
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
    </div>
  );
}
