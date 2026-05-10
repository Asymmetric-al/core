"use client";

import { createBrowserClient } from "@asym/database/supabase";
import { useAuth } from "@asym/lib/hooks";
import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";
import {
  Bell,
  CalendarIcon,
  Check,
  CheckSquare,
  ChevronsUpDown,
  Flag,
  Heart,
  Loader2,
  Mail,
  Phone,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  createInitialTaskFormValues,
  taskSchema,
  toMissionaryTaskPayload,
} from "./task-form-model";

import type { Task, TaskPriority, TaskStatus, TaskType } from "../types";

const TASK_TYPES: {
  color: string;
  icon: React.ElementType;
  label: string;
  value: TaskType;
}[] = [
  {
    value: "call",
    label: "Call",
    icon: Phone,
    color: "text-blue-600 bg-blue-50",
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
    color: "text-purple-600 bg-purple-50",
  },
  {
    value: "to_do",
    label: "To-do",
    icon: CheckSquare,
    color: "text-zinc-600 bg-zinc-100",
  },
  {
    value: "follow_up",
    label: "Follow Up",
    icon: UserPlus,
    color: "text-orange-600 bg-orange-50",
  },
  {
    value: "thank_you",
    label: "Thank You",
    icon: Heart,
    color: "text-rose-600 bg-rose-50",
  },
  {
    value: "meeting",
    label: "Meeting",
    icon: Users,
    color: "text-emerald-600 bg-emerald-50",
  },
];

const TASK_STATUSES: { label: string; value: TaskStatus }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting", label: "Waiting" },
  { value: "completed", label: "Completed" },
  { value: "deferred", label: "Deferred" },
];

const TASK_PRIORITIES: {
  color: string;
  label: string;
  value: TaskPriority;
}[] = [
  { value: "none", label: "None", color: "text-zinc-400" },
  { value: "low", label: "Low", color: "text-blue-500" },
  { value: "medium", label: "Medium", color: "text-amber-500" },
  { value: "high", label: "High", color: "text-rose-500" },
];

interface SimpleDonor {
  avatar_url?: string;
  email?: string;
  id: string;
  name: string;
}

export interface TaskDialogProps {
  task?: Task | null;
  defaultDonorId?: string | null;
  initialStatus?: TaskStatus;
  onSuccess?: (task: Task) => void;
  onClose?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function useMissionaryTaskForm(options: {
  defaultDonorId?: string | null;
  initialStatus?: TaskStatus;
  onClose?: () => void;
  onSuccess?: (task: Task) => void;
  profileId?: string;
  setOpen?: (open: boolean) => void;
  supabase: ReturnType<typeof createBrowserClient>;
  task?: Task | null;
}) {
  const {
    defaultDonorId,
    initialStatus,
    onClose,
    onSuccess,
    profileId,
    setOpen,
    supabase,
    task,
  } = options;

  return useAsymForm({
    defaultValues: createInitialTaskFormValues({
      task,
      defaultDonorId,
      initialStatus,
    }),
    validators: {
      onChange: taskSchema,
    },
    onSubmit: async ({ value }) => {
      if (!profileId) {
        toast.error("Not authenticated");
        return;
      }

      try {
        const taskData = toMissionaryTaskPayload({
          missionaryId: profileId,
          values: value,
        });

        let result: Task;

        if (task) {
          const { data, error } = await supabase
            .from("missionary_tasks")
            .update(taskData)
            .eq("id", task.id)
            .select(
              `
              *,
              donor:donors!missionary_tasks_donor_id_fkey(id, name, email, avatar_url)
            `,
            )
            .single();

          if (error) {
            toast.error(error.message || "Failed to update task");
            return;
          }

          result = { ...data, donor: data.donor || null };
          toast.success("Task updated successfully");
        } else {
          const { data, error } = await supabase
            .from("missionary_tasks")
            .insert(taskData)
            .select(
              `
              *,
              donor:donors!missionary_tasks_donor_id_fkey(id, name, email, avatar_url)
            `,
            )
            .single();

          if (error) {
            toast.error(error.message || "Failed to create task");
            return;
          }

          result = { ...data, donor: data.donor || null };
          toast.success("Task created successfully");
        }

        setOpen?.(false);
        onSuccess?.(result);
        onClose?.();
      } catch (error: unknown) {
        console.error("Error saving task:", error);
        const message =
          error instanceof Error ? error.message : "Failed to save task";
        toast.error(message);
      }
    },
  });
}

type MissionaryTaskFormApi = ReturnType<typeof useMissionaryTaskForm>;

function TaskTitleField({ form }: { form: MissionaryTaskFormApi }) {
  return (
    <form.AppField name="title">
      {(field) => (
        <field.TextField
          inputClassName="h-12 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
          label="Task Title *"
          labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
          placeholder="e.g., Call to thank for donation"
        />
      )}
    </form.AppField>
  );
}

function TaskTypeSelectField({ form }: { form: MissionaryTaskFormApi }) {
  return (
    <form.Field name="task_type">
      {(field) => {
        const selectedTaskType = TASK_TYPES.find(
          (taskType) => taskType.value === field.state.value,
        );

        return (
          <div className="grid gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Task Type
            </span>
            <Select
              onOpenChange={(open) => {
                if (!open) {
                  field.handleBlur();
                }
              }}
              onValueChange={(value) => field.handleChange(value as TaskType)}
              value={field.state.value}
            >
              <SelectTrigger className="h-12 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5">
                <SelectValue placeholder="Select type">
                  {selectedTaskType ? (
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-lg",
                          selectedTaskType.color,
                        )}
                      >
                        <selectedTaskType.icon className="size-3.5" />
                      </div>
                      <span>{selectedTaskType.label}</span>
                    </div>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-100">
                {TASK_TYPES.map((taskType) => (
                  <SelectItem
                    className="rounded-lg"
                    key={taskType.value}
                    value={taskType.value}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-lg",
                          taskType.color,
                        )}
                      >
                        <taskType.icon className="size-3.5" />
                      </div>
                      <span className="font-medium">{taskType.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }}
    </form.Field>
  );
}

function PrioritySelectField({ form }: { form: MissionaryTaskFormApi }) {
  return (
    <form.Field name="priority">
      {(field) => (
        <div className="grid gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Priority
          </span>
          <Select
            onOpenChange={(open) => {
              if (!open) {
                field.handleBlur();
              }
            }}
            onValueChange={(value) => field.handleChange(value as TaskPriority)}
            value={field.state.value}
          >
            <SelectTrigger className="h-12 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-zinc-100">
              {TASK_PRIORITIES.map((priority) => (
                <SelectItem
                  className="rounded-lg"
                  key={priority.value}
                  value={priority.value}
                >
                  <div className="flex items-center gap-2">
                    <Flag className={cn("size-4", priority.color)} />
                    <span className="font-medium">{priority.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </form.Field>
  );
}

function DatePickerField({
  form,
  icon: Icon,
  label,
  name,
  placeholder,
}: {
  form: MissionaryTaskFormApi;
  icon: React.ElementType;
  label: string;
  name: "due_date" | "reminder_date";
  placeholder: string;
}) {
  return (
    <form.Field name={name}>
      {(field) => (
        <div className="grid gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {label}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "h-12 justify-start rounded-xl border-transparent bg-zinc-50 text-left font-medium transition-all hover:bg-zinc-100",
                  !field.state.value && "text-zinc-400",
                )}
                type="button"
                variant="outline"
              >
                <Icon className="mr-2 size-4" />
                {field.state.value
                  ? format(field.state.value, "PPP")
                  : placeholder}
                {field.state.value ? (
                  <X
                    className="ml-auto size-4 text-zinc-400 hover:text-zinc-600"
                    onClick={(event) => {
                      event.stopPropagation();
                      field.handleChange(null);
                    }}
                  />
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto rounded-xl p-0">
              <Calendar
                mode="single"
                onSelect={(date) => field.handleChange(date ?? null)}
                selected={field.state.value ?? undefined}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </form.Field>
  );
}

function StatusSelectField({ form }: { form: MissionaryTaskFormApi }) {
  return (
    <form.Field name="status">
      {(field) => (
        <div className="grid gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Status
          </span>
          <Select
            onOpenChange={(open) => {
              if (!open) {
                field.handleBlur();
              }
            }}
            onValueChange={(value) => field.handleChange(value as TaskStatus)}
            value={field.state.value}
          >
            <SelectTrigger className="h-12 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-zinc-100">
              {TASK_STATUSES.map((status) => (
                <SelectItem
                  className="rounded-lg font-medium"
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </form.Field>
  );
}

function DonorSelectorField({
  donorListboxId,
  donorSearchOpen,
  donors,
  form,
  loadingDonors,
  onDonorSearchOpenChange,
}: {
  donorListboxId: string;
  donorSearchOpen: boolean;
  donors: SimpleDonor[];
  form: MissionaryTaskFormApi;
  loadingDonors: boolean;
  onDonorSearchOpenChange: (open: boolean) => void;
}) {
  return (
    <form.Field name="donor_id">
      {(field) => {
        const selectedDonor = donors.find(
          (donor) => donor.id === field.state.value,
        );

        return (
          <div className="grid gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Associated Partner
            </span>

            <Popover
              onOpenChange={onDonorSearchOpenChange}
              open={donorSearchOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  aria-controls={donorListboxId}
                  aria-expanded={donorSearchOpen}
                  className={cn(
                    "h-12 justify-between rounded-xl border-transparent bg-zinc-50 font-medium transition-all hover:bg-zinc-100",
                    !field.state.value && "text-zinc-400",
                  )}
                  role="combobox"
                  type="button"
                  variant="outline"
                >
                  {selectedDonor ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage
                          src={selectedDonor.avatar_url || undefined}
                        />
                        <AvatarFallback className="bg-zinc-200 text-[10px] font-bold">
                          {selectedDonor.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedDonor.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>Select partner (optional)</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {field.state.value ? (
                      <X
                        className="size-4 text-zinc-400 hover:text-zinc-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          field.handleChange("");
                        }}
                      />
                    ) : null}
                    <ChevronsUpDown className="size-4 opacity-50" />
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="w-[400px] rounded-xl p-0"
              >
                <Command className="rounded-xl">
                  <CommandInput
                    className="h-11"
                    placeholder="Search partners..."
                  />
                  <CommandList id={donorListboxId}>
                    <CommandEmpty>
                      {loadingDonors ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin text-zinc-400" />
                        </div>
                      ) : (
                        "No partners found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {donors.map((donor) => (
                        <CommandItem
                          className="rounded-lg"
                          key={donor.id}
                          onSelect={() => {
                            field.handleChange(
                              donor.id === field.state.value ? "" : donor.id,
                            );
                            field.handleBlur();
                            onDonorSearchOpenChange(false);
                          }}
                          value={donor.name}
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage
                                src={donor.avatar_url || undefined}
                              />
                              <AvatarFallback className="bg-zinc-100 text-[10px] font-bold">
                                {donor.name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {donor.name}
                              </p>
                              {donor.email ? (
                                <p className="truncate text-xs text-zinc-400">
                                  {donor.email}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "size-4 shrink-0",
                              field.state.value === donor.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <p className="text-xs text-zinc-400">
              Link this task to a specific partner for easy tracking
            </p>
          </div>
        );
      }}
    </form.Field>
  );
}

function TaskDescriptionField({ form }: { form: MissionaryTaskFormApi }) {
  return (
    <form.AppField name="description">
      {(field) => (
        <field.TextareaField
          inputClassName="min-h-[80px] resize-none rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
          label="Description"
          labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
          placeholder="Add details about this task..."
        />
      )}
    </form.AppField>
  );
}

function TaskNotesField({ form }: { form: MissionaryTaskFormApi }) {
  return (
    <form.AppField name="notes">
      {(field) => (
        <field.TextareaField
          description="These notes are only visible to you"
          descriptionClassName="text-xs text-zinc-400"
          inputClassName="min-h-[60px] resize-none rounded-xl border-transparent bg-amber-50/50 font-medium transition-all focus:bg-amber-50 focus:ring-2 focus:ring-amber-900/5"
          label="Internal Notes"
          labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
          placeholder="Private notes (not visible to partner)..."
        />
      )}
    </form.AppField>
  );
}

export function TaskDialog({
  task,
  defaultDonorId,
  initialStatus,
  onSuccess,
  onClose,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: TaskDialogProps) {
  const { profile } = useAuth();
  const supabase = React.useMemo(() => createBrowserClient(), []);

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const [donors, setDonors] = React.useState<SimpleDonor[]>([]);
  const [loadingDonors, setLoadingDonors] = React.useState(false);
  const [donorSearchOpen, setDonorSearchOpen] = React.useState(false);
  const donorListboxId = React.useId();

  const isEditing = !!task;
  const initialFormValues = React.useMemo(
    () =>
      createInitialTaskFormValues({
        task,
        defaultDonorId,
        initialStatus,
      }),
    [task, defaultDonorId, initialStatus],
  );

  const form = useMissionaryTaskForm({
    task,
    defaultDonorId,
    initialStatus,
    onClose,
    onSuccess,
    profileId: profile?.id,
    setOpen,
    supabase,
  });

  const fetchDonors = React.useCallback(async () => {
    if (!profile?.id) {
      return;
    }

    setLoadingDonors(true);

    try {
      const { data, error } = await supabase
        .from("donors")
        .select("id, name, email, avatar_url")
        .eq("missionary_id", profile.id)
        .order("name");

      if (error) {
        console.error("Error fetching donors:", error);
        return;
      }

      setDonors(data || []);
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoadingDonors(false);
    }
  }, [profile?.id, supabase]);

  React.useEffect(() => {
    if (open && profile?.id && donors.length === 0 && !loadingDonors) {
      void fetchDonors();
    }
  }, [open, profile?.id, donors.length, loadingDonors, fetchDonors]);

  React.useEffect(() => {
    if (open) {
      form.reset(initialFormValues);
    }
  }, [open, form, initialFormValues]);

  const handleClose = React.useCallback(() => {
    form.reset(initialFormValues);
    setDonorSearchOpen(false);
    setOpen?.(false);
    onClose?.();
  }, [form, initialFormValues, onClose, setOpen]);

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
          return;
        }

        setOpen?.(nextOpen);
      }}
      open={open}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-[2rem] border-zinc-100 p-0 sm:max-w-[600px]">
        <div className="bg-zinc-900 p-8 text-white">
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isEditing ? "Edit Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {isEditing ? "Update task details" : "Add a new follow-up task"}
          </DialogDescription>
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-8">
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
              }}
            >
              <TaskTitleField form={form} />

              <div className="grid grid-cols-2 gap-4">
                <TaskTypeSelectField form={form} />
                <PrioritySelectField form={form} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DatePickerField
                  form={form}
                  icon={CalendarIcon}
                  label="Due Date"
                  name="due_date"
                  placeholder="Select date"
                />
                <DatePickerField
                  form={form}
                  icon={Bell}
                  label="Reminder Date"
                  name="reminder_date"
                  placeholder="Set reminder"
                />
              </div>

              <StatusSelectField form={form} />

              <DonorSelectorField
                donorListboxId={donorListboxId}
                donorSearchOpen={donorSearchOpen}
                donors={donors}
                form={form}
                loadingDonors={loadingDonors}
                onDonorSearchOpenChange={setDonorSearchOpen}
              />

              <TaskDescriptionField form={form} />
              <TaskNotesField form={form} />

              <div className="flex gap-3 border-t border-zinc-100 pt-4">
                <Button
                  className="h-12 flex-1 rounded-xl border-zinc-200 text-[10px] font-black uppercase tracking-widest"
                  onClick={handleClose}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>

                <form.Subscribe
                  selector={(state) => ({
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                  })}
                >
                  {({ canSubmit, isSubmitting }) => (
                    <Button
                      className="h-12 flex-1 rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800"
                      disabled={!canSubmit || isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : isEditing ? (
                        "Update Task"
                      ) : (
                        "Create Task"
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
