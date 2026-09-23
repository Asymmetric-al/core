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
  FieldGroup,
  FieldLabel,
  FieldTitle,
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
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
            label="Task Title *"
            placeholder="Enter task title…"
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label="Description"
            placeholder="Add more details about this task…"
          />
        )}
      </form.AppField>
    </>
  );
}

function TaskTypeAndPrioritySection({ form }: { form: TaskFormApi }) {
  return (
    <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <form.AppField name="type">
        {(field) => (
          <field.SelectField
            triggerClassName="w-full"
            label="Task Type"
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
          />
        )}
      </form.AppField>

      <form.AppField name="priority">
        {(field) => (
          <field.SelectField
            triggerClassName="w-full"
            label="Priority"
            options={TASK_PRIORITIES.map((taskPriority) => ({
              label: (
                <Badge
                  variant={
                    taskPriority.value === "urgent"
                      ? "destructive"
                      : taskPriority.value === "high"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {taskPriority.label}
                </Badge>
              ),
              value: taskPriority.value,
            }))}
            placeholder="Select priority"
          />
        )}
      </form.AppField>
    </FieldGroup>
  );
}

function TaskDueDateSection({ form }: { form: TaskFormApi }) {
  return (
    <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <form.Field name="dueDate">
        {(field) => {
          const errors = getRenderableErrors(field);

          return (
            <Field data-invalid={errors.length > 0}>
              <FieldLabel>
                <CalendarIcon className="size-3" /> Due Date
              </FieldLabel>
              <FieldContent>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        className="w-full"
                        type="button"
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {field.state.value
                          ? format(field.state.value, "PPP")
                          : "Pick a date"}
                      </Button>
                    }
                  />
                  <PopoverContent
                    aria-label="Choose due date"
                    align="start"
                    className="w-auto"
                    collisionAvoidance={{
                      side: "shift",
                      align: "shift",
                      fallbackAxisSide: "none",
                    }}
                  >
                    <Calendar
                      defaultMonth={field.state.value}
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
        {(field) => <field.TextField label="Time (Optional)" type="time" />}
      </form.AppField>
    </FieldGroup>
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
          triggerClassName="w-full"
          label={
            <span className="flex items-center gap-1.5">
              <User className="size-3" /> Assign To
            </span>
          }
          options={staffMembers.map((staff) => ({
            label: (
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={staff.avatar_url} />
                  <AvatarFallback>{staff.name[0]}</AvatarFallback>
                </Avatar>
                <span>{staff.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({staff.role})
                </span>
              </div>
            ),
            value: staff.id,
          }))}
          placeholder="Select team member…"
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
          <FieldLabel>
            <Link2 className="size-3" /> Link to Record
          </FieldLabel>
          <FieldContent>
            {field.state.value ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={field.state.value.avatar} />
                    <AvatarFallback>{field.state.value.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {field.state.value.name}
                    </p>
                    <Badge variant="secondary">{field.state.value.type}</Badge>
                  </div>
                </div>
                <Button
                  aria-label="Remove linked record"
                  onClick={() => field.handleChange(undefined)}
                  size="icon-sm"
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
                <PopoverTrigger
                  render={
                    <Button className="w-full" type="button" variant="outline">
                      <Plus className="mr-2 size-4" />
                      <span className="truncate">
                        Link a donor, missionary, or contact…
                      </span>
                    </Button>
                  }
                />
                <PopoverContent
                  align="start"
                  className="w-100 max-w-(--available-width)"
                >
                  <Command>
                    <CommandInput popoverChrome placeholder="Search records…" />
                    <CommandList>
                      <CommandEmpty>No records found.</CommandEmpty>
                      <CommandGroup heading="Donors">
                        {linkedEntities
                          .filter((entity) => entity.type === "donor")
                          .map((entity) => (
                            <CommandItem
                              key={entity.id}
                              onSelect={() => {
                                field.handleChange(entity);
                                onEntitySearchOpenChange(false);
                              }}
                            >
                              <Avatar className="mr-2" size="sm">
                                <AvatarImage src={entity.avatar} />
                                <AvatarFallback>
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
                                field.handleChange(entity);
                                onEntitySearchOpenChange(false);
                              }}
                            >
                              <Avatar className="mr-2" size="sm">
                                <AvatarImage src={entity.avatar} />
                                <AvatarFallback>
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
                                field.handleChange(entity);
                                onEntitySearchOpenChange(false);
                              }}
                            >
                              <Avatar className="mr-2" size="sm">
                                <AvatarImage src={entity.avatar} />
                                <AvatarFallback>
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
          <div className="flex items-center justify-between gap-2">
            <FieldTitle>
              <Bell className="size-3" /> Reminders
            </FieldTitle>
            <Button
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
          </div>
          <FieldContent>
            {remindersField.state.value.length > 0 ? (
              <div className="flex flex-col gap-2">
                {remindersField.state.value.map(
                  (reminder: TaskFormReminder, index: number) => (
                    <div
                      className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-1 sm:p-3"
                      key={reminder.id ?? index}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="w-full sm:min-w-0 sm:flex-1">
                          <form.Field name={`reminders[${index}].remind_at`}>
                            {(field) => (
                              <Input
                                aria-label={`Reminder ${index + 1} time`}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(
                                    event.target.value
                                      ? new Date(
                                          event.target.value,
                                        ).toISOString()
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
                        </div>

                        <form.Field name={`reminders[${index}].type`}>
                          {(field) => (
                            <Select
                              items={{
                                notification: "Notification",
                                email: "Email",
                                both: "Both",
                              }}
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
                              <SelectTrigger
                                aria-label={`Reminder ${index + 1} channel`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="notification">
                                    Notification
                                  </SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="both">Both</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        </form.Field>

                        <Button
                          aria-label={`Remove reminder ${index + 1}`}
                          className="shrink-0"
                          onClick={() => remindersField.removeValue(index)}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>

                      <div className="flex flex-col gap-1">
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
            <FieldLabel>Tags</FieldLabel>
            <FieldContent>
              {field.state.value.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {field.state.value.map((tagId) => {
                    const tagConfig = getTagConfig(tagId);

                    return (
                      <Badge key={tagId}>
                        {tagConfig?.label || tagId}
                        <button
                          aria-label={`Remove tag ${tagConfig?.label || tagId}`}
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
                <PopoverTrigger
                  render={
                    <Button
                      className="w-full"
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Plus className="mr-2 size-4" />
                      Add tags…
                    </Button>
                  }
                />
                <PopoverContent
                  align="start"
                  className="w-80 max-w-(--available-width)"
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      popoverChrome
                      onValueChange={onTagSearchValueChange}
                      placeholder="Search or create tags…"
                      value={tagSearchValue}
                    />
                    <CommandList>
                      {tagSearchValue.trim() &&
                      !DEFAULT_TASK_TAGS.some(
                        (tag) =>
                          tag.label.toLowerCase() ===
                          tagSearchValue.toLowerCase(),
                      ) ? (
                        <CommandGroup heading="New Tag">
                          <CommandItem
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
                                  <Badge>{tag.label}</Badge>
                                  {isSelected ? (
                                    <Check className="size-4 text-primary" />
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
    <DialogHeader>
      <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
      <DialogDescription>
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
    <FieldGroup>
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
    </FieldGroup>
  );
}

export function TaskFormDialogFooter({
  form,
  isEdit,
  onClose,
}: TaskFormDialogFooterProps) {
  return (
    <DialogFooter>
      <Button onClick={onClose} type="button" variant="outline">
        Cancel
      </Button>
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button disabled={!canSubmit || isSubmitting} type="submit">
            {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}
          </Button>
        )}
      </form.Subscribe>
    </DialogFooter>
  );
}
