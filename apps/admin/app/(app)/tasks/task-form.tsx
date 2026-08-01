"use client";

import { Dialog, DialogContent } from "@asym/ui/components/shadcn/dialog";
import { useState } from "react";

import {
  TaskFormDialogFooter,
  TaskFormDialogHeader,
  TaskFormFields,
} from "./task-form-sections";
import { useTaskForm } from "./use-task-form";

import type { LinkedEntity, StaffMember, Task } from "./types";

interface TaskFormProps {
  open: boolean;
  task?: Task | null;
  staffMembers: StaffMember[];
  linkedEntities: LinkedEntity[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
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
  const [tagSearchValue, setTagSearchValue] = useState("");
  const [isEntitySearchOpen, setIsEntitySearchOpen] = useState(false);
  const isEdit = Boolean(task?.id);

  const form = useTaskForm({
    task,
    staffMembers,
    onClose,
    onSave,
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[600px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <TaskFormDialogHeader isEdit={isEdit} />

          <TaskFormFields
            form={form}
            isEntitySearchOpen={isEntitySearchOpen}
            linkedEntities={linkedEntities}
            staffMembers={staffMembers}
            tagSearchValue={tagSearchValue}
            onEntitySearchOpenChange={setIsEntitySearchOpen}
            onTagSearchValueChange={setTagSearchValue}
          />

          <TaskFormDialogFooter form={form} isEdit={isEdit} onClose={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
