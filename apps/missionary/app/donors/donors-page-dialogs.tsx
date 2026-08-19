"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import { Check, Loader2 } from "lucide-react";

import { AVAILABLE_TAGS } from "./donors-model";
import { fadeInUp, staggerContainer } from "./donors-page-motion";
import { EditDonorDialog } from "./edit-donor-dialog";
import { useDonorsPageViewFields } from "./use-donors-page-view";

export function DonorsPageActivityDialogs() {
  const view = useDonorsPageViewFields();
  const { selected: selectedDonor } = view.donors;
  const { noteComposer, tagEditor, editDialog } = view;
  const { refreshDonors } = view.actions;
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
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {noteComposer.activityType === "note"
                ? "Add Note"
                : noteComposer.activityType === "call"
                  ? "Log Call"
                  : noteComposer.activityType === "meeting"
                    ? "Log Meeting"
                    : "Log Email"}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Add to {selectedDonor?.name}&apos;s timeline.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteComposer.noteInput}
              onChange={(e) => noteComposer.setNoteInput(e.target.value)}
              placeholder={
                noteComposer.activityType === "call"
                  ? "What did you discuss?"
                  : noteComposer.activityType === "meeting"
                    ? "Meeting notes..."
                    : "Type your note here..."
              }
              className="min-h-[150px] resize-none rounded-xl border-zinc-200"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={noteComposer.close}
              className="h-10 px-6 rounded-xl border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              onClick={noteComposer.save}
              disabled={!noteComposer.noteInput.trim() || noteComposer.isSaving}
              className="h-10 px-6 rounded-xl"
            >
              {noteComposer.isSaving ? (
                <Loader2 className="size-4 animate-spin" />
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
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Manage Tags
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Select tags for {selectedDonor?.name}. Tags help you organize and
              filter your partners.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-wrap gap-2"
            >
              {AVAILABLE_TAGS.map((tag, i) => (
                <motion.button
                  key={tag.id}
                  variants={fadeInUp}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => tagEditor.toggleTag(tag.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-[color,background-color,border-color,box-shadow,transform,opacity]",
                    tagEditor.selectedTags.includes(tag.id)
                      ? cn(tag.color, "ring-2 ring-offset-1 ring-zinc-400")
                      : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100",
                  )}
                >
                  <AnimatePresence mode="wait">
                    {tagEditor.selectedTags.includes(tag.id) && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="inline-flex overflow-hidden"
                      >
                        <Check className="size-3 mr-1" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {tag.label}
                </motion.button>
              ))}
            </motion.div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={tagEditor.close}
              className="h-10 px-6 rounded-xl border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              onClick={tagEditor.save}
              disabled={tagEditor.isSaving}
              className="h-10 px-6 rounded-xl"
            >
              {tagEditor.isSaving ? (
                <Loader2 className="size-4 animate-spin" />
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
