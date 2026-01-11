"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Loader2,
  CalendarIcon,
  Phone,
  Mail,
  CheckSquare,
  UserPlus,
  Heart,
  Users,
  Clock,
  Bell,
  Flag,
  X,
  Check,
  ChevronsUpDown,
  User,
} from "lucide-react";
import type {
  Task,
  TaskFormData,
  TaskType,
  TaskStatus,
  TaskPriority,
} from "@/lib/missionary/types";

const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  notes: z.string().optional(),
  task_type: z.enum([
    "call",
    "email",
    "to_do",
    "follow_up",
    "thank_you",
    "meeting",
  ]),
  status: z.enum([
    "not_started",
    "in_progress",
    "waiting",
    "completed",
    "deferred",
  ]),
  priority: z.enum(["none", "low", "medium", "high"]),
  due_date: z.date().optional().nullable(),
  reminder_date: z.date().optional().nullable(),
  donor_id: z.string().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const TASK_TYPES: {
  value: TaskType;
  label: string;
  icon: React.ElementType;
  color: string;
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

const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting", label: "Waiting" },
  { value: "completed", label: "Completed" },
  { value: "deferred", label: "Deferred" },
];

const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] =
  [
    { value: "none", label: "None", color: "text-zinc-400" },
    { value: "low", label: "Low", color: "text-blue-500" },
    { value: "medium", label: "Medium", color: "text-amber-500" },
    { value: "high", label: "High", color: "text-rose-500" },
  ];

interface SimpleDonor {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
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
  const supabase = React.useMemo(() => createClient(), []);

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [donors, setDonors] = React.useState<SimpleDonor[]>([]);
  const [loadingDonors, setLoadingDonors] = React.useState(false);
  const [donorSearchOpen, setDonorSearchOpen] = React.useState(false);

  const isEditing = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      notes: task?.notes || "",
      task_type: task?.task_type || "to_do",
      status: task?.status || initialStatus || "not_started",
      priority: task?.priority || "none",
      due_date: task?.due_date ? new Date(task.due_date) : null,
      reminder_date: task?.reminder_date ? new Date(task.reminder_date) : null,
      donor_id: task?.donor_id || defaultDonorId || null,
    },
  });

  const fetchDonors = React.useCallback(async () => {
    if (!profile?.id) return;
    setLoadingDonors(true);
    try {
      const { data, error } = await supabase
        .from("donors")
        .select("id, name, email, avatar_url")
        .eq("missionary_id", profile.id)
        .order("name");

      if (error) throw error;
      setDonors(data || []);
    } catch (e) {
      console.error("Error fetching donors:", e);
    } finally {
      setLoadingDonors(false);
    }
  }, [profile?.id, supabase]);

  React.useEffect(() => {
    if (open && profile?.id) {
      fetchDonors();
    }
  }, [open, profile?.id, fetchDonors]);

  React.useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        notes: task.notes || "",
        task_type: task.task_type || "to_do",
        status: task.status || "not_started",
        priority: task.priority || "none",
        due_date: task.due_date ? new Date(task.due_date) : null,
        reminder_date: task.reminder_date ? new Date(task.reminder_date) : null,
        donor_id: task.donor_id || defaultDonorId || null,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        notes: "",
        task_type: "to_do",
        status: initialStatus || "not_started",
        priority: "none",
        due_date: null,
        reminder_date: null,
        donor_id: defaultDonorId || null,
      });
    }
  }, [task, defaultDonorId, initialStatus, form]);

  async function onSubmit(values: TaskFormValues) {
    if (!profile?.id) {
      toast.error("Not authenticated");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        missionary_id: profile.id,
        title: values.title,
        description: values.description || null,
        notes: values.notes || null,
        task_type: values.task_type,
        status: values.status,
        priority: values.priority,
        due_date: values.due_date?.toISOString() || null,
        reminder_date: values.reminder_date?.toISOString() || null,
        donor_id: values.donor_id || null,
        is_auto_generated: false,
        updated_at: new Date().toISOString(),
      };

      let result: Task;

      if (isEditing && task) {
        const { data, error } = await supabase
          .from("missionary_tasks")
          .update(taskData)
          .eq("id", task.id)
          .select(
            `
            *,
            donor:donors!missionary_tasks_donor_id_fkey(id, name, email, avatar_url)
          `
          )
          .single();

        if (error) throw error;
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
          `
          )
          .single();

        if (error) throw error;
        result = { ...data, donor: data.donor || null };
        toast.success("Task created successfully");
      }

      form.reset();
      setOpen?.(false);
      onSuccess?.(result);
      onClose?.();
    } catch (error: unknown) {
      console.error("Error saving task:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save task";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    form.reset();
    setOpen?.(false);
    onClose?.();
  };

  const selectedDonor = donors.find((d) => d.id === form.watch("donor_id"));
  const selectedTaskType = TASK_TYPES.find(
    (t) => t.value === form.watch("task_type")
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) handleClose();
        else setOpen?.(newOpen);
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] rounded-[2rem] border-zinc-100 p-0 overflow-hidden">
        <div className="bg-zinc-900 px-8 py-8 text-white">
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isEditing ? "Edit Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
            {isEditing ? "Update task details" : "Add a new follow-up task"}
          </DialogDescription>
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Task Title *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Call to thank for donation"
                          {...field}
                          className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="task_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Task Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium">
                              <SelectValue placeholder="Select type">
                                {selectedTaskType && (
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "h-6 w-6 rounded-lg flex items-center justify-center",
                                        selectedTaskType.color
                                      )}
                                    >
                                      <selectedTaskType.icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span>{selectedTaskType.label}</span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-zinc-100">
                            {TASK_TYPES.map((type) => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                className="rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "h-6 w-6 rounded-lg flex items-center justify-center",
                                      type.color
                                    )}
                                  >
                                    <type.icon className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="font-medium">
                                    {type.label}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Priority
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-zinc-100">
                            {TASK_PRIORITIES.map((priority) => (
                              <SelectItem
                                key={priority.value}
                                value={priority.value}
                                className="rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <Flag
                                    className={cn("h-4 w-4", priority.color)}
                                  />
                                  <span className="font-medium">
                                    {priority.label}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Due Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-12 bg-zinc-50 border-transparent rounded-xl font-medium justify-start text-left hover:bg-zinc-100",
                                  !field.value && "text-zinc-400"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Select date"}
                                {field.value && (
                                  <X
                                    className="ml-auto h-4 w-4 text-zinc-400 hover:text-zinc-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange(null);
                                    }}
                                  />
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 rounded-xl"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reminder_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Reminder Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-12 bg-zinc-50 border-transparent rounded-xl font-medium justify-start text-left hover:bg-zinc-100",
                                  !field.value && "text-zinc-400"
                                )}
                              >
                                <Bell className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Set reminder"}
                                {field.value && (
                                  <X
                                    className="ml-auto h-4 w-4 text-zinc-400 hover:text-zinc-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange(null);
                                    }}
                                  />
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 rounded-xl"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-zinc-100">
                          {TASK_STATUSES.map((status) => (
                            <SelectItem
                              key={status.value}
                              value={status.value}
                              className="rounded-lg font-medium"
                            >
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="donor_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Associated Partner
                      </FormLabel>
                      <Popover
                        open={donorSearchOpen}
                        onOpenChange={setDonorSearchOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={donorSearchOpen}
                              className={cn(
                                "h-12 bg-zinc-50 border-transparent rounded-xl font-medium justify-between hover:bg-zinc-100",
                                !field.value && "text-zinc-400"
                              )}
                            >
                              {selectedDonor ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={
                                        selectedDonor.avatar_url || undefined
                                      }
                                    />
                                    <AvatarFallback className="text-[10px] font-bold bg-zinc-200">
                                      {selectedDonor.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{selectedDonor.name}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>Select partner (optional)</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                {field.value && (
                                  <X
                                    className="h-4 w-4 text-zinc-400 hover:text-zinc-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange(null);
                                    }}
                                  />
                                )}
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              </div>
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[400px] p-0 rounded-xl"
                          align="start"
                        >
                          <Command className="rounded-xl">
                            <CommandInput
                              placeholder="Search partners..."
                              className="h-11"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {loadingDonors ? (
                                  <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                  </div>
                                ) : (
                                  "No partners found."
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {donors.map((donor) => (
                                  <CommandItem
                                    key={donor.id}
                                    value={donor.name}
                                    onSelect={() => {
                                      field.onChange(
                                        donor.id === field.value
                                          ? null
                                          : donor.id
                                      );
                                      setDonorSearchOpen(false);
                                    }}
                                    className="rounded-lg"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage
                                          src={donor.avatar_url || undefined}
                                        />
                                        <AvatarFallback className="text-[10px] font-bold bg-zinc-100">
                                          {donor.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">
                                          {donor.name}
                                        </p>
                                        {donor.email && (
                                          <p className="text-xs text-zinc-400 truncate">
                                            {donor.email}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <Check
                                      className={cn(
                                        "h-4 w-4 shrink-0",
                                        field.value === donor.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-xs text-zinc-400">
                        Link this task to a specific partner for easy tracking
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add details about this task..."
                          {...field}
                          className="min-h-[80px] bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Internal Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Private notes (not visible to partner)..."
                          {...field}
                          className="min-h-[60px] bg-amber-50/50 border-transparent rounded-xl focus:bg-amber-50 focus:ring-2 focus:ring-amber-900/5 transition-all font-medium resize-none"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-zinc-400">
                        These notes are only visible to you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4 border-t border-zinc-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isEditing ? (
                      "Update Task"
                    ) : (
                      "Create Task"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
