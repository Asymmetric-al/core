"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

import type {
  SettingsEditor,
  SettingsEditorGuard,
} from "./use-settings-editor";

const EditorGuardContext =
  React.createContext<React.RefObject<SettingsEditorGuard> | null>(null);

interface SettingsEditorSheetProps<T> {
  editor: SettingsEditor<T>;
  title: string;
  description?: string;
  /** Room for rule rows and the dry run, beside the list. */
  wide?: boolean;
  /** The editor form, built on SettingsEditorForm. */
  children: React.ReactNode;
}

/**
 * Side sheet holding one settings editor beside its list, so staff keep their
 * place in the list and Cancel and Save stay in view below the fields.
 */
export function SettingsEditorSheet<T>({
  editor,
  title,
  description,
  wide = false,
  children,
}: SettingsEditorSheetProps<T>) {
  return (
    <Sheet
      open={editor.open}
      onOpenChange={(open) => {
        if (!open) editor.requestClose();
      }}
    >
      <SheetContent
        side="right"
        className={cn("w-full", wide ? "sm:max-w-2xl" : "sm:max-w-xl")}
      >
        <SheetHeader className="pr-12">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <EditorGuardContext.Provider value={editor.guard}>
          {editor.hasTarget ? children : null}
        </EditorGuardContext.Provider>
        {/* Inside the sheet, so it nests: answering it never reads as a
            click outside the sheet. */}
        <SettingsDiscardConfirmation editor={editor} />
      </SheetContent>
    </Sheet>
  );
}

interface SettingsEditorFormProps<TDraft> {
  /** Everything the form would save, compared with how it opened. */
  draft: TDraft;
  /** Whether Save has something to send; a new record always does. */
  canSave: boolean;
  isNew: boolean;
  isSaving: boolean;
  /** The record type in the create button, e.g. "macro". */
  noun: string;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

/**
 * Body and footer of a settings editor: the fields scroll, and the footer
 * holds the editor's only Cancel and Save. Reports unsaved changes to the
 * sheet so closing it asks first.
 */
export function SettingsEditorForm<TDraft>({
  draft,
  canSave,
  isNew,
  isSaving,
  noun,
  onSave,
  onCancel,
  children,
}: SettingsEditorFormProps<TDraft>) {
  const guardRef = React.useContext(EditorGuardContext);
  const serialized = JSON.stringify(draft);
  const [initial] = React.useState(serialized);
  const hasChanges = serialized !== initial;

  React.useEffect(() => {
    if (guardRef) guardRef.current = { hasChanges, isSaving };
  }, [guardRef, hasChanges, isSaving]);
  React.useEffect(
    () => () => {
      if (guardRef) guardRef.current = { hasChanges: false, isSaving: false };
    },
    [guardRef],
  );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        {children}
      </div>
      <SheetFooter className="mt-0 flex-row justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canSave || isSaving}
          focusableWhenDisabled={isSaving}
          onClick={onSave}
        >
          {isSaving ? (
            <Spinner aria-hidden="true" data-icon="inline-start" />
          ) : null}
          {isNew ? `Create ${noun}` : "Save changes"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function SettingsDiscardConfirmation<T>({
  editor,
}: {
  editor: SettingsEditor<T>;
}) {
  return (
    <AlertDialog
      open={editor.isConfirmingDiscard}
      onOpenChange={(open) => {
        if (!open) editor.keepEditing();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your changes in this editor won’t be saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={editor.discardChanges}
          >
            Discard changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
