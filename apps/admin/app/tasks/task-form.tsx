"use client";

import { Dialog, DialogContent } from "@asym/ui/components/shadcn/dialog";
import { format } from "date-fns";
import { useReducer } from "react";

import {
  TaskFormDialogFooter,
  TaskFormDialogHeader,
  TaskFormFields,
} from "./task-form-sections";

import type {
  Task,
  TaskType,
  TaskPriority,
  StaffMember,
  LinkedEntity,
  TaskReminder,
} from "./types";

interface TaskFormProps {
  open: boolean;
  task?: Task | null;
  staffMembers: StaffMember[];
  linkedEntities: LinkedEntity[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

interface TaskFormState {
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
}

type TaskFormAction =
  | { type: "patch"; payload: Partial<TaskFormState> }
  | { type: "add_reminder"; reminder: Partial<TaskReminder> }
  | { type: "remove_reminder"; index: number }
  | { type: "update_reminder"; index: number; payload: Partial<TaskReminder> }
  | { type: "add_tag"; tag: string }
  | { type: "remove_tag"; tag: string };

function createReminderId(
  reminder: Partial<TaskReminder>,
  index: number,
): string {
  if (typeof reminder.id === "string" && reminder.id.trim().length > 0) {
    return reminder.id;
  }

  const reminderTimestamp = reminder.remind_at ?? `index-${index}`;
  const reminderType = reminder.type ?? "notification";
  return `rem-${reminderType}-${reminderTimestamp}-${index}`;
}

function createNewReminderId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `rem-${crypto.randomUUID()}`;
  }
  return `rem-new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeReminders(
  reminders: Partial<TaskReminder>[] | TaskReminder[] | undefined,
): Partial<TaskReminder>[] {
  return (reminders ?? []).map((reminder, index) => ({
    ...reminder,
    id: createReminderId(reminder, index),
  }));
}

function createInitialFormState(task?: Task | null): TaskFormState {
  if (task) {
    return {
      title: task.title,
      description: task.description || "",
      type: task.type,
      priority: task.priority,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      dueTime: task.due_time || "",
      assignedTo: task.assigned_to,
      linkedEntity: task.linked_entity,
      reminders: normalizeReminders(task.reminders),
      tags: task.tags || [],
      searchValue: "",
      showEntitySearch: false,
    };
  }

  return {
    title: "",
    description: "",
    type: "todo",
    priority: "medium",
    dueDate: new Date(),
    dueTime: "",
    assignedTo: undefined,
    linkedEntity: undefined,
    reminders: [],
    tags: [],
    searchValue: "",
    showEntitySearch: false,
  };
}

function taskFormReducer(
  state: TaskFormState,
  action: TaskFormAction,
): TaskFormState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.payload };
    case "add_reminder":
      return {
        ...state,
        reminders: [
          ...state.reminders,
          {
            ...action.reminder,
            id: createReminderId(action.reminder, state.reminders.length),
          },
        ],
      };
    case "remove_reminder":
      return {
        ...state,
        reminders: state.reminders.filter((_, i) => i !== action.index),
      };
    case "update_reminder":
      return {
        ...state,
        reminders: state.reminders.map((reminder, index) =>
          index === action.index
            ? { ...reminder, ...action.payload }
            : reminder,
        ),
      };
    case "add_tag":
      if (state.tags.includes(action.tag)) {
        return state;
      }
      return { ...state, tags: [...state.tags, action.tag] };
    case "remove_tag":
      return { ...state, tags: state.tags.filter((tag) => tag !== action.tag) };
    default:
      return state;
  }
}

export function TaskForm(props: TaskFormProps) {
  const formInstanceKey = `${props.task?.id ?? "new"}:${props.open ? "open" : "closed"}`;
  return <TaskFormInner key={formInstanceKey} {...props} />;
}

function TaskFormInner({
  open,
  task,
  staffMembers,
  linkedEntities,
  onClose,
  onSave,
}: TaskFormProps) {
  const initialState = createInitialFormState(task);
  const [formState, dispatchForm] = useReducer(taskFormReducer, initialState);
  const isEdit = !!task?.id;
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
  } = formState;

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

    dispatchForm({
      type: "add_reminder",
      reminder: {
        id: createNewReminderId(),
        remind_at: defaultReminder.toISOString(),
        type: "notification",
        sent: false,
      },
    });
  };

  const removeReminder = (index: number) => {
    dispatchForm({ type: "remove_reminder", index });
  };

  const removeTag = (tagToRemove: string) => {
    dispatchForm({ type: "remove_tag", tag: tagToRemove });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden rounded-2xl">
        <TaskFormDialogHeader isEdit={isEdit} />

        <TaskFormFields
          title={title}
          description={description}
          type={type}
          priority={priority}
          dueDate={dueDate}
          dueTime={dueTime}
          assignedTo={assignedTo}
          linkedEntity={linkedEntity}
          reminders={reminders}
          tags={tags}
          searchValue={searchValue}
          showEntitySearch={showEntitySearch}
          staffMembers={staffMembers}
          linkedEntities={linkedEntities}
          onTitleChange={(value) =>
            dispatchForm({ type: "patch", payload: { title: value } })
          }
          onDescriptionChange={(value) =>
            dispatchForm({ type: "patch", payload: { description: value } })
          }
          onTypeChange={(value) =>
            dispatchForm({ type: "patch", payload: { type: value } })
          }
          onPriorityChange={(value) =>
            dispatchForm({ type: "patch", payload: { priority: value } })
          }
          onDueDateChange={(value) =>
            dispatchForm({ type: "patch", payload: { dueDate: value } })
          }
          onDueTimeChange={(value) =>
            dispatchForm({ type: "patch", payload: { dueTime: value } })
          }
          onAssignedToChange={(value) =>
            dispatchForm({ type: "patch", payload: { assignedTo: value } })
          }
          onLinkedEntityChange={(value) =>
            dispatchForm({ type: "patch", payload: { linkedEntity: value } })
          }
          onShowEntitySearchChange={(value) =>
            dispatchForm({
              type: "patch",
              payload: { showEntitySearch: value },
            })
          }
          onAddReminder={addReminder}
          onRemoveReminder={removeReminder}
          onUpdateReminder={(index, payload) =>
            dispatchForm({ type: "update_reminder", index, payload })
          }
          onAddTag={(value) => dispatchForm({ type: "add_tag", tag: value })}
          onRemoveTag={removeTag}
          onTagSearchChange={(value) =>
            dispatchForm({ type: "patch", payload: { searchValue: value } })
          }
        />

        <TaskFormDialogFooter
          isEdit={isEdit}
          saveDisabled={!title.trim()}
          onClose={onClose}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
}
