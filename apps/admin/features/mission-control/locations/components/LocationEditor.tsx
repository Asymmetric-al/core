"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { useAsymForm } from "@asym/ui/components/shadcn/tanstack-form";
import { Loader2, Trash2 } from "lucide-react";
import { z } from "zod";

import { useLinkedEntities, useUpsertLocation } from "../hooks/use-locations";

import type { Location } from "../hooks/use-locations";

const locationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  type: z.enum(["missionary", "project", "custom"]),
  linked_id: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]),
  lat: z.number(),
  lng: z.number(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

function toLocationFormValues(
  location: Partial<Location> | null,
): LocationFormValues {
  return {
    id: location?.id,
    title: location?.title ?? "",
    summary: location?.summary ?? "",
    type: location?.type ?? "custom",
    linked_id: location?.linked_id ?? null,
    status: location?.status ?? "draft",
    lat: location?.lat ?? 0,
    lng: location?.lng ?? 0,
  };
}

function toFieldErrors(errors: unknown[], showErrors: boolean) {
  if (!showErrors) {
    return [];
  }

  return errors.flatMap((error) => {
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

interface LocationEditorProps {
  location: Partial<Location> | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

export function LocationEditor({
  location,
  isOpen,
  onOpenChange,
  onDelete,
}: LocationEditorProps) {
  const { mutateAsync: upsertLocation, isPending: isSaving } =
    useUpsertLocation();
  const { data: linkedEntities } = useLinkedEntities();

  const form = useAsymForm({
    defaultValues: toLocationFormValues(location),
    validators: {
      onChange: locationSchema,
    },
    onSubmit: async ({ value }) => {
      await upsertLocation({
        ...value,
        linked_id: value.type === "custom" ? null : (value.linked_id ?? null),
      });
      onOpenChange(false);
    },
  });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-black uppercase tracking-tight">
            {location?.id ? "Edit Location" : "Add Location"}
          </SheetTitle>
          <SheetDescription>
            Configure the geographical marker and its details.
          </SheetDescription>
        </SheetHeader>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.AppField name="title">
            {(field) => (
              <field.TextField
                inputClassName="rounded-xl border-zinc-200"
                label="Location Title"
                labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                placeholder="e.g. Amazon Medical Center"
              />
            )}
          </form.AppField>

          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="lat">
              {(field) => (
                <field.NumberField
                  inputClassName="rounded-xl border-zinc-200"
                  label="Latitude"
                  labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                  step="any"
                />
              )}
            </form.AppField>

            <form.AppField name="lng">
              {(field) => (
                <field.NumberField
                  inputClassName="rounded-xl border-zinc-200"
                  label="Longitude"
                  labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                  step="any"
                />
              )}
            </form.AppField>
          </div>

          <form.Field name="type">
            {(field) => {
              const showErrors =
                field.state.meta.isTouched || form.state.submissionAttempts > 0;
              const errors = toFieldErrors(field.state.meta.errors, showErrors);

              return (
                <Field data-invalid={errors.length > 0}>
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Marker Type
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      onOpenChange={(open) => {
                        if (!open) {
                          field.handleBlur();
                        }
                      }}
                      onValueChange={(value) =>
                        field.handleChange(value as LocationFormValues["type"])
                      }
                      value={field.state.value}
                    >
                      <SelectTrigger className="rounded-xl border-zinc-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="missionary">Missionary</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={errors} />
                  </FieldContent>
                </Field>
              );
            }}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.type}>
            {(selectedType) =>
              selectedType !== "custom" ? (
                <form.Field name="linked_id">
                  {(field) => {
                    const showErrors =
                      field.state.meta.isTouched ||
                      form.state.submissionAttempts > 0;
                    const errors = toFieldErrors(
                      field.state.meta.errors,
                      showErrors,
                    );
                    const options =
                      selectedType === "missionary"
                        ? (linkedEntities?.missionaries ?? []).map(
                            (missionary) => (
                              <SelectItem
                                key={missionary.id}
                                value={missionary.id}
                              >
                                {missionary.full_name}
                              </SelectItem>
                            ),
                          )
                        : [
                            <SelectItem
                              disabled
                              key="no-projects"
                              value="__empty"
                            >
                              No projects found
                            </SelectItem>,
                          ];

                    return (
                      <Field data-invalid={errors.length > 0}>
                        <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Link to{" "}
                          {selectedType === "missionary"
                            ? "Missionary"
                            : "Project"}
                        </FieldLabel>
                        <FieldContent>
                          <Select
                            onOpenChange={(open) => {
                              if (!open) {
                                field.handleBlur();
                              }
                            }}
                            onValueChange={(value) =>
                              field.handleChange(
                                value === "__empty" ? null : value,
                              )
                            }
                            value={field.state.value ?? undefined}
                          >
                            <SelectTrigger className="rounded-xl border-zinc-200">
                              <SelectValue
                                placeholder={`Select ${selectedType}`}
                              />
                            </SelectTrigger>
                            <SelectContent>{options}</SelectContent>
                          </Select>
                          <FieldError errors={errors} />
                        </FieldContent>
                      </Field>
                    );
                  }}
                </form.Field>
              ) : null
            }
          </form.Subscribe>

          <form.AppField name="summary">
            {(field) => (
              <field.TextareaField
                inputClassName="min-h-[100px] resize-none rounded-xl border-zinc-200"
                label="Summary"
                labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                placeholder="Brief description of work at this location..."
              />
            )}
          </form.AppField>

          <form.Field name="status">
            {(field) => (
              <Field
                className="rounded-[1.25rem] border border-zinc-100 bg-zinc-50/50 p-4"
                orientation="horizontal"
              >
                <FieldLabel className="flex-1">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      Published
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Visible on public map
                    </div>
                  </div>
                </FieldLabel>
                <FieldContent className="flex-none">
                  <Switch
                    checked={field.state.value === "published"}
                    onBlur={field.handleBlur}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked ? "published" : "draft")
                    }
                  />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <SheetFooter className="flex-col gap-3 border-t border-zinc-50 pt-6 sm:flex-col">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  className="h-12 w-full rounded-xl bg-zinc-900 text-[11px] font-bold uppercase tracking-widest"
                  disabled={!canSubmit || isSaving || isSubmitting}
                  type="submit"
                >
                  {(isSaving || isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {location?.id ? "Update Location" : "Save Location"}
                </Button>
              )}
            </form.Subscribe>

            {location?.id && onDelete ? (
              <Button
                className="h-12 w-full rounded-xl border-red-100 text-[11px] font-bold uppercase tracking-widest text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  if (location.id) {
                    onDelete(location.id);
                  }
                }}
                type="button"
                variant="outline"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Marker
              </Button>
            ) : null}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
