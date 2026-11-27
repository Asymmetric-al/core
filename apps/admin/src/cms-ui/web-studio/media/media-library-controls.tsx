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
  AlertDialogTrigger,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Trash2, Upload } from "lucide-react";
import { useId, useState } from "react";

import {
  deleteMediaFile,
  mediaAddress,
  mediaDetailsErrors,
  MEDIA_UPLOAD_TYPES,
  registerUploadedMedia,
  uploadMediaFile,
  type MediaDetails,
  type MediaUploadOutcome,
} from "./media-upload";

import type { FormEvent } from "react";

export function mediaThumbnail(doc: Record<string, unknown>): string | null {
  return typeof doc.id === "string" ? mediaAddress(doc.id, "w320") : null;
}

type Pending = { assetId: string; details: MediaDetails } | null;

type Field = "file" | "alt" | "credit" | "folder";

const FIELDS: Field[] = ["file", "alt", "credit", "folder"];

const NOT_UPLOADED = "The image was not uploaded. Try again.";

const trimmedOrNull = (value: string) => {
  const text = value.trim();
  return text ? text : null;
};

async function settled(
  outcome: () => Promise<MediaUploadOutcome>,
  pending: Pending,
): Promise<MediaUploadOutcome> {
  try {
    return await outcome();
  } catch {
    return pending
      ? {
          ok: false,
          stage: "register",
          assetId: pending.assetId,
          message:
            "The image was stored but not added to the library. Try again.",
        }
      : { ok: false, stage: "start", message: NOT_UPLOADED };
  }
}

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
  };
  const errorIds = {
    file: useId(),
    alt: useId(),
    credit: useId(),
    folder: useId(),
  };
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<Field, string>>
  >({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [credit, setCredit] = useState("");
  const [folder, setFolder] = useState("");
  const locked = busy || pending !== null;

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

  const finish = (outcome: MediaUploadOutcome, details: MediaDetails) => {
    setBusy(false);
    if (outcome.ok) {
      reset();
      setOpen(false);
      onUploaded(outcome.id);
      return;
    }
    setFailure(outcome.message);
    setPending(
      outcome.stage === "register" && outcome.assetId
        ? { assetId: outcome.assetId, details }
        : null,
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const details: MediaDetails = {
      alt: alt.trim(),
      credit: trimmedOrNull(credit),
      folder: trimmedOrNull(folder),
    };
    const errors: Partial<Record<Field, string>> = {
      ...(file ? {} : { file: "Choose an image to upload." }),
      ...mediaDetailsErrors(details),
    };
    setFieldErrors(errors);
    setFailure(null);
    const firstInvalid = FIELDS.find((field) => errors[field]);
    if (!file || firstInvalid) {
      if (firstInvalid) document.getElementById(ids[firstInvalid])?.focus();
      return;
    }
    setBusy(true);
    finish(await settled(() => uploadMediaFile(file, details), null), details);
  };

  const retry = async () => {
    if (!pending) return;
    setBusy(true);
    finish(
      await settled(
        () => registerUploadedMedia(pending.assetId, pending.details),
        pending,
      ),
      pending.details,
    );
  };

  const fieldProps = (field: Field) => ({
    id: ids[field],
    name: field,
    disabled: locked,
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": fieldErrors[field] ? errorIds[field] : undefined,
  });

  const fieldError = (field: Field) =>
    fieldErrors[field] ? (
      <p id={errorIds[field]} className="text-sm text-destructive">
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) reset();
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <Upload aria-hidden="true" />
            Upload image
          </Button>
        }
      />
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
              {...fieldProps("file")}
              type="file"
              accept={MEDIA_UPLOAD_TYPES.join(",")}
              onChange={(event) =>
                setFile(event.currentTarget.files?.[0] ?? null)
              }
            />
            {fieldError("file")}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.alt}>Alt text</Label>
            <Input
              {...fieldProps("alt")}
              value={alt}
              onChange={(event) => setAlt(event.currentTarget.value)}
            />
            {fieldError("alt")}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.credit}>Credit</Label>
            <Input
              {...fieldProps("credit")}
              value={credit}
              onChange={(event) => setCredit(event.currentTarget.value)}
            />
            {fieldError("credit")}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.folder}>Folder</Label>
            <Input
              {...fieldProps("folder")}
              value={folder}
              onChange={(event) => setFolder(event.currentTarget.value)}
            />
            {fieldError("folder")}
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
            <DialogClose
              disabled={busy}
              render={<Button type="button" variant="outline" />}
            >
              Cancel
            </DialogClose>
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
    const outcome = await deleteMediaFile(id).catch(() => ({
      ok: false as const,
      message: "The image was not deleted. Try again.",
    }));
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
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 aria-hidden="true" />
            Delete image
          </Button>
        }
      />
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
