"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Calendar } from "@asym/ui/components/shadcn/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";
import {
  Bell,
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
  Clock,
  FileText,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import { DEFAULT_TASK_TAGS, TAG_CATEGORIES, getTagConfig } from "./tags";
import { TASK_PRIORITIES, TASK_TYPES } from "./types";

import type {
  LinkedEntity,
  StaffMember,
  TaskPriority,
  TaskReminder,
  TaskType,
} from "./types";
import type { ComponentType } from "react";

const TYPE_ICONS: Record<TaskType, ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  follow_up: MessageSquare,
  todo: CheckSquare,
  review: FileText,
};

interface TaskFormDialogHeaderProps {
  isEdit: boolean;
}

interface TaskFormDialogFooterProps {
  isEdit: boolean;
  saveDisabled: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface TaskFormFieldsProps {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate?: Date;
  dueTime: string;
  assignedTo?: string;
  linkedEntity?: LinkedEntity;
  reminders: Partial<TaskReminder>[];
  tags: string[];
  searchValue: string;
  showEntitySearch: boolean;
  staffMembers: StaffMember[];
  linkedEntities: LinkedEntity[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: TaskType) => void;
  onPriorityChange: (value: TaskPriority) => void;
  onDueDateChange: (value?: Date) => void;
  onDueTimeChange: (value: string) => void;
  onAssignedToChange: (value: string) => void;
  onLinkedEntityChange: (value: LinkedEntity | undefined) => void;
  onShowEntitySearchChange: (value: boolean) => void;
  onAddReminder: () => void;
  onRemoveReminder: (index: number) => void;
  onUpdateReminder: (index: number, payload: Partial<TaskReminder>) => void;
  onAddTag: (value: string) => void;
  onRemoveTag: (value: string) => void;
  onTagSearchChange: (value: string) => void;
}

function TaskBasicsSection({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: Pick<
  TaskFormFieldsProps,
  "title" | "description" | "onTitleChange" | "onDescriptionChange"
>) {
  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="title"
          className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Task Title *
        </Label>
        <Input
          id="title"
          placeholder="Enter task title..."
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="text-sm rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Description
        </Label>
        <Textarea
          placeholder="Add more details about this task..."
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="min-h-[80px] text-sm resize-none rounded-xl"
        />
      </div>
    </>
  );
}

function TaskTypeAndPrioritySection({
  type,
  priority,
  onTypeChange,
  onPriorityChange,
}: Pick<
  TaskFormFieldsProps,
  "type" | "priority" | "onTypeChange" | "onPriorityChange"
>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Task Type
        </Label>
        <Select
          value={type}
          onValueChange={(value) => onTypeChange(value as TaskType)}
        >
          <SelectTrigger className="text-sm rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {TASK_TYPES.map((taskType) => {
              const Icon = TYPE_ICONS[taskType.value];
              return (
                <SelectItem
                  key={taskType.value}
                  value={taskType.value}
                  className="rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    {taskType.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Priority
        </Label>
        <Select
          value={priority}
          onValueChange={(value) => onPriorityChange(value as TaskPriority)}
        >
          <SelectTrigger className="text-sm rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {TASK_PRIORITIES.map((taskPriority) => (
              <SelectItem
                key={taskPriority.value}
                value={taskPriority.value}
                className="rounded-xl"
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5 rounded-md",
                    taskPriority.color,
                  )}
                >
                  {taskPriority.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function TaskDueDateSection({
  dueDate,
  dueTime,
  onDueDateChange,
  onDueTimeChange,
}: Pick<
  TaskFormFieldsProps,
  "dueDate" | "dueTime" | "onDueDateChange" | "onDueTimeChange"
>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <CalendarIcon className="size-3" /> Due Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal text-sm rounded-xl",
                !dueDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => onDueDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Clock className="size-3" /> Time (Optional)
        </Label>
        <Input
          type="time"
          value={dueTime}
          onChange={(event) => onDueTimeChange(event.target.value)}
          className="text-sm rounded-xl"
        />
      </div>
    </div>
  );
}

function TaskAssigneeSection({
  assignedTo,
  staffMembers,
  onAssignedToChange,
}: Pick<
  TaskFormFieldsProps,
  "assignedTo" | "staffMembers" | "onAssignedToChange"
>) {
  return (
    <div className="space-y-2">
      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        <User className="size-3" /> Assign To
      </Label>
      <Select value={assignedTo} onValueChange={onAssignedToChange}>
        <SelectTrigger className="text-sm rounded-xl">
          <SelectValue placeholder="Select team member..." />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {staffMembers.map((staff) => (
            <SelectItem key={staff.id} value={staff.id} className="rounded-xl">
              <div className="flex items-center gap-2">
                <Avatar className="size-5 border border-border">
                  <AvatarImage src={staff.avatar_url} />
                  <AvatarFallback className="text-[8px]">
                    {staff.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span>{staff.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({staff.role})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TaskLinkedRecordSection({
  linkedEntity,
  linkedEntities,
  showEntitySearch,
  onLinkedEntityChange,
  onShowEntitySearchChange,
}: Pick<
  TaskFormFieldsProps,
  | "linkedEntity"
  | "linkedEntities"
  | "showEntitySearch"
  | "onLinkedEntityChange"
  | "onShowEntitySearchChange"
>) {
  return (
    <div className="space-y-2">
      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        <Link2 className="size-3" /> Link to Record
      </Label>
      {linkedEntity ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="size-8 border border-border">
              <AvatarImage src={linkedEntity.avatar} />
              <AvatarFallback>{linkedEntity.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{linkedEntity.name}</p>
              <Badge
                variant="secondary"
                className="text-[9px] h-4 capitalize rounded-md"
              >
                {linkedEntity.type}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLinkedEntityChange(undefined)}
            className="size-8 rounded-xl"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Popover
          open={showEntitySearch}
          onOpenChange={onShowEntitySearchChange}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-sm text-muted-foreground rounded-xl"
            >
              <Plus className="mr-2 size-4" />
              Link a donor, missionary, or contact...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0 rounded-2xl" align="start">
            <Command className="rounded-2xl">
              <CommandInput placeholder="Search records..." />
              <CommandList>
                <CommandEmpty>No records found.</CommandEmpty>
                <CommandGroup heading="Donors">
                  {linkedEntities
                    .filter((entity) => entity.type === "donor")
                    .map((entity) => (
                      <CommandItem
                        key={entity.id}
                        onSelect={() => {
                          onLinkedEntityChange(entity);
                          onShowEntitySearchChange(false);
                        }}
                        className="cursor-pointer rounded-xl"
                      >
                        <Avatar className="size-6 mr-2 border border-border">
                          <AvatarImage src={entity.avatar} />
                          <AvatarFallback className="text-[9px]">
                            {entity.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{entity.name}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Missionaries">
                  {linkedEntities
                    .filter((entity) => entity.type === "missionary")
                    .map((entity) => (
                      <CommandItem
                        key={entity.id}
                        onSelect={() => {
                          onLinkedEntityChange(entity);
                          onShowEntitySearchChange(false);
                        }}
                        className="cursor-pointer rounded-xl"
                      >
                        <Avatar className="size-6 mr-2 border border-border">
                          <AvatarImage src={entity.avatar} />
                          <AvatarFallback className="text-[9px]">
                            {entity.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{entity.name}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Contacts">
                  {linkedEntities
                    .filter((entity) => entity.type === "contact")
                    .map((entity) => (
                      <CommandItem
                        key={entity.id}
                        onSelect={() => {
                          onLinkedEntityChange(entity);
                          onShowEntitySearchChange(false);
                        }}
                        className="cursor-pointer rounded-xl"
                      >
                        <Avatar className="size-6 mr-2 border border-border">
                          <AvatarImage src={entity.avatar} />
                          <AvatarFallback className="text-[9px]">
                            {entity.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{entity.name}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

function TaskRemindersSection({
  reminders,
  onAddReminder,
  onRemoveReminder,
  onUpdateReminder,
}: Pick<
  TaskFormFieldsProps,
  "reminders" | "onAddReminder" | "onRemoveReminder" | "onUpdateReminder"
>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Bell className="size-3" /> Reminders
        </Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddReminder}
          className="h-7 text-xs rounded-xl"
        >
          <Plus className="size-3 mr-1" /> Add Reminder
        </Button>
      </div>
      {reminders.length > 0 && (
        <div className="space-y-2">
          {reminders.map((reminder, index) => (
            <div
              key={reminder.id || index}
              className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/30"
            >
              <Input
                type="datetime-local"
                value={
                  reminder.remind_at
                    ? format(new Date(reminder.remind_at), "yyyy-MM-dd'T'HH:mm")
                    : ""
                }
                onChange={(event) => {
                  onUpdateReminder(index, {
                    remind_at: new Date(event.target.value).toISOString(),
                  });
                }}
                className="flex-1 text-sm h-8 rounded-lg"
              />
              <Select
                value={reminder.type || "notification"}
                onValueChange={(value) => {
                  onUpdateReminder(index, {
                    type: value as TaskReminder["type"],
                  });
                }}
              >
                <SelectTrigger className="w-32 h-8 text-xs rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="notification" className="rounded-lg">
                    Notification
                  </SelectItem>
                  <SelectItem value="email" className="rounded-lg">
                    Email
                  </SelectItem>
                  <SelectItem value="both" className="rounded-lg">
                    Both
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveReminder(index)}
                className="size-8 shrink-0 rounded-lg"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskTagsSection({
  tags,
  searchValue,
  onAddTag,
  onRemoveTag,
  onTagSearchChange,
}: Pick<
  TaskFormFieldsProps,
  "tags" | "searchValue" | "onAddTag" | "onRemoveTag" | "onTagSearchChange"
>) {
  return (
    <div className="space-y-2">
      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        Tags
      </Label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tagId) => {
            const tagConfig = getTagConfig(tagId);
            return (
              <Badge
                key={tagId}
                className={cn(
                  "text-xs h-6 gap-1 rounded-lg border-0",
                  tagConfig?.color || "bg-muted text-muted-foreground",
                )}
              >
                {tagConfig?.label || tagId}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tagId)}
                  className="ml-0.5 hover:opacity-70"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-sm text-muted-foreground rounded-xl"
          >
            <Plus className="mr-2 size-4" />
            Add tags...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 rounded-2xl" align="start">
          <Command className="rounded-2xl" shouldFilter={false}>
            <CommandInput
              placeholder="Search or create tags..."
              value={searchValue}
              onValueChange={onTagSearchChange}
            />
            <CommandList className="max-h-[300px]">
              {searchValue.trim() &&
                !DEFAULT_TASK_TAGS.some(
                  (tag) =>
                    tag.label.toLowerCase() === searchValue.toLowerCase(),
                ) && (
                  <CommandGroup heading="New Tag">
                    <CommandItem
                      onSelect={() => {
                        const newTag = searchValue.trim();
                        if (newTag) {
                          onAddTag(newTag);
                          onTagSearchChange("");
                        }
                      }}
                      className="cursor-pointer rounded-xl flex items-center gap-2"
                    >
                      <div className="p-1 rounded-md bg-primary/10 text-primary">
                        <Plus className="size-3" />
                      </div>
                      <span className="text-sm">
                        Create &ldquo;{searchValue}&rdquo;
                      </span>
                    </CommandItem>
                  </CommandGroup>
                )}
              <CommandEmpty>No tags found.</CommandEmpty>
              {TAG_CATEGORIES.map((category) => {
                const categoryTags = DEFAULT_TASK_TAGS.filter(
                  (tag) =>
                    tag.category === category.value &&
                    tag.label.toLowerCase().includes(searchValue.toLowerCase()),
                );
                if (categoryTags.length === 0) return null;

                return (
                  <CommandGroup key={category.value} heading={category.label}>
                    {categoryTags.map((tag) => {
                      const isSelected = tags.includes(tag.id);
                      return (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => {
                            if (isSelected) {
                              onRemoveTag(tag.id);
                            } else {
                              onAddTag(tag.id);
                            }
                            onTagSearchChange("");
                          }}
                          className="cursor-pointer rounded-xl flex items-center justify-between"
                        >
                          <Badge
                            className={cn(
                              "text-xs h-5 rounded-md border-0",
                              tag.color,
                            )}
                          >
                            {tag.label}
                          </Badge>
                          {isSelected && (
                            <Check className="size-4 text-emerald-600" />
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TaskFormDialogHeader({ isEdit }: TaskFormDialogHeaderProps) {
  return (
    <DialogHeader className="px-6 py-5 border-b border-border">
      <DialogTitle className="text-lg font-bold">
        {isEdit ? "Edit Task" : "Create New Task"}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        {isEdit
          ? "Update the task details below."
          : "Fill in the details to create a new task."}
      </DialogDescription>
    </DialogHeader>
  );
}

export function TaskFormFields(props: TaskFormFieldsProps) {
  const {
    title,
    description,
    type,
    priority,
    dueDate,
    dueTime,
    assignedTo,
    linkedEntity,
    reminders,
    tags,
    searchValue,
    showEntitySearch,
    staffMembers,
    linkedEntities,
    onTitleChange,
    onDescriptionChange,
    onTypeChange,
    onPriorityChange,
    onDueDateChange,
    onDueTimeChange,
    onAssignedToChange,
    onLinkedEntityChange,
    onShowEntitySearchChange,
    onAddReminder,
    onRemoveReminder,
    onUpdateReminder,
    onAddTag,
    onRemoveTag,
    onTagSearchChange,
  } = props;

  return (
    <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
      <TaskBasicsSection
        title={title}
        description={description}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />

      <TaskTypeAndPrioritySection
        type={type}
        priority={priority}
        onTypeChange={onTypeChange}
        onPriorityChange={onPriorityChange}
      />

      <TaskDueDateSection
        dueDate={dueDate}
        dueTime={dueTime}
        onDueDateChange={onDueDateChange}
        onDueTimeChange={onDueTimeChange}
      />

      <TaskAssigneeSection
        assignedTo={assignedTo}
        staffMembers={staffMembers}
        onAssignedToChange={onAssignedToChange}
      />

      <TaskLinkedRecordSection
        linkedEntity={linkedEntity}
        linkedEntities={linkedEntities}
        showEntitySearch={showEntitySearch}
        onLinkedEntityChange={onLinkedEntityChange}
        onShowEntitySearchChange={onShowEntitySearchChange}
      />

      <TaskRemindersSection
        reminders={reminders}
        onAddReminder={onAddReminder}
        onRemoveReminder={onRemoveReminder}
        onUpdateReminder={onUpdateReminder}
      />

      <TaskTagsSection
        tags={tags}
        searchValue={searchValue}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onTagSearchChange={onTagSearchChange}
      />
    </div>
  );
}

export function TaskFormDialogFooter({
  isEdit,
  saveDisabled,
  onClose,
  onSave,
}: TaskFormDialogFooterProps) {
  return (
    <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
      <Button variant="outline" onClick={onClose} className="rounded-xl">
        Cancel
      </Button>
      <Button onClick={onSave} disabled={saveDisabled} className="rounded-xl">
        {isEdit ? "Save Changes" : "Create Task"}
      </Button>
    </DialogFooter>
  );
}
