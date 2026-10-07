"use client";

import { createBrowserClient } from "@asym/database/supabase";
import { useAuth } from "@asym/lib/hooks";
import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";
import { Button } from "@asym/ui/components/shadcn/button";
import { Calendar } from "@asym/ui/components/shadcn/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectControlLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";
import {
  Bell,
  CalendarIcon,
  CheckSquare,
  Flag,
  Heart,
  Loader2,
  Mail,
  Phone,
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
import { TaskPartnerSelect } from "./task-partner-select";

import type { TaskPartner } from "./task-partner-select";
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
    color: "text-info bg-info/10",
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
    color: "text-info bg-info/10",
  },
  {
    value: "to_do",
    label: "To-do",
    icon: CheckSquare,
    color: "text-muted-foreground bg-muted",
  },
  {
    value: "follow_up",
    label: "Follow Up",
    icon: UserPlus,
    color: "text-warning bg-warning/10",
  },
  {
    value: "thank_you",
    label: "Thank You",
    icon: Heart,
    color: "text-success bg-success/10",
  },
  {
    value: "meeting",
    label: "Meeting",
    icon: Users,
    color: "text-info bg-info/10",
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
  { value: "none", label: "None", color: "text-muted-foreground" },
  { value: "low", label: "Low", color: "text-info" },
  { value: "medium", label: "Medium", color: "text-warning" },
  { value: "high", label: "High", color: "text-destructive" },
];

export interface TaskDialogProps {
  task?: Task | null;
  defaultDonorId?: string | null;
  initialStatus?: TaskStatus;
  onSuccess?: (task: Task) => void;
  onClose?: () => void;
  trigger?: React.ReactElement;
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
          label="Task Title *"
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
            <Select
              items={TASK_TYPES}
              onOpenChange={(open) => {
                if (!open) {
                  field.handleBlur();
                }
              }}
              onValueChange={(value) => {
                if (value !== null) field.handleChange(value);
              }}
              value={field.state.value}
            >
              <SelectControlLabel>Task Type</SelectControlLabel>
              <SelectTrigger>
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
              <SelectContent>
                <SelectGroup>
                  {TASK_TYPES.map((taskType) => (
                    <SelectItem key={taskType.value} value={taskType.value}>
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
                </SelectGroup>
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
          <Select
            items={TASK_PRIORITIES}
            onOpenChange={(open) => {
              if (!open) {
                field.handleBlur();
              }
            }}
            onValueChange={(value) => {
              if (value !== null) field.handleChange(value);
            }}
            value={field.state.value}
          >
            <SelectControlLabel>Priority</SelectControlLabel>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {TASK_PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center gap-2">
                      <Flag className={cn("size-4", priority.color)} />
                      <span className="font-medium">{priority.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
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
  const fieldId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <form.Field name={name}>
      {(field) => (
        <Field>
          <FieldLabel id={`${fieldId}-label`} htmlFor={fieldId}>
            {label}
          </FieldLabel>
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0 flex-1">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      ref={triggerRef}
                      id={fieldId}
                      aria-labelledby={`${fieldId}-label ${fieldId}-value`}
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      <Icon aria-hidden data-icon="inline-start" />
                      <span id={`${fieldId}-value`} className="truncate">
                        {field.state.value
                          ? format(field.state.value, "PPP")
                          : placeholder}
                      </span>
                    </Button>
                  }
                />
                <PopoverContent align="start" className="w-auto">
                  <Calendar
                    mode="single"
                    onSelect={(date) => field.handleChange(date ?? null)}
                    selected={field.state.value ?? undefined}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {field.state.value ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Clear ${label}`}
                onClick={() => {
                  field.handleChange(null);
                  triggerRef.current?.focus();
                }}
              >
                <X aria-hidden />
              </Button>
            ) : null}
          </div>
        </Field>
      )}
    </form.Field>
  );
}

function StatusSelectField({ form }: { form: MissionaryTaskFormApi }) {
  return (
    <form.Field name="status">
      {(field) => (
        <div className="grid gap-2">
          <Select
            items={TASK_STATUSES}
            onOpenChange={(open) => {
              if (!open) {
                field.handleBlur();
              }
            }}
            onValueChange={(value) => {
              if (value !== null) field.handleChange(value);
            }}
            value={field.state.value}
          >
            <SelectControlLabel>Status</SelectControlLabel>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {TASK_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
    </form.Field>
  );
}

function DonorSelectorField({
  donorSearchOpen,
  donors,
  selectedPartner,
  form,
  loadingDonors,
  onDonorSearchOpenChange,
}: {
  donorSearchOpen: boolean;
  donors: TaskPartner[];
  selectedPartner?: TaskPartner | null;
  form: MissionaryTaskFormApi;
  loadingDonors: boolean;
  onDonorSearchOpenChange: (open: boolean) => void;
}) {
  return (
    <form.Field name="donor_id">
      {(field) => (
        <TaskPartnerSelect
          donors={donors}
          selectedPartner={selectedPartner}
          value={field.state.value}
          loading={loadingDonors}
          onChange={field.handleChange}
          onBlur={field.handleBlur}
          open={donorSearchOpen}
          onOpenChange={onDonorSearchOpenChange}
        />
      )}
    </form.Field>
  );
}

function TaskDescriptionField({ form }: { form: MissionaryTaskFormApi }) {
  return (
    <form.AppField name="description">
      {(field) => (
        <field.TextareaField
          label="Description"
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
          label="Internal Notes"
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

  const [donors, setDonors] = React.useState<TaskPartner[]>([]);
  const [loadingDonors, setLoadingDonors] = React.useState(false);
  const [donorSearchOpen, setDonorSearchOpen] = React.useState(false);

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
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent className="sm:max-w-150" scrollable>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update task details" : "Add a new follow-up task"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <TaskTitleField form={form} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TaskTypeSelectField form={form} />
              <PrioritySelectField form={form} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              donorSearchOpen={donorSearchOpen}
              donors={donors}
              selectedPartner={task?.donor}
              form={form}
              loadingDonors={loadingDonors}
              onDonorSearchOpenChange={setDonorSearchOpen}
            />

            <TaskDescriptionField form={form} />
            <TaskNotesField form={form} />

            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button onClick={handleClose} type="button" variant="outline">
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
                    disabled={!canSubmit || isSubmitting}
                    type="submit"
                    aria-busy={isSubmitting || undefined}
                  >
                    {isSubmitting ? (
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                    ) : null}
                    {isSubmitting
                      ? isEditing
                        ? "Updating task…"
                        : "Creating task…"
                      : isEditing
                        ? "Update Task"
                        : "Create Task"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
