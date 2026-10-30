import { Button as SharedButton } from "@asym/ui/components/shadcn/button";
import {
  Dialog as SharedDialog,
  DialogContent as SharedDialogContent,
  DialogHeader as SharedDialogHeader,
  DialogTitle as SharedDialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";
import {
  format,
  isSameDay,
  startOfMonth,
  addMonths,
  getDay,
  getDaysInMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  hideClose?: boolean;
  /** Retained for API compatibility; the shared dialog handles spacing. */
  padding?: boolean;
}

/**
 * Care dialogs delegate to the shared Base UI dialog so they get a real
 * focus trap, Escape handling, and a labelled `role="dialog"` popup instead
 * of a clickable overlay wrapping the content (a nested interactive tree).
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  className,
  hideClose,
}) => (
  <SharedDialog open={open} onOpenChange={onOpenChange}>
    <SharedDialogContent showCloseButton={!hideClose} className={className}>
      {children}
    </SharedDialogContent>
  </SharedDialog>
);

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <SharedDialogHeader className={className} {...props}>
    {children}
  </SharedDialogHeader>
);

export const DialogTitle: React.FC<
  React.HTMLAttributes<HTMLHeadingElement>
> = ({ className, children, ...props }) => (
  <SharedDialogTitle
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  >
    {children}
  </SharedDialogTitle>
);

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <div className="flex items-center gap-2 group">
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          data-slot="checkbox"
          className={cn(
            "peer size-4 shrink-0 rounded-md border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-colors checked:bg-primary checked:text-primary-foreground",
            className,
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground peer-checked:text-foreground transition-colors"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

interface CalendarProps {
  mode?: "single";
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  defaultMonth?: Date;
  disabled?: Date[] | ((date: Date) => boolean);
}

export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  className,
  defaultMonth = makeDisplayDate(),
  disabled,
}) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const viewDate = addMonths(startOfMonth(defaultMonth), monthOffset);

  const handlePrevMonth = () => setMonthOffset((offset) => offset - 1);
  const handleNextMonth = () => setMonthOffset((offset) => offset + 1);

  const firstDay = startOfMonth(viewDate);
  const startDay = getDay(firstDay);
  const daysInMonth = getDaysInMonth(viewDate);

  const handleDateClick = (day: number) => {
    const newDate = new globalThis.Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day,
    );
    if (isDisabled(newDate)) return;
    onSelect?.(newDate);
  };

  const isDisabled = (date: Date) => {
    if (!disabled) return false;
    if (Array.isArray(disabled)) {
      return disabled.some((d) => isSameDay(d, date));
    }
    if (typeof disabled === "function") {
      return disabled(date);
    }
    return false;
  };

  return (
    <div
      data-slot="calendar"
      className={cn(
        "p-4 bg-background rounded-2xl border border-border shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">
          {format(viewDate, "MMMM yyyy")}
        </div>
        <div className="flex items-center gap-1">
          <SharedButton
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="size-4" />
          </SharedButton>
          <SharedButton
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            onClick={handleNextMonth}
          >
            <ChevronRight className="size-4" />
          </SharedButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 w-full text-center text-xs mb-2 text-muted-foreground uppercase tracking-wider font-bold">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayLabel) => (
          <div key={dayLabel} className="py-1">
            {dayLabel}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 w-full">
        {Array.from({ length: startDay }, (_, emptyDay) => emptyDay + 1).map(
          (emptyDay) => (
            <div
              key={`empty-${viewDate.getFullYear()}-${viewDate.getMonth()}-${emptyDay}`}
            />
          ),
        )}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const current = new globalThis.Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            day,
          );
          const isSelected = selected && isSameDay(selected, current);
          const isToday = isSameDay(makeDisplayDate(), current);
          const disabledState = isDisabled(current);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={disabledState}
              className={cn(
                "size-9 rounded-xl text-sm font-medium flex items-center justify-center press-feedback focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent hover:text-accent-foreground",
                isToday &&
                  !isSelected &&
                  "bg-accent text-accent-foreground ring-1 ring-border",
                disabledState && "opacity-20 cursor-not-allowed line-through",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
