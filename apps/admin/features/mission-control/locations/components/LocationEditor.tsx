"use client";

import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldPrimitive,
  FieldTitle,
} from "@asym/ui/components/shadcn/field";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
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
import { Info, Loader2, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useLinkedEntities, useUpsertLocation } from "../hooks/use-locations";
import { LOCATION_TYPE_OPTIONS } from "../location-labels";

import type { Location } from "../hooks/use-locations";

const locationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  type: z.enum(["missionary", "project", "custom", "partner"]),
  linked_id: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]),
  // Empty until typed or placed on the map, so a new location never
  // silently lands at 0, 0.
  lat: z
    .number()
    .min(-90, "Latitude is between -90 and 90.")
    .max(90, "Latitude is between -90 and 90.")
    .optional()
    .refine((value) => value !== undefined, "Enter a latitude."),
  lng: z
    .number()
    .min(-180, "Longitude is between -180 and 180.")
    .max(180, "Longitude is between -180 and 180.")
    .optional()
    .refine((value) => value !== undefined, "Enter a longitude."),
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
    lat: location?.lat,
    lng: location?.lng,
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
  const publishedId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { mutateAsync: upsertLocation, isPending: isSaving } =
    useUpsertLocation();
  const { data: linkedEntities } = useLinkedEntities();

  const form = useLocationEditorForm(
    location,
    upsertLocation,
    onOpenChange,
    setSubmitError,
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>
              {location?.id ? "Edit location" : "Add location"}
            </SheetTitle>
            <SheetDescription>
              {location?.id
                ? "Change the marker's details or move it by editing its coordinates."
                : "Enter the coordinates in decimal degrees, or close this and use Place on map to drop a pin."}
            </SheetDescription>
          </SheetHeader>

          {submitError ? (
            <Alert variant="destructive">
              <AlertTitle>Location could not save</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}
          <form
            className="space-y-6 px-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.AppField name="title">
              {(field) => (
                <field.TextField
                  label="Title"
                  placeholder="For example: Amazon Medical Center"
                />
              )}
            </form.AppField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.AppField name="lat">
                {(field) => (
                  <field.NumberField
                    allowEmpty
                    label="Latitude"
                    placeholder="Between -90 and 90"
                    step="any"
                  />
                )}
              </form.AppField>

              <form.AppField name="lng">
                {(field) => (
                  <field.NumberField
                    allowEmpty
                    label="Longitude"
                    placeholder="Between -180 and 180"
                    step="any"
                  />
                )}
              </form.AppField>
            </div>

            <LocationTypeField form={form} />

            <LocationLinkedEntityField
              form={form}
              linkedEntities={linkedEntities}
            />

            <form.AppField name="summary">
              {(field) => (
                <field.TextareaField
                  inputClassName="min-h-25 resize-none"
                  label="Summary"
                  placeholder="A short description of the work here"
                />
              )}
            </form.AppField>

            <form.Field name="status">
              {(field) => (
                <FieldLabel htmlFor={publishedId}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Published</FieldTitle>
                      <FieldDescription>
                        Shown on the public map.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={publishedId}
                      aria-label="Published"
                      checked={field.state.value === "published"}
                      onBlur={field.handleBlur}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked ? "published" : "draft")
                      }
                    />
                  </Field>
                </FieldLabel>
              )}
            </form.Field>

            {/* The Mobilize sheet footer: Cancel left of the primary, and
                below it when the footer stacks; Delete sits apart. */}
            <SheetFooter className="flex-col-reverse px-0 pt-6 sm:flex-row sm:flex-wrap sm:justify-end">
              {location?.id && onDelete ? (
                <Button
                  className="sm:mr-auto"
                  onClick={() => {
                    if (location.id) {
                      onDelete(location.id);
                    }
                  }}
                  type="button"
                  variant="destructive"
                >
                  <Trash2 aria-hidden="true" /> Delete location
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ isSubmitting }) => (
                  // Stays enabled while fields are incomplete, so a press
                  // shows what is missing instead of doing nothing.
                  <Button
                    focusableWhenDisabled={isSaving || isSubmitting}
                    disabled={isSaving || isSubmitting}
                    type="submit"
                  >
                    {(isSaving || isSubmitting) && (
                      <Loader2 aria-hidden="true" className="animate-spin" />
                    )}
                    {location?.id ? "Save changes" : "Save location"}
                  </Button>
                )}
              </form.Subscribe>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LocationTypeField({
  form,
}: {
  form: ReturnType<typeof useLocationEditorForm>;
}) {
  return (
    <form.Field name="type">
      {(field) => {
        const showErrors =
          field.state.meta.isTouched || form.state.submissionAttempts > 0;
        const errors = toFieldErrors(field.state.meta.errors, showErrors);

        return (
          <FieldPrimitive.Root
            name={field.name}
            dirty={field.state.meta.isDirty}
            touched={field.state.meta.isTouched}
            invalid={errors.length > 0}
            render={<Field data-invalid={errors.length > 0} />}
          >
            <FieldPrimitive.Label nativeLabel={false} render={<FieldTitle />}>
              Marker type
            </FieldPrimitive.Label>
            <FieldContent>
              <Select<LocationFormValues["type"]>
                items={LOCATION_TYPE_OPTIONS}
                onOpenChange={(open) => {
                  if (!open) {
                    field.handleBlur();
                  }
                }}
                onValueChange={(value) => {
                  if (value !== null && value !== field.state.value) {
                    field.handleChange(value);
                    form.setFieldValue("linked_id", null);
                  }
                }}
                value={field.state.value}
              >
                <SelectTrigger aria-label="Marker type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldPrimitive.Error
                match={errors.length > 0}
                render={<FieldError errors={errors} />}
              />
            </FieldContent>
          </FieldPrimitive.Root>
        );
      }}
    </form.Field>
  );
}

function LocationLinkedEntityField({
  form,
  linkedEntities,
}: {
  form: ReturnType<typeof useLocationEditorForm>;
  linkedEntities: ReturnType<typeof useLinkedEntities>["data"];
}) {
  return (
    <form.Subscribe selector={(state) => state.values.type}>
      {(selectedType) =>
        selectedType === "project" ? (
          <Alert role="note" variant="info">
            <Info aria-hidden="true" />
            <AlertTitle>Project links aren’t available yet</AlertTitle>
            <AlertDescription>
              Project markers can’t be linked to a project record. Describe the
              project in the summary instead.
            </AlertDescription>
          </Alert>
        ) : selectedType === "missionary" ? (
          <form.Field name="linked_id">
            {(field) => {
              const showErrors =
                field.state.meta.isTouched || form.state.submissionAttempts > 0;
              const errors = toFieldErrors(field.state.meta.errors, showErrors);

              return (
                <FieldPrimitive.Root
                  name={field.name}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                  invalid={errors.length > 0}
                  render={<Field data-invalid={errors.length > 0} />}
                >
                  <FieldPrimitive.Label
                    nativeLabel={false}
                    render={<FieldTitle />}
                  >
                    Link to missionary
                  </FieldPrimitive.Label>
                  <FieldContent>
                    <SearchableSelect
                      items={(linkedEntities?.missionaries ?? []).map(
                        (missionary) => ({
                          value: missionary.id,
                          label: missionary.full_name?.trim() || missionary.id,
                        }),
                      )}
                      onOpenChange={(open) => {
                        if (!open) {
                          field.handleBlur();
                        }
                      }}
                      onValueChange={(value) => {
                        if (value === null) return;
                        field.handleChange(value);
                      }}
                      value={field.state.value ?? null}
                      aria-label="Link to missionary"
                      placeholder="Select a missionary"
                    />
                    <FieldPrimitive.Error
                      match={errors.length > 0}
                      render={<FieldError errors={errors} />}
                    />
                  </FieldContent>
                </FieldPrimitive.Root>
              );
            }}
          </form.Field>
        ) : null
      }
    </form.Subscribe>
  );
}

function useLocationEditorForm(
  location: LocationEditorProps["location"],
  upsertLocation: ReturnType<typeof useUpsertLocation>["mutateAsync"],
  onOpenChange: LocationEditorProps["onOpenChange"],
  setSubmitError: (message: string | null) => void,
) {
  const form = useAsymForm({
    defaultValues: toLocationFormValues(location),
    validators: {
      onChange: locationSchema,
    },
    onSubmit: async ({ value }) => {
      const { lat, lng } = value;
      if (lat === undefined || lng === undefined) return;
      setSubmitError(null);
      try {
        await upsertLocation({
          ...value,
          lat,
          lng,
          linked_id: ["missionary", "project"].includes(value.type)
            ? (value.linked_id ?? null)
            : null,
        });
        toast.success("Location saved");
        onOpenChange(false);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not save this location. Try again.";
        setSubmitError(message);
        toast.error(message);
      }
    },
  });
  return form;
}
