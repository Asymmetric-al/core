"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@asym/ui/components/shadcn/field";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Textarea } from "@asym/ui/components/shadcn/textarea";

import { AVAILABLE_TAGS } from "./donors-model";
import { EditDonorDialog } from "./edit-donor-dialog";
import { useDonorsPageViewFields } from "./use-donors-page-view";

export function DonorsPageActivityDialogs() {
  const view = useDonorsPageViewFields();
  const { selected: selectedDonor } = view.donors;
  const { noteComposer, tagEditor, editDialog } = view;
  const { refreshDonors } = view.actions;
  const handleNoteComposerClose = noteComposer.close;
  const handleNoteComposerSave = noteComposer.save;
  const handleTagEditorClose = tagEditor.close;
  const handleTagEditorSave = tagEditor.save;
  return (
    <>
      <Dialog
        open={noteComposer.isOpen}
        onOpenChange={(open) => {
          if (open) {
            noteComposer.open();
            return;
          }

          noteComposer.close();
        }}
      >
        <DialogContent className="sm:max-w-125" scrollable>
          <DialogHeader>
            <DialogTitle>
              {noteComposer.activityType === "note"
                ? "Add Note"
                : noteComposer.activityType === "call"
                  ? "Log Call"
                  : noteComposer.activityType === "meeting"
                    ? "Log Meeting"
                    : "Log Email"}
            </DialogTitle>
            <DialogDescription>
              Add to {selectedDonor?.name}&apos;s timeline.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="activity-note">Activity note</FieldLabel>
              <Textarea
                id="activity-note"
                value={noteComposer.noteInput}
                onChange={(e) => noteComposer.setNoteInput(e.target.value)}
                placeholder={
                  noteComposer.activityType === "call"
                    ? "What did you discuss?"
                    : noteComposer.activityType === "meeting"
                      ? "Meeting notes..."
                      : "Type your note here..."
                }
                rows={6}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={handleNoteComposerClose}>
              Cancel
            </Button>
            <Button
              onClick={handleNoteComposerSave}
              disabled={!noteComposer.noteInput.trim() || noteComposer.isSaving}
            >
              {noteComposer.isSaving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={tagEditor.isOpen}
        onOpenChange={(open) => {
          if (open) {
            tagEditor.open();
            return;
          }

          tagEditor.close();
        }}
      >
        <DialogContent className="sm:max-w-125" scrollable>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Select tags for {selectedDonor?.name}. Tags help you organize and
              filter your partners.
            </DialogDescription>
          </DialogHeader>
          <FieldSet className="py-4">
            <FieldLegend>Partner tags</FieldLegend>
            <FieldGroup className="grid grid-cols-2 gap-3">
              {AVAILABLE_TAGS.map((tag) => (
                <Field key={tag.id} orientation="horizontal">
                  <Checkbox
                    id={`partner-tag-${tag.id}`}
                    checked={tagEditor.selectedTags.includes(tag.id)}
                    onCheckedChange={() => tagEditor.toggleTag(tag.id)}
                  />
                  <FieldLabel htmlFor={`partner-tag-${tag.id}`}>
                    {tag.label}
                  </FieldLabel>
                </Field>
              ))}
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            <Button variant="outline" onClick={handleTagEditorClose}>
              Cancel
            </Button>
            <Button onClick={handleTagEditorSave} disabled={tagEditor.isSaving}>
              {tagEditor.isSaving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                "Save Tags"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDonorDialog
        donor={selectedDonor}
        onOpenChange={(open) => {
          if (open) {
            editDialog.open();
            return;
          }

          editDialog.close();
        }}
        onSuccess={refreshDonors}
        open={editDialog.isOpen}
      />
    </>
  );
}
