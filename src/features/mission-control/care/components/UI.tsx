
import React, { useState, useEffect, useRef } from 'react';
import Image, { type ImageLoader } from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { format, isSameDay, startOfMonth, subMonths, addMonths, getDay, getDaysInMonth } from 'date-fns';

const passthroughImageLoader: ImageLoader = ({ src }) => src;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link' | 'warning' | 'success' | 'critical' | 'info';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-semibold',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground font-medium',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 font-medium',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline font-medium',
      warning: 'bg-amber-100 text-amber-900 hover:bg-amber-200 shadow-sm font-semibold border border-amber-200/50',
      success: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 shadow-sm font-semibold border border-emerald-200/50',
      critical: 'bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-sm font-semibold border border-destructive/20',
      info: 'bg-sky-100 text-sky-900 hover:bg-sky-200 shadow-sm font-semibold border border-sky-200/50',
    };
    const sizes = {
      default: 'h-10 px-5 py-2',
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      lg: 'h-11 px-7 text-base',
      icon: 'size-9',
    };

    return (
      <button
        ref={ref}
        data-slot="button"
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 cursor-pointer active:scale-[0.98]',
          variants[variant as keyof typeof variants] || variants.default,
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'flex h-10 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        data-slot="textarea"
        className={cn(
          'flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export interface SelectOption {
    value: string;
    label: string | React.ReactNode;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Select...", className }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

    return (
        <div className={cn("relative", className)} ref={ref}>
            <button
                type="button"
                data-slot="select-trigger"
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    open ? "ring-2 ring-ring ring-offset-2" : "hover:bg-accent"
                )}
            >
                <span className="truncate block text-left font-medium">{selectedLabel}</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0", open && "rotate-180")} />
            </button>
            {open && (
                <div data-slot="select-content" className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 origin-top p-1">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            data-slot="select-item"
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={cn(
                                "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 px-2.5 text-sm transition-colors",
                                value === option.value ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"
                            )}
                        >
                            <span className="truncate">{option.label}</span>
                            {value === option.value && (
                                <span className="absolute right-2.5 flex h-4 w-4 items-center justify-center">
                                    <Check className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div data-slot="card" className={cn('bg-card text-card-foreground flex flex-col gap-4 rounded-xl border py-4 shadow-sm transition-all', className)} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div data-slot="card-header" className={cn('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4', className)} {...props}>{children}</div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 data-slot="card-title" className={cn('leading-none font-semibold tracking-tight', className)} {...props}>{children}</h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div data-slot="card-content" className={cn('px-4', className)} {...props}>{children}</div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div data-slot="card-footer" className={cn('flex items-center px-4 [.border-t]:pt-4', className)} {...props}>{children}</div>
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'critical' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground border-border bg-background',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    critical: 'border-destructive/30 bg-destructive/10 text-destructive',
  };
  
  return (
    <div data-slot="badge" className={cn('inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold w-fit whitespace-nowrap shrink-0 gap-1 transition-colors', variants[variant as keyof typeof variants] || variants.default, className)} {...props}>
      {children}
    </div>
  );
};

export const Avatar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div data-slot="avatar" className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted', className)} {...props}>
    {children}
  </div>
);

type AvatarImageProps = Omit<React.ComponentProps<typeof Image>, 'fill' | 'width' | 'height'> & {
  className?: string;
};

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt = '', className, sizes = '32px', ...props }) => {
  if (!src) return null;
  return (
    <Image
      data-slot="avatar-image"
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loader={passthroughImageLoader}
      unoptimized
      className={cn('object-cover', className)}
      {...props}
    />
  );
};

export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div data-slot="avatar-fallback" className={cn('bg-muted flex size-full items-center justify-center rounded-xl text-xs font-semibold text-muted-foreground uppercase', className)} {...props}>
    {children}
  </div>
);

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
    hideClose?: boolean;
    padding?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, className, hideClose, padding = true }) => {
    if (!open) return null;
    return (
        <div 
            data-slot="dialog-overlay"
            className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-200", padding ? "p-4" : "p-0")}
            onClick={(e) => {
                if (e.target === e.currentTarget) onOpenChange(false);
            }}
        >
             <div data-slot="dialog-content" className={cn("relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-xl duration-200 rounded-2xl animate-in fade-in-0 zoom-in-95", className)}>
                 {!hideClose && (
                    <button 
                        onClick={() => onOpenChange(false)}
                        className="absolute right-4 top-4 z-50 rounded-xl p-2 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                 )}
                 {children}
             </div>
        </div>
    )
}

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)} {...props}>
      {children}
    </div>
  )
    
export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
    <h2 data-slot="dialog-title" className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h2>
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'warning';
}

export const Alert: React.FC<AlertProps> = ({ className, variant = 'default', children, ...props }) => {
    const variants = {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive bg-destructive/5 [&>svg]:text-destructive',
        warning: 'border-amber-500/50 text-amber-700 bg-amber-50 [&>svg]:text-amber-600',
    }
    return (
        <div data-slot="alert" role="alert" className={cn("relative w-full rounded-2xl border p-4 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground", variants[variant], className)} {...props}>
            {children}
        </div>
    )
}

export const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
    <h5 data-slot="alert-title" className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h5>
)

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
    <div data-slot="alert-description" className={cn("text-sm text-muted-foreground [&_p]:leading-relaxed", className)} {...props}>
      {children}
    </div>
)

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, ...props }, ref) => {
    return (
        <div className="flex items-center gap-2 group">
            <input 
                type="checkbox" 
                ref={ref}
                data-slot="checkbox"
                className={cn(
                    "peer h-4 w-4 shrink-0 rounded-md border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all checked:bg-primary checked:text-primary-foreground",
                    className
                )}
                {...props} 
            />
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground peer-checked:text-foreground transition-colors">
                    {label}
                </label>
            )}
        </div>
    )
})
Checkbox.displayName = "Checkbox"


interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, value: controlledValue, onValueChange, children, className }) => {
  const [localValue, setLocalValue] = React.useState(defaultValue || '');
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : localValue;
  
  const handleValueChange = React.useCallback((newValue: string) => {
      if (!isControlled) {
          setLocalValue(newValue);
      }
      onValueChange?.(newValue);
  }, [isControlled, onValueChange]);

  const contextValue = React.useMemo(() => ({ value, onValueChange: handleValueChange }), [value, handleValueChange]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div data-slot="tabs" className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div data-slot="tabs-list" className={cn('inline-flex h-10 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground', className)}>
    {children}
  </div>
);

interface SimpleTabsTriggerProps {
  value: string;
  children?: React.ReactNode;
  onClick?: (v: string) => void; 
}

export const SimpleTabsTrigger: React.FC<SimpleTabsTriggerProps> = ({ value, onClick, children }) => {
    const context = React.useContext(TabsContext);
    
    if (!context) {
        console.warn("SimpleTabsTrigger must be used within a Tabs component");
        return null;
    }

    const isActive = context.value === value;

    return (
        <button
            data-slot="tabs-trigger"
            data-state={isActive ? "active" : "inactive"}
            onClick={() => {
                context.onValueChange(value);
                onClick?.(value);
            }}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isActive 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'hover:bg-background/50 hover:text-foreground'
            )}
        >
            {children}
        </button>
    )
}

export const TabsContent: React.FC<{ value: string; children?: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ value, children, className, style }) => {
    const context = React.useContext(TabsContext);
    if (!context || context.value !== value) return null;
    return (
        <div data-slot="tabs-content" className={cn('mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-0 slide-in-from-top-1 duration-200', className)} style={style}>
            {children}
        </div>
    )
}

export const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div data-slot="scroll-area" className={cn("relative overflow-hidden", className)} {...props}>
        <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {children}
        </div>
    </div>
);

interface CalendarProps {
    mode?: 'single';
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
    defaultMonth = new Date(),
    disabled
}) => {
    const [viewDate, setViewDate] = useState(defaultMonth);

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

    const firstDay = startOfMonth(viewDate);
    const startDay = getDay(firstDay); 
    const daysInMonth = getDaysInMonth(viewDate);

    const handleDateClick = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (isDisabled(newDate)) return;
        onSelect?.(newDate);
    };

    const isDisabled = (date: Date) => {
        if (!disabled) return false;
        if (Array.isArray(disabled)) {
            return disabled.some(d => isSameDay(d, date));
        }
        if (typeof disabled === 'function') {
            return disabled(date);
        }
        return false;
    }

    return (
        <div data-slot="calendar" className={cn("p-4 bg-background rounded-2xl border border-border shadow-sm", className)}>
            <div className="flex items-center justify-between mb-4">
                 <div className="text-sm font-semibold">{format(viewDate, 'MMMM yyyy')}</div>
                 <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="size-8 rounded-xl" onClick={handlePrevMonth}>
                         <ChevronLeft className="h-4 w-4" />
                     </Button>
                     <Button variant="ghost" size="icon" className="size-8 rounded-xl" onClick={handleNextMonth}>
                         <ChevronRight className="h-4 w-4" />
                     </Button>
                 </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 w-full text-center text-[10px] mb-2 text-muted-foreground uppercase tracking-wider font-bold">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                    <div key={i} className="py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 w-full">
                 {Array.from({ length: startDay }).map((_, i) => (
                     <div key={`empty-${i}`} />
                 ))}
                 {Array.from({ length: daysInMonth }).map((_, i) => {
                     const day = i + 1;
                     const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                     const isSelected = selected && isSameDay(selected, current);
                     const isToday = isSameDay(new Date(), current);
                     const disabledState = isDisabled(current);

                     return (
                         <button
                             key={day}
                             onClick={() => handleDateClick(day)}
                             disabled={disabledState}
                             className={cn(
                                 "size-9 rounded-xl text-sm font-medium flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-90",
                                 isSelected ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent hover:text-accent-foreground",
                                 isToday && !isSelected && "bg-accent text-accent-foreground ring-1 ring-border",
                                 disabledState && "opacity-20 cursor-not-allowed line-through"
                             )}
                         >
                             {day}
                         </button>
                     );
                 })}
            </div>
        </div>
    )
}
