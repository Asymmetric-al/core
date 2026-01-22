"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@asym/ui/components/shadcn/form";
import { Input } from "@asym/ui/components/shadcn/input";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { createBrowserClient } from "@asym/database/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const partnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  type: z.enum(["Individual", "Organization", "Church"]),
  frequency: z.enum(["Monthly", "One-Time", "Annually", "Irregular"]),
  location: z.string().min(2, "Location is required"),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

export interface AddPartnerDialogProps {
  missionaryId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddPartnerDialog({
  missionaryId,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddPartnerDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const supabase = React.useMemo(() => createBrowserClient(), []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: "Individual",
      frequency: "Monthly",
      location: "",
    },
  });

  async function onSubmit(values: PartnerFormValues) {
    if (!missionaryId) {
      toast.error("Missionary ID is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("donors").insert({
        missionary_id: missionaryId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        type: values.type,
        frequency: values.frequency,
        location: values.location,
        status: "Active",
        total_given: 0,
        last_gift_amount: 0,
        score: 70, // Default starting score
      });

      if (error) throw error;

      toast.success("Partner added successfully");
      form.reset();
      onOpenChange?.(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error adding partner:", error);
      toast.error(error.message || "Failed to add partner");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-zinc-100 p-0 overflow-hidden">
        <div className="bg-zinc-900 px-8 py-10 text-white">
          <DialogTitle className="text-3xl font-black tracking-tighter">
            Add New Partner
          </DialogTitle>
          <DialogDescription className="text-zinc-400 font-bold mt-2 uppercase tracking-widest text-[10px]">
            Enter the details for your new ministry partner
          </DialogDescription>
        </div>
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        FullName / Org Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter name"
                          {...field}
                          className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-bold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
                          {...field}
                          className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-bold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(555) 000-0000"
                          {...field}
                          className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-bold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Partner Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-bold">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-zinc-100 font-bold">
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Organization">
                            Organization
                          </SelectItem>
                          <SelectItem value="Church">Church</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Giving Frequency
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-bold">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-zinc-100 font-bold">
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="One-Time">One-Time</SelectItem>
                          <SelectItem value="Annually">Annually</SelectItem>
                          <SelectItem value="Irregular">Irregular</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Location (City, State)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Denver, CO"
                          {...field}
                          className="h-12 bg-zinc-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-bold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange?.(false)}
                  className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Partner"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
