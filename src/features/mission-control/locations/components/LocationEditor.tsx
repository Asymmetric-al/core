"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Location,
  useUpsertLocation,
  useLinkedEntities,
} from "../hooks/use-locations";
import { Loader2, Trash2 } from "lucide-react";

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
  const { mutate: upsertLocation, isPending: isSaving } = useUpsertLocation();
  const { data: linkedEntities } = useLinkedEntities();

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      title: "",
      summary: "",
      type: "custom",
      linked_id: null,
      status: "draft",
      lat: 0,
      lng: 0,
    },
  });

  useEffect(() => {
    if (location) {
      form.reset({
        id: location.id,
        title: location.title || "",
        summary: location.summary || "",
        type: location.type || "custom",
        linked_id: location.linked_id || null,
        status: location.status || "draft",
        lat: location.lat || 0,
        lng: location.lng || 0,
      });
    }
  }, [location, form]);

  const onSubmit = (values: LocationFormValues) => {
    upsertLocation(values, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const selectedType = form.watch("type");

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-black uppercase tracking-tight">
            {location?.id ? "Edit Location" : "Add Location"}
          </SheetTitle>
          <SheetDescription>
            Configure the geographical marker and its details.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Location Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Amazon Medical Center"
                      {...field}
                      className="rounded-xl border-zinc-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Latitude
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="rounded-xl border-zinc-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Longitude
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="rounded-xl border-zinc-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Marker Type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-zinc-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="missionary">Missionary</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType !== "custom" && (
              <FormField
                control={form.control}
                name="linked_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Link to{" "}
                      {selectedType === "missionary" ? "Missionary" : "Project"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-zinc-200">
                          <SelectValue placeholder={`Select ${selectedType}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedType === "missionary" ? (
                          linkedEntities?.missionaries.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.full_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No projects found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Summary
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of work at this location..."
                      className="resize-none rounded-xl border-zinc-200 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-[1.25rem] border border-zinc-100 bg-zinc-50/50 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      Published
                    </FormLabel>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      Visible on public map
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "published"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "published" : "draft")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <SheetFooter className="flex-col sm:flex-col gap-3 pt-6 border-t border-zinc-50">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-zinc-900 font-bold text-[11px] uppercase tracking-widest"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {location?.id ? "Update Location" : "Save Location"}
              </Button>

              {location?.id && onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-[11px] uppercase tracking-widest transition-all"
                  onClick={() => onDelete(location.id!)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Marker
                </Button>
              )}
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
