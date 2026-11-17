"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { LabeledField } from "@asym/ui/components/primitives/labeled-field";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "@asym/ui/components/shadcn/icons";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { cn } from "@asym/ui/lib/utils";
import {
  AlertCircle,
  Camera,
  Save,
  ImageIcon,
  Smartphone,
  Monitor,
  Loader2,
  Globe,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import * as React from "react";

import {
  DESKTOP_PREVIEW_HEIGHT,
  DESKTOP_PREVIEW_WIDTH,
  MOBILE_PREVIEW_HEIGHT,
  MOBILE_PREVIEW_WIDTH,
} from "./profile-model";
import {
  fadeInUp,
  springTransition,
  smoothTransition,
  gentleTransition,
} from "./profile-motion";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          {["skeleton-a", "skeleton-b", "skeleton-c"].map((skeletonId) => (
            <Card key={skeletonId}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="aspect-9/16">
              <Skeleton className="size-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  icon: Icon,
  children,
  error,
  helperText,
  className,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactElement;
  error?: string;
  helperText?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeInUp}>
      <LabeledField
        label={
          <>
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {label}
          </>
        }
        error={error}
        description={helperText}
      >
        {children}
      </LabeledField>
    </motion.div>
  );
}

const socialIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
};

export function SocialIcon({
  platform,
  url,
}: {
  platform: string;
  url: string;
}) {
  if (!url) return null;

  const Icon = socialIcons[platform] || Globe;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={springTransition}
    >
      <Icon className="size-4 text-muted-foreground hover:text-muted-foreground transition-colors" />
    </motion.div>
  );
}

// ImageUpload hands its trigger props (role, tabIndex, handlers) to this area.
type CoverTriggerProps = Pick<
  React.ComponentProps<"div">,
  | "className"
  | "onClick"
  | "onKeyDown"
  | "role"
  | "tabIndex"
  | "aria-disabled"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
>;

export function CoverUploadArea({
  coverUrl,
  className,
  "aria-labelledby": labelledBy,
  ...triggerProps
}: { coverUrl: string } & CoverTriggerProps) {
  const actionId = React.useId();
  return (
    <motion.div
      {...triggerProps}
      aria-labelledby={labelledBy ? `${labelledBy} ${actionId}` : actionId}
      className={cn(
        "w-full aspect-3/1 rounded-xl sm:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors relative overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
        coverUrl
          ? "border-transparent"
          : "border-border bg-muted hover:bg-muted hover:border-border",
        className,
      )}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      transition={smoothTransition}
    >
      {coverUrl ? (
        <>
          <motion.img
            src={coverUrl}
            alt="Cover"
            className="absolute inset-0 size-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={gentleTransition}
          />
          <motion.div
            className="absolute inset-0 bg-media-scrim/0 hover:bg-media-scrim/40 flex items-center justify-center transition-colors"
            initial={false}
          >
            <motion.div className="bg-card rounded-lg px-3 py-1.5 shadow-lg transition-opacity">
              <span
                id={actionId}
                className="text-xs font-medium flex items-center gap-1.5"
              >
                <Camera className="size-3.5" />
                Change cover
              </span>
            </motion.div>
          </motion.div>
        </>
      ) : (
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smoothTransition}
        >
          <motion.div className="size-10 sm:h-12 sm:w-12 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center mb-2 sm:mb-3">
            <ImageIcon className="size-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </motion.div>
          <p
            id={actionId}
            className="text-xs sm:text-sm font-medium text-foreground"
          >
            Click to upload cover photo
          </p>
          <p className="text-xs sm:text-xs text-muted-foreground mt-0.5">
            1200x400px recommended
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// The item brings the toggle behavior; the pill behind it shows the choice,
// so the item's own toggle colors are left out.
const previewOption: Extract<
  React.ComponentProps<typeof ToggleGroupItem>["render"],
  (...args: never[]) => unknown
> = (props, state) => {
  return (
    <button
      {...props}
      type="button"
      className={cn(
        "press-feedback relative z-10 rounded-md px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        state.pressed
          ? "text-foreground"
          : "text-muted-foreground hover:text-muted-foreground",
      )}
    />
  );
};

export function PreviewToggle({
  value,
  onChange,
}: {
  value: "mobile" | "desktop";
  onChange: (v: "mobile" | "desktop") => void;
}) {
  return (
    <div className="relative bg-muted border border-border p-1 rounded-lg flex">
      <motion.div
        className="absolute top-1 bottom-1 left-(--preview-indicator-left) bg-card rounded-md shadow-sm"
        layout
        transition={springTransition}
        style={
          {
            "--preview-indicator-left": value === "mobile" ? "4px" : "50%",
            width: "calc(50% - 4px)",
          } as React.CSSProperties
        }
      />
      <ToggleGroup
        aria-label="Live preview"
        value={[value]}
        // Pressing the shown size sends an empty list; one size stays on.
        onValueChange={(next) => {
          const mode = next[0];
          if (mode === "mobile" || mode === "desktop") onChange(mode);
        }}
      >
        <ToggleGroupItem
          value="mobile"
          aria-label="Mobile preview"
          render={previewOption}
        >
          <Smartphone className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="desktop"
          aria-label="Desktop preview"
          render={previewOption}
        >
          <Monitor className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function MotionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeInUp} transition={gentleTransition}>
      <Card className={className}>{children}</Card>
    </motion.div>
  );
}

export function MobilePreviewFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = () => {
      const containerWidth = container.offsetWidth;
      const padding = 16;
      const availableWidth = containerWidth - padding;
      const newScale = Math.min(1, availableWidth / MOBILE_PREVIEW_WIDTH);
      setScale(newScale);
    };

    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <div
        className="overflow-hidden"
        style={{
          width: MOBILE_PREVIEW_WIDTH * scale,
          height: MOBILE_PREVIEW_HEIGHT * scale,
        }}
      >
        <div
          className="origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: MOBILE_PREVIEW_WIDTH,
            height: MOBILE_PREVIEW_HEIGHT,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function DesktopPreviewFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = () => {
      const containerWidth = container.offsetWidth;
      const padding = 16;
      const availableWidth = containerWidth - padding;
      const newScale = Math.min(1, availableWidth / DESKTOP_PREVIEW_WIDTH);
      setScale(newScale);
    };

    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <div
        className="overflow-hidden"
        style={{
          width: DESKTOP_PREVIEW_WIDTH * scale,
          height: DESKTOP_PREVIEW_HEIGHT * scale,
        }}
      >
        <div
          className="origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: DESKTOP_PREVIEW_WIDTH,
            height: DESKTOP_PREVIEW_HEIGHT,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * If `ref` holds focus when it leaves, focus goes to `returnFocusTo` a frame
 * later, unless something else has taken it by then.
 */
function useReturnFocusOnLeave(
  ref: React.RefObject<HTMLElement | null>,
  returnFocusTo: React.RefObject<HTMLElement | null>,
) {
  // Layout cleanup runs before the element leaves the DOM, while focus is
  // still inside it.
  React.useLayoutEffect(() => {
    const element = ref.current;
    const target = returnFocusTo.current;
    return () => {
      if (!element?.contains(document.activeElement)) return;
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!active || active === document.body) target?.focus();
      });
    };
  }, [ref, returnFocusTo]);
}

/**
 * Keeps save within reach on a long form. It leaves once changes are saved
 * or discarded; if it held focus then, focus goes back to the page.
 */
export function UnsavedChangesBar({
  returnFocusTo,
  children,
}: {
  returnFocusTo: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const barRef = React.useRef<HTMLDivElement>(null);
  useReturnFocusOnLeave(barRef, returnFocusTo);

  return (
    <div
      ref={barRef}
      className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
    >
      <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
      {children}
    </div>
  );
}

/**
 * A refresh that failed over a loaded profile, with its own Try again. If it
 * leaves while holding focus, focus goes back to the page.
 */
export function RefreshFailure({
  error,
  failedRetries,
  retrying,
  onRetry,
  retryRef,
  returnFocusTo,
}: {
  error: string;
  failedRetries: number;
  retrying: boolean;
  onRetry: () => void;
  retryRef: React.RefObject<HTMLButtonElement | null>;
  returnFocusTo: React.RefObject<HTMLElement | null>;
}) {
  const rowRef = React.useRef<HTMLDivElement>(null);
  useReturnFocusOnLeave(rowRef, returnFocusTo);
  return (
    <div
      ref={rowRef}
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      {/* Keyed so a repeat failure is a new alert, read out again. */}
      <Alert key={failedRetries} variant="destructive" className="grow">
        <AlertCircle aria-hidden />
        <AlertTitle>We couldn’t refresh your giving page</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <Button
        ref={retryRef}
        variant="outline"
        disabled={retrying}
        focusableWhenDisabled
        onClick={onRetry}
      >
        {retrying ? "Trying again…" : "Try again"}
      </Button>
    </div>
  );
}

export type ProfileHeaderActionsProps = {
  canWrite?: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  onDiscard: () => void;
} & (
  | { onSave: () => void | Promise<void>; form?: undefined }
  // Save submits this form, so Enter in one of its fields saves the same way.
  | { form: string; onSave?: undefined }
);

export function ProfileHeaderActions({
  canWrite = true,
  hasChanges,
  isSaving,
  saveSuccess,
  onDiscard,
  onSave,
  form,
}: ProfileHeaderActionsProps) {
  const pendingActionLabelId = React.useId();
  const saveRef = React.useRef<HTMLButtonElement>(null);
  const focusParked = React.useRef(false);
  const saveDisabled = isSaving || !hasChanges || !canWrite;
  // A disabled submit button drops focus to the page, so focus waits on the
  // form until Save is usable again. The page renders Save twice; only the
  // copy that moved focus brings it back.
  React.useLayoutEffect(() => {
    const formElement = form ? document.getElementById(form) : null;
    const save = saveRef.current;
    if (!formElement || !save) return;
    if (saveDisabled) {
      if (document.activeElement !== save) return;
      focusParked.current = true;
      formElement.focus({ preventScroll: true });
    } else if (focusParked.current) {
      focusParked.current = false;
      if (document.activeElement === formElement) save.focus();
    }
  }, [form, saveDisabled]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -8 }}
            transition={springTransition}
          >
            <Button variant="ghost" size="sm" onClick={onDiscard}>
              <RotateCcw className="mr-1.5 size-4" data-icon="inline-start" />
              Discard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <Button
          ref={saveRef}
          aria-labelledby={`${pendingActionLabelId}-28`}
          focusableWhenDisabled={!form && isSaving}
          type={form ? "submit" : "button"}
          form={form}
          onClick={onSave}
          disabled={saveDisabled}
          size="sm"
        >
          <span id={`${pendingActionLabelId}-28`} className="sr-only">
            {isSaving ? "Saving…" : saveSuccess ? "Saved" : "Save changes"}
          </span>
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Loader2 className="size-4 animate-spin" />
              </motion.div>
            ) : saveSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
                transition={springTransition}
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                Saved
              </motion.div>
            ) : (
              <motion.div
                key="save"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
                transition={{ duration: 0.15 }}
              >
                <Save className="mr-1.5 size-4" />
                Save changes
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
