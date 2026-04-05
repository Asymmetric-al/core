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
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
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
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";
import {
  Bell,
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
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
import {
  createDefaultReminder,
  type TaskFormReminder,
} from "./task-form-model";
import { TASK_PRIORITIES, TASK_TYPES } from "./types";

import type { LinkedEntity, StaffMember, TaskType } from "./types";
import type { TaskFormApi } from "./use-task-form";
import type { ComponentType } from "react";

const TYPE_ICONS: Record<TaskType, ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  follow_up: MessageSquare,
  todo: CheckSquare,
  review: FileText,
};

type RenderableFieldState = {
  form: {
    state: {
      submissionAttempts: number;
    };
  };
  state: {
    meta: {
      errors: unknown[];
      isTouched: boolean;
    };
  };
};

interface TaskFormDialogHeaderProps {
  isEdit: boolean;
}

interface TaskFormDialogFooterProps {
  form: TaskFormApi;
  isEdit: boolean;
  onClose: () => void;
}

interface TaskFormFieldsProps {
  form: TaskFormApi;
  isEntitySearchOpen: boolean;
  linkedEntities: LinkedEntity[];
  staffMembers: StaffMember[];
  tagSearchValue: string;
  onEntitySearchOpenChange: (open: boolean) => void;
  onTagSearchValueChange: (value: string) => void;
}

function getRenderableErrors(field: RenderableFieldState) {
  if (
    !field.state.meta.isTouched &&
    field.form.state.submissionAttempts === 0
  ) {
    return [];
  }

  return field.state.meta.errors.flatMap((error) => {
    if (!error) {
      return [];
    }

    if (typeof error === "string") {
      return [{ message: error }];
    }

    if (typeof error === "object" && "message" in error) {
      const message = error.message;
      if (typeof message === "string" && message.length > 0) {
        return [{ message }];
      }
    }

    return [{ message: String(error) }];
  });
}

function TaskBasicsSection({ form }: { form: TaskFormApi }) {
  return (
    <>
      <form.AppField name="title">
        {(field) => (
          <field.TextField
            inputClassName="text-sm rounded-xl"
            label="Task Title *"
            labelClassName="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            placeholder="Enter task title..."
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            inputClassName="min-h-[80px] text-sm resize-none rounded-xl"
            label="Description"
            labelClassName="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            placeholder="Add more details about this task..."
          />
        )}
      </form.AppField>
    </>
  );
}

function TaskTypeAndPrioritySection({ form }: { form: TaskFormApi }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <form.AppField name="type">
        {(field) => (
          <field.SelectField
            label="Task Type"
            labelClassName="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            options={TASK_TYPES.map((taskType) => {
              const Icon = TYPE_ICONS[taskType.value];

              return {
                label: (
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    {taskType.label}
                  </div>
                ),
                value: taskType.value,
              };
            })}
            placeholder="Select type"
            triggerClassName="text-sm rounded-xl"
          />
        )}
      </form.AppField>

      <form.AppField name="priority">
        {(field) => (
          <field.SelectField
            label="Priority"
            labelClassName="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            options={TASK_PRIORITIES.map((taskPriority) => ({
              label: (
                <Badge
                  className={cn(
                    "h-5 rounded-md text-[10px]",
                    taskPriority.color,
                  )}
                  variant="outline"
                >
                  {taskPriority.label}
                </Badge>
              ),
              value: taskPriority.value,
            }))}
            placeholder="Select priority"
            triggerClassName="text-sm rounded-xl"
          />
        )}
      </form.AppField>
    </div>
  );
}

function TaskDueDateSection({ form }: { form: TaskFormApi }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <form.Field name="dueDate">
        {(field) => {
          const errors = getRenderableErrors(field);

          return (
            <Field data-invalid={errors.length > 0}>
              <FieldLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="size-3" /> Due Date
              </FieldLabel>
              <FieldContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className={cn(
                        "w-full justify-start rounded-xl text-left text-sm font-normal",
                        !field.state.value && "text-muted-foreground",
                      )}
                      type="button"
                      variant="outline"
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {field.state.value
                        ? format(field.state.value, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-auto rounded-2xl p-0"
                  >
                    <Calendar
                      initialFocus
                      mode="single"
                      onSelect={(date) => {
                        field.handleChange(date);
                        field.handleBlur();
                      }}
                      selected={field.state.value}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={errors} />
              </FieldContent>
            </Field>
          );
        }}
      </form.Field>

      <form.AppField name="dueTime">
        {(field) => (
          <field.TextField
            inputClassName="text-sm rounded-xl"
            label="Time (Optional)"
            labelClassName="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"
            type="time"
          />
        )}
      </form.AppField>
    </div>
  );
}

function TaskAssigneeSection({
  form,
  staffMembers,
}: {
  form: TaskFormApi;
  staffMembers: StaffMember[];
}) {
  return (
    <form.AppField name="assignedTo">
      {(field) => (
        <field.SelectField
          label={
            <span className="flex items-center gap-1.5">
              <User className="size-3" /> Assign To
            </span>
          }
          labelClassName="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
          options={staffMembers.map((staff) => ({
            label: (
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
            ),
            value: staff.id,
          }))}
          placeholder="Select team member..."
          triggerClassName="text-sm rounded-xl"
        />
      )}
    </form.AppField>
  );
}

function TaskLinkedRecordSection({
  form,
  isEntitySearchOpen,
  linkedEntities,
  onEntitySearchOpenChange,
}: Pick<
  TaskFormFieldsProps,
  "form" | "isEntitySearchOpen" | "linkedEntities" | "onEntitySearchOpenChange"
>) {
  return (
    <form.Field name="linkedEntity">
      {(field) => (
        <Field>
          <FieldLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Link2 className="size-3" /> Link to Record
          </FieldLabel>
          <FieldContent>
            {field.state.value ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 border border-border">
                    <AvatarImage src={field.state.value.avatar} />
                    <AvatarFallback>{field.state.value.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {field.state.value.name}
                    </p>
                    <Badge
                      className="text-[9px] h-4 capitalize rounded-md"
                      variant="secondary"
                    >
                      {field.state.value.type}
                    </Badge>
                  </div>
                </div>
                <Button
                  className="size-8 rounded-xl"
                  onClick={() => field.handleChange(undefined)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Popover
                onOpenChange={onEntitySearchOpenChange}
                open={isEntitySearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    className="w-full justify-start rounded-xl text-sm text-muted-foreground"
                    type="button"
                    variant="outline"
                  >
                    <Plus className="mr-2 size-4" />
                    Link a donor, missionary, or contact...
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[400px] rounded-2xl p-0"
                >
                  <Command className="rounded-2xl">
                    <CommandInput placeholder="Search records..." />
                    <CommandList>
                      <CommandEmpty>No records found.</CommandEmpty>
                      <CommandGroup heading="Donors">
                        {linkedEntities
                          .filter((entity) => entity.type === "donor")
                          .map((entity) => (
                            <CommandItem
                              className="cursor-pointer rounded-xl"
                              key={entity.id}
                              onSelect={() => {
                                field.handleChange(entity);
                                onEntitySearchOpenChange(false);
                              }}
                            >
                              <Avatar className="mr-2 size-6 border border-border">
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
                              className="cursor-pointer rounded-xl"
                              key={entity.id}
                              onSelect={() => {
                                field.handleChange(entity);
                                onEntitySearchOpenChange(false);
                              }}
                            >
                              <Avatar className="mr-2 size-6 border border-border">
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
                              className="cursor-pointer rounded-xl"
                              key={entity.id}
                              onSelect={() => {
                                field.handleChange(entity);
                                onEntitySearchOpenChange(false);
                              }}
                            >
                              <Avatar className="mr-2 size-6 border border-border">
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
          </FieldContent>
        </Field>
      )}
    </form.Field>
  );
}

function TaskRemindersSection({ form }: { form: TaskFormApi }) {
  return (
    <form.Field mode="array" name="reminders">
      {(remindersField) => (
        <Field>
          <FieldLabel className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Bell className="size-3" /> Reminders
            </span>
            <Button
              className="h-7 rounded-xl text-xs"
              onClick={() =>
                remindersField.pushValue(
                  createDefaultReminder(form.getFieldValue("dueDate")),
                )
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              <Plus className="mr-1 size-3" /> Add Reminder
            </Button>
          </FieldLabel>
          <FieldContent>
            {remindersField.state.value.length > 0 ? (
              <div className="space-y-2">
                {remindersField.state.value.map(
                  (reminder: TaskFormReminder, index: number) => (
                    <div
                      className="space-y-2 rounded-xl border border-border bg-muted/30 p-3"
                      key={reminder.id ?? index}
                    >
                      <div className="flex items-center gap-2">
                        <form.Field name={`reminders[${index}].remind_at`}>
                          {(field) => (
                            <Input
                              className="h-8 flex-1 rounded-lg text-sm"
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(
                                  event.target.value
                                    ? new Date(event.target.value).toISOString()
                                    : "",
                                )
                              }
                              type="datetime-local"
                              value={
                                field.state.value
                                  ? format(
                                      new Date(field.state.value),
                                      "yyyy-MM-dd'T'HH:mm",
                                    )
                                  : ""
                              }
                            />
                          )}
                        </form.Field>

                        <form.Field name={`reminders[${index}].type`}>
                          {(field) => (
                            <Select
                              onOpenChange={(open) => {
                                if (!open) {
                                  field.handleBlur();
                                }
                              }}
                              onValueChange={(value) =>
                                field.handleChange(
                                  value as TaskFormReminder["type"],
                                )
                              }
                              value={field.state.value || "notification"}
                            >
                              <SelectTrigger className="h-8 w-32 rounded-lg text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem
                                  className="rounded-lg"
                                  value="notification"
                                >
                                  Notification
                                </SelectItem>
                                <SelectItem
                                  className="rounded-lg"
                                  value="email"
                                >
                                  Email
                                </SelectItem>
                                <SelectItem className="rounded-lg" value="both">
                                  Both
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </form.Field>

                        <Button
                          className="size-8 shrink-0 rounded-lg"
                          onClick={() => remindersField.removeValue(index)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <form.Field name={`reminders[${index}].remind_at`}>
                          {(field) => (
                            <FieldError errors={getRenderableErrors(field)} />
                          )}
                        </form.Field>
                        <form.Field name={`reminders[${index}].type`}>
                          {(field) => (
                            <FieldError errors={getRenderableErrors(field)} />
                          )}
                        </form.Field>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : null}
          </FieldContent>
        </Field>
      )}
    </form.Field>
  );
}

function TaskTagsSection({
  form,
  tagSearchValue,
  onTagSearchValueChange,
}: Pick<
  TaskFormFieldsProps,
  "form" | "tagSearchValue" | "onTagSearchValueChange"
>) {
  return (
    <form.Field name="tags">
      {(field) => {
        const appendUniqueTag = (tag: string) => {
          const nextTag = tag.trim();
          if (!nextTag) {
            return;
          }

          field.handleChange([...new Set([...field.state.value, nextTag])]);
        };

        const removeTag = (tagToRemove: string) => {
          field.handleChange(
            field.state.value.filter((tag) => tag !== tagToRemove),
          );
        };

        return (
          <Field>
            <FieldLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Tags
            </FieldLabel>
            <FieldContent>
              {field.state.value.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {field.state.value.map((tagId) => {
                    const tagConfig = getTagConfig(tagId);

                    return (
                      <Badge
                        className={cn(
                          "h-6 gap-1 rounded-lg border-0 text-xs",
                          tagConfig?.color || "bg-muted text-muted-foreground",
                        )}
                        key={tagId}
                      >
                        {tagConfig?.label || tagId}
                        <button
                          className="ml-0.5 hover:opacity-70"
                          onClick={() => removeTag(tagId)}
                          type="button"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              ) : null}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-full justify-start rounded-xl text-sm text-muted-foreground"
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Plus className="mr-2 size-4" />
                    Add tags...
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[320px] rounded-2xl p-0"
                >
                  <Command className="rounded-2xl" shouldFilter={false}>
                    <CommandInput
                      onValueChange={onTagSearchValueChange}
                      placeholder="Search or create tags..."
                      value={tagSearchValue}
                    />
                    <CommandList className="max-h-[300px]">
                      {tagSearchValue.trim() &&
                      !DEFAULT_TASK_TAGS.some(
                        (tag) =>
                          tag.label.toLowerCase() ===
                          tagSearchValue.toLowerCase(),
                      ) ? (
                        <CommandGroup heading="New Tag">
                          <CommandItem
                            className="flex cursor-pointer items-center gap-2 rounded-xl"
                            onSelect={() => {
                              appendUniqueTag(tagSearchValue);
                              onTagSearchValueChange("");
                            }}
                          >
                            <div className="rounded-md bg-primary/10 p-1 text-primary">
                              <Plus className="size-3" />
                            </div>
                            <span className="text-sm">
                              Create &ldquo;{tagSearchValue}&rdquo;
                            </span>
                          </CommandItem>
                        </CommandGroup>
                      ) : null}

                      <CommandEmpty>No tags found.</CommandEmpty>

                      {TAG_CATEGORIES.map((category) => {
                        const categoryTags = DEFAULT_TASK_TAGS.filter(
                          (tag) =>
                            tag.category === category.value &&
                            tag.label
                              .toLowerCase()
                              .includes(tagSearchValue.toLowerCase()),
                        );

                        if (categoryTags.length === 0) {
                          return null;
                        }

                        return (
                          <CommandGroup
                            heading={category.label}
                            key={category.value}
                          >
                            {categoryTags.map((tag) => {
                              const isSelected = field.state.value.includes(
                                tag.id,
                              );

                              return (
                                <CommandItem
                                  className="flex cursor-pointer items-center justify-between rounded-xl"
                                  key={tag.id}
                                  onSelect={() => {
                                    if (isSelected) {
                                      removeTag(tag.id);
                                    } else {
                                      appendUniqueTag(tag.id);
                                    }
                                    onTagSearchValueChange("");
                                  }}
                                >
                                  <Badge
                                    className={cn(
                                      "h-5 rounded-md border-0 text-xs",
                                      tag.color,
                                    )}
                                  >
                                    {tag.label}
                                  </Badge>
                                  {isSelected ? (
                                    <Check className="size-4 text-emerald-600" />
                                  ) : null}
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
            </FieldContent>
          </Field>
        );
      }}
    </form.Field>
  );
}

export function TaskFormDialogHeader({ isEdit }: TaskFormDialogHeaderProps) {
  return (
    <DialogHeader className="border-b border-border px-6 py-5">
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

export function TaskFormFields({
  form,
  isEntitySearchOpen,
  linkedEntities,
  staffMembers,
  tagSearchValue,
  onEntitySearchOpenChange,
  onTagSearchValueChange,
}: TaskFormFieldsProps) {
  return (
    <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-5">
      <TaskBasicsSection form={form} />

      <TaskTypeAndPrioritySection form={form} />

      <TaskDueDateSection form={form} />

      <TaskAssigneeSection form={form} staffMembers={staffMembers} />

      <TaskLinkedRecordSection
        form={form}
        isEntitySearchOpen={isEntitySearchOpen}
        linkedEntities={linkedEntities}
        onEntitySearchOpenChange={onEntitySearchOpenChange}
      />

      <TaskRemindersSection form={form} />

      <TaskTagsSection
        form={form}
        onTagSearchValueChange={onTagSearchValueChange}
        tagSearchValue={tagSearchValue}
      />
    </div>
  );
}

export function TaskFormDialogFooter({
  form,
  isEdit,
  onClose,
}: TaskFormDialogFooterProps) {
  return (
    <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4">
      <Button
        className="rounded-xl"
        onClick={onClose}
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
            className="rounded-xl"
            disabled={!canSubmit || isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Task"}
          </Button>
        )}
      </form.Subscribe>
    </DialogFooter>
  );
}
