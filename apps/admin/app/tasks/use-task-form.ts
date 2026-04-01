import { useAsymForm } from "@asym/ui/components/shadcn/form";

import {
  createInitialTaskFormValues,
  taskFormSchema,
  toTaskSavePayload,
} from "./task-form-model";

import type { StaffMember, Task } from "./types";

interface UseTaskFormOptions {
  task?: Task | null;
  staffMembers: StaffMember[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

export function useTaskForm({
  task,
  staffMembers,
  onClose,
  onSave,
}: UseTaskFormOptions) {
  return useAsymForm({
    defaultValues: createInitialTaskFormValues(task),
    validators: {
      onChange: taskFormSchema,
    },
    onSubmit: async ({ value }) => {
      onSave(
        toTaskSavePayload({
          taskId: task?.id,
          staffMembers,
          values: value,
        }),
      );
      onClose();
    },
  });
}

export type TaskFormApi = ReturnType<typeof useTaskForm>;
