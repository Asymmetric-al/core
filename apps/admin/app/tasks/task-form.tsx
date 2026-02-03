"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  Link2,
  Plus,
  Trash2,
  Phone,
  Mail,
  Users,
  MessageSquare,
  CheckSquare,
  FileText,
  User,
  Check,
} from "lucide-react";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import { Calendar } from "@asym/ui/components/shadcn/calendar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@asym/ui/components/shadcn/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import { cn } from "@asym/ui/lib/utils";

import type {
  Task,
  TaskType,
  TaskPriority,
  StaffMember,
  LinkedEntity,
  TaskReminder,
} from "./types";
import { TASK_TYPES, TASK_PRIORITIES } from "./types";
import { DEFAULT_TASK_TAGS, TAG_CATEGORIES, getTagConfig } from "./tags";

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

interface TaskFormProps {
  open: boolean;
  task?: Task | null;
  staffMembers: StaffMember[];
  linkedEntities: LinkedEntity[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

export function TaskForm({
  open,
  task,
  staffMembers,
  linkedEntities,
  onClose,
  onSave,
}: TaskFormProps) {
  const isEdit = !!task?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [dueTime, setDueTime] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | undefined>();
  const [linkedEntity, setLinkedEntity] = useState<LinkedEntity | undefined>();
  const [reminders, setReminders] = useState<Partial<TaskReminder>[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [showEntitySearch, setShowEntitySearch] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setType(task.type);
      setPriority(task.priority);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setDueTime(task.due_time || "");
      setAssignedTo(task.assigned_to);
      setLinkedEntity(task.linked_entity);
      setReminders(task.reminders || []);
      setTags(task.tags || []);
    } else {
      setTitle("");
      setDescription("");
      setType("todo");
      setPriority("medium");
      setDueDate(new Date());
      setDueTime("");
      setAssignedTo(undefined);
      setLinkedEntity(undefined);
      setReminders([]);
      setTags([]);
    }
  }, [task, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = () => {
    const staff = staffMembers.find((s) => s.id === assignedTo);

    const taskData: Partial<Task> = {
      id: task?.id,
      title,
      description: description || undefined,
      type,
      priority,
      status: task?.status || "todo",
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      due_time: dueTime || undefined,
      assigned_to: assignedTo,
      assigned_to_name: staff?.name,
      assigned_to_avatar: staff?.avatar_url,
      linked_entity: linkedEntity,
      reminders: reminders as TaskReminder[],
      tags,
    };

    onSave(taskData);
    onClose();
  };

  const addReminder = () => {
    const defaultReminder = dueDate
      ? new Date(dueDate.getTime() - 60 * 60 * 1000)
      : new Date();

    setReminders([
      ...reminders,
      {
        id: `rem-new-${Date.now()}`,
        remind_at: defaultReminder.toISOString(),
        type: "notification",
        sent: false,
      },
    ]);
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden rounded-2xl">
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

        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
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
              onChange={(e) => setTitle(e.target.value)}
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
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] text-sm resize-none rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Task Type
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as TaskType)}
              >
                <SelectTrigger className="text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {TASK_TYPES.map((t) => {
                    const Icon = TYPE_ICONS[t.value];
                    return (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        className="rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          {t.label}
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
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger className="text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem
                      key={p.value}
                      value={p.value}
                      className="rounded-xl"
                    >
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] h-5 rounded-md", p.color)}
                      >
                        {p.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
                <PopoverContent
                  className="w-auto p-0 rounded-2xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
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
                onChange={(e) => setDueTime(e.target.value)}
                className="text-sm rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <User className="size-3" /> Assign To
            </Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="text-sm rounded-xl">
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {staffMembers.map((staff) => (
                  <SelectItem
                    key={staff.id}
                    value={staff.id}
                    className="rounded-xl"
                  >
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
                  onClick={() => setLinkedEntity(undefined)}
                  className="size-8 rounded-xl"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Popover
                open={showEntitySearch}
                onOpenChange={setShowEntitySearch}
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
                <PopoverContent
                  className="w-[400px] p-0 rounded-2xl"
                  align="start"
                >
                  <Command className="rounded-2xl">
                    <CommandInput placeholder="Search records..." />
                    <CommandList>
                      <CommandEmpty>No records found.</CommandEmpty>
                      <CommandGroup heading="Donors">
                        {linkedEntities
                          .filter((e) => e.type === "donor")
                          .map((entity) => (
                            <CommandItem
                              key={entity.id}
                              onSelect={() => {
                                setLinkedEntity(entity);
                                setShowEntitySearch(false);
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
                          .filter((e) => e.type === "missionary")
                          .map((entity) => (
                            <CommandItem
                              key={entity.id}
                              onSelect={() => {
                                setLinkedEntity(entity);
                                setShowEntitySearch(false);
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
                          .filter((e) => e.type === "contact")
                          .map((entity) => (
                            <CommandItem
                              key={entity.id}
                              onSelect={() => {
                                setLinkedEntity(entity);
                                setShowEntitySearch(false);
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Bell className="size-3" /> Reminders
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={addReminder}
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
                          ? format(
                              new Date(reminder.remind_at),
                              "yyyy-MM-dd'T'HH:mm",
                            )
                          : ""
                      }
                      onChange={(e) => {
                        const updated = [...reminders];
                        updated[index] = {
                          ...updated[index],
                          remind_at: new Date(e.target.value).toISOString(),
                        };
                        setReminders(updated);
                      }}
                      className="flex-1 text-sm h-8 rounded-lg"
                    />
                    <Select
                      value={reminder.type || "notification"}
                      onValueChange={(v) => {
                        const updated = [...reminders];
                        updated[index] = {
                          ...updated[index],
                          type: v as "email" | "notification" | "both",
                        };
                        setReminders(updated);
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
                      onClick={() => removeReminder(index)}
                      className="size-8 shrink-0 rounded-lg"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                        onClick={() => removeTag(tagId)}
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
              <PopoverContent
                className="w-[320px] p-0 rounded-2xl"
                align="start"
              >
                <Command className="rounded-2xl" shouldFilter={false}>
                  <CommandInput
                    placeholder="Search or create tags..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList className="max-h-[300px]">
                    {searchValue.trim() &&
                      !DEFAULT_TASK_TAGS.some(
                        (t) =>
                          t.label.toLowerCase() === searchValue.toLowerCase(),
                      ) && (
                        <CommandGroup heading="New Tag">
                          <CommandItem
                            onSelect={() => {
                              const newTag = searchValue.trim();
                              if (newTag && !tags.includes(newTag)) {
                                setTags([...tags, newTag]);
                                setSearchValue("");
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
                        (t) =>
                          t.category === category.value &&
                          t.label
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()),
                      );
                      if (categoryTags.length === 0) return null;
                      return (
                        <CommandGroup
                          key={category.value}
                          heading={category.label}
                        >
                          {categoryTags.map((tag) => {
                            const isSelected = tags.includes(tag.id);
                            return (
                              <CommandItem
                                key={tag.id}
                                onSelect={() => {
                                  if (isSelected) {
                                    removeTag(tag.id);
                                  } else {
                                    setTags([...tags, tag.id]);
                                  }
                                  setSearchValue("");
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
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded-xl"
          >
            {isEdit ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
