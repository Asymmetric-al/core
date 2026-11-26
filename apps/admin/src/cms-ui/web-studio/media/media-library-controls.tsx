"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Trash2, Upload } from "lucide-react";
import { useId, useState } from "react";

import {
  deleteMediaFile,
  mediaAddress,
  MEDIA_UPLOAD_TYPES,
  registerUploadedMedia,
  uploadMediaFile,
  type MediaDetails,
} from "./media-upload";

import type { FormEvent } from "react";

export function mediaThumbnail(doc: Record<string, unknown>): string | null {
  return typeof doc.id === "string" ? mediaAddress(doc.id, "w320") : null;
}

type Pending = { assetId: string; details: MediaDetails } | null;

const trimmedOrNull = (value: string) => {
  const text = value.trim();
  return text ? text : null;
};

export function MediaUploadButton({
  onUploaded,
}: {
  onUploaded: (id: string) => void;
}) {
  const ids = {
    file: useId(),
    alt: useId(),
    credit: useId(),
    folder: useId(),
    fileError: useId(),
    altError: useId(),
  };
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    file?: string;
    alt?: string;
  }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [credit, setCredit] = useState("");
  const [folder, setFolder] = useState("");

  const reset = () => {
    setBusy(false);
    setFieldErrors({});
    setFailure(null);
    setPending(null);
    setFile(null);
    setAlt("");
    setCredit("");
    setFolder("");
  };

  const finish = (outcome: Awaited<ReturnType<typeof uploadMediaFile>>) => {
    setBusy(false);
    if (outcome.ok) {
      reset();
      setOpen(false);
      onUploaded(outcome.id);
      return;
    }
    setFailure(outcome.message);
    setPending(null);
    return outcome;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const description = trimmedOrNull(alt);
    const errors: { file?: string; alt?: string } = {};
    if (!file) errors.file = "Choose an image to upload.";
    if (!description) {
      errors.alt = "Describe the image for people who cannot see it.";
    }
    setFieldErrors(errors);
    setFailure(null);
    if (!file || !description) return;
    const details: MediaDetails = {
      alt: description,
      credit: trimmedOrNull(credit),
      folder: trimmedOrNull(folder),
    };
    setBusy(true);
    const outcome = await uploadMediaFile(file, details);
    const failed = finish(outcome);
    if (failed && !failed.ok && failed.stage === "register" && failed.assetId) {
      setPending({ assetId: failed.assetId, details });
    }
  };

  const retry = async () => {
    if (!pending) return;
    setBusy(true);
    const kept = pending;
    const failed = finish(
      await registerUploadedMedia(kept.assetId, kept.details),
    );
    if (failed && !failed.ok) setPending(kept);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) reset();
        setOpen(next);
      }}
    >
      <Button size="sm" onClick={() => setOpen(true)}>
        <Upload aria-hidden="true" />
        Upload image
      </Button>
      <DialogContent>
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Upload image</DialogTitle>
            <DialogDescription>
              A JPEG, PNG or WebP image up to 15 MB and 25 megapixels. It is
              stored privately and shown only to signed-in staff until
              publishing arrives.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.file}>Image file</Label>
            <Input
              id={ids.file}
              name="file"
              type="file"
              accept={MEDIA_UPLOAD_TYPES.join(",")}
              onChange={(event) =>
                setFile(event.currentTarget.files?.[0] ?? null)
              }
              disabled={busy || pending !== null}
              aria-invalid={fieldErrors.file ? true : undefined}
              aria-describedby={fieldErrors.file ? ids.fileError : undefined}
            />
            {fieldErrors.file ? (
              <p id={ids.fileError} className="text-sm text-destructive">
                {fieldErrors.file}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.alt}>Alt text</Label>
            <Input
              id={ids.alt}
              name="alt"
              value={alt}
              onChange={(event) => setAlt(event.currentTarget.value)}
              disabled={busy || pending !== null}
              aria-invalid={fieldErrors.alt ? true : undefined}
              aria-describedby={fieldErrors.alt ? ids.altError : undefined}
            />
            {fieldErrors.alt ? (
              <p id={ids.altError} className="text-sm text-destructive">
                {fieldErrors.alt}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.credit}>Credit</Label>
            <Input
              id={ids.credit}
              name="credit"
              value={credit}
              onChange={(event) => setCredit(event.currentTarget.value)}
              disabled={busy || pending !== null}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.folder}>Folder</Label>
            <Input
              id={ids.folder}
              name="folder"
              value={folder}
              onChange={(event) => setFolder(event.currentTarget.value)}
              disabled={busy || pending !== null}
            />
          </div>
          {failure ? (
            <Alert variant="destructive">
              <AlertTitle>
                {pending
                  ? "The image was stored but is not in the library yet"
                  : "The image was not uploaded"}
              </AlertTitle>
              <AlertDescription>{failure}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            {pending ? (
              <Button type="button" disabled={busy} onClick={retry}>
                {busy ? <Spinner aria-hidden="true" /> : null}
                {busy ? "Adding…" : "Try again"}
              </Button>
            ) : (
              <Button type="submit" disabled={busy}>
                {busy ? <Spinner aria-hidden="true" /> : null}
                {busy ? "Uploading…" : "Upload"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MediaDeleteButton({
  id,
  label,
  onDeleted,
}: {
  id: string;
  label: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setFailure(null);
    const outcome = await deleteMediaFile(id);
    setBusy(false);
    if (outcome.ok) {
      setOpen(false);
      onDeleted();
      return;
    }
    setFailure(outcome.message);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) setFailure(null);
        setOpen(next);
      }}
    >
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden="true" />
        Delete image
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this image?</AlertDialogTitle>
          <AlertDialogDescription>
            “{label}” leaves the media library and its file is no longer served.
            Pages that use it show no image there.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {failure ? (
          <Alert variant="destructive">
            <AlertTitle>The image was not deleted</AlertTitle>
            <AlertDescription>{failure}</AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={busy} onClick={confirm}>
            {busy ? <Spinner aria-hidden="true" /> : null}
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
