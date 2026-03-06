"use client";
"use no memo";

import { createBrowserClient } from "@asym/database/supabase";
import { useAuth, useTasks } from "@asym/lib/hooks";
import type { Task } from "@asym/lib/hooks/use-tasks";
import { AnimatePresence, LayoutGroup, motion } from "@asym/lib/motion";
import { AddPartnerDialog } from "@asym/missionary/components/add-partner-dialog";
import { TaskDialog } from "@asym/missionary/components/task-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@asym/ui/components/shadcn/form";
import { Input } from "@asym/ui/components/shadcn/input";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInMonths, format, formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowDownUp,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  Filter,
  Gift,
  Globe,
  Heart,
  History,
  Home,
  ListTodo,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Send,
  Star,
  Tag,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { PageHeader } from "@/components/page-header";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const smoothTransition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

type ActivityType =
  | "gift"
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "pledge_started"
  | "pledge_completed";
type GiftType =
  | "Online"
  | "Check"
  | "Cash"
  | "Bank Transfer"
  | "Stock"
  | "In-Kind";
type RecurringStatus = "active" | "completed" | "paused" | "cancelled";

interface Activity {
  amount?: number;
  date: string;
  description?: string;
  gift_type?: GiftType;
  id: string;
  note?: string;
  status?: string;
  title: string;
  type: ActivityType;
}

interface RecurringDonation {
  amount: number;
  end_date?: string;
  frequency: string;
  id: string;
  next_payment_date?: string;
  payment_method?: string;
  payments_completed: number;
  payments_remaining: number;
  start_date: string;
  status: RecurringStatus;
  total_expected: number;
  total_paid: number;
}

interface Address {
  city?: string;
  country?: string;
  state?: string;
  street?: string;
  street2?: string;
  zip?: string;
}

interface Donor {
  activities: Activity[];
  address: Address;
  anniversary?: string;
  avatar_url?: string;
  birthday?: string;
  email: string;
  frequency: string;
  has_active_pledge: boolean;
  id: string;
  initials: string;
  joined_date: string;
  last_gift_amount: number | null;
  last_gift_date: string | null;
  location: string;
  mobile?: string;
  name: string;
  notes?: string;
  organization?: string;
  phone: string;
  preferred_contact: "email" | "phone" | "text";
  recurring_donations: RecurringDonation[];
  score: number;
  spouse?: string;
  status: "Active" | "Lapsed" | "New" | "At Risk";
  tags: string[];
  title?: string;
  total_given: number;
  type: "Individual" | "Organization" | "Church";
  website?: string;
  work_address?: Address;
  work_phone?: string;
}

const AVAILABLE_TAGS = [
  {
    id: "major-donor",
    label: "Major Donor",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "monthly-partner",
    label: "Monthly Partner",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "prayer-partner",
    label: "Prayer Partner",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "church-contact",
    label: "Church Contact",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "family",
    label: "Family",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "friend",
    label: "Friend",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  {
    id: "first-time-giver",
    label: "First-Time Giver",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "legacy-giver",
    label: "Legacy Giver",
    color: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  {
    id: "volunteer",
    label: "Volunteer",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    id: "board-member",
    label: "Board Member",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    id: "needs-followup",
    label: "Needs Follow-up",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "lapsed-donor",
    label: "Lapsed Donor",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
];

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "$0";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-emerald-500";
    case "Lapsed":
      return "bg-zinc-400";
    case "New":
      return "bg-blue-500";
    case "At Risk":
      return "bg-amber-500";
    default:
      return "bg-zinc-400";
  }
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Lapsed: "bg-zinc-100 text-zinc-500 border-zinc-200",
    New: "bg-blue-50 text-blue-700 border-blue-100",
    "At Risk": "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <Badge
      className={cn(
        "rounded-full border px-2 py-0.5 font-black text-[9px] uppercase tracking-widest",
        styles[status] || styles["Lapsed"]
      )}
      variant="outline"
    >
      {status}
    </Badge>
  );
};

const getRecurringStatusBadge = (status: RecurringStatus) => {
  const styles: Record<RecurringStatus, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    completed: "bg-blue-50 text-blue-700 border-blue-100",
    paused: "bg-amber-50 text-amber-700 border-amber-100",
    cancelled: "bg-zinc-100 text-zinc-500 border-zinc-200",
  };
  return (
    <Badge
      className={cn(
        "rounded-full border px-2 py-0.5 font-black text-[9px] uppercase tracking-widest",
        styles[status]
      )}
      variant="outline"
    >
      {status}
    </Badge>
  );
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "gift":
      return <Heart className="h-3.5 w-3.5 text-white" />;
    case "call":
      return <Phone className="h-3.5 w-3.5 text-white" />;
    case "email":
      return <Mail className="h-3.5 w-3.5 text-white" />;
    case "note":
      return <MessageSquare className="h-3.5 w-3.5 text-white" />;
    case "meeting":
      return <Briefcase className="h-3.5 w-3.5 text-white" />;
    case "pledge_started":
      return <TrendingUp className="h-3.5 w-3.5 text-white" />;
    case "pledge_completed":
      return <Check className="h-3.5 w-3.5 text-white" />;
    default:
      return <Clock className="h-3.5 w-3.5 text-white" />;
  }
};

const getActivityBg = (type: ActivityType) => {
  switch (type) {
    case "gift":
      return "bg-rose-500";
    case "call":
      return "bg-blue-500";
    case "email":
      return "bg-purple-500";
    case "note":
      return "bg-zinc-600";
    case "meeting":
      return "bg-emerald-500";
    case "pledge_started":
      return "bg-indigo-500";
    case "pledge_completed":
      return "bg-teal-500";
    default:
      return "bg-zinc-400";
  }
};

const getGiftTypeIcon = (type: GiftType | string | undefined) => {
  switch (type) {
    case "Online":
      return <CreditCard className="h-3.5 w-3.5" />;
    case "Check":
      return <Mail className="h-3.5 w-3.5" />;
    case "Cash":
      return <DollarSign className="h-3.5 w-3.5" />;
    case "Bank Transfer":
      return <Building2 className="h-3.5 w-3.5" />;
    case "Stock":
      return <TrendingUp className="h-3.5 w-3.5" />;
    case "In-Kind":
      return <Gift className="h-3.5 w-3.5" />;
    default:
      return <DollarSign className="h-3.5 w-3.5" />;
  }
};

const getPaymentMethodIcon = (method: string | undefined) => {
  switch (method) {
    case "Online":
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case "Check":
      return <Mail className="h-4 w-4 text-zinc-500" />;
    case "Cash":
      return <DollarSign className="h-4 w-4 text-emerald-500" />;
    case "Bank Transfer":
      return <Building2 className="h-4 w-4 text-indigo-500" />;
    default:
      return <CreditCard className="h-4 w-4 text-zinc-400" />;
  }
};

const getTagStyle = (tagId: string) => {
  const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
  return tag?.color || "bg-zinc-100 text-zinc-600 border-zinc-200";
};

const getTagLabel = (tagId: string) => {
  const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
  return (
    tag?.label ||
    tagId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
};

function DonorListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4"
          initial={{ opacity: 0 }}
          key={i}
          transition={{ delay: i * 0.03 }}
        >
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      {...fadeInUp}
      className="flex h-64 flex-col items-center justify-center p-6 text-center"
      transition={smoothTransition}
    >
      <motion.div
        animate={{ scale: 1 }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50"
        initial={{ scale: 0.8 }}
        transition={springTransition}
      >
        <AlertCircle className="h-7 w-7 text-rose-500" />
      </motion.div>
      <p className="mb-1 font-bold text-sm text-zinc-900">
        Something went wrong
      </p>
      <p className="mb-4 text-xs text-zinc-500">{message}</p>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          className="h-9 rounded-2xl border-zinc-200 bg-white font-black text-[10px] text-zinc-500 uppercase tracking-widest hover:text-zinc-900"
          onClick={onRetry}
          size="sm"
          variant="outline"
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );
}

const MotionCard = motion.create(Card);

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
  isActive,
  delay = 0,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
  isActive?: boolean;
  delay?: number;
}) {
  const content = (
    <MotionCard
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border-zinc-200 bg-white shadow-sm transition-all",
        onClick && "cursor-pointer",
        isActive && "border-blue-400 ring-2 ring-blue-100"
      )}
      initial={{ opacity: 0, y: 20 }}
      transition={{ ...smoothTransition, delay }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider">
              {label}
            </p>
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="font-bold text-xl text-zinc-900 tracking-tight"
              initial={{ opacity: 0, y: 5 }}
              key={value}
            >
              {value}
            </motion.p>
            <span className="font-medium text-[10px] text-zinc-400 uppercase tracking-wider">
              {subtext}
            </span>
          </div>
          <motion.div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border",
              iconBg
            )}
            transition={springTransition}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className={cn("h-4 w-4", iconColor)} />
          </motion.div>
        </div>
      </CardContent>
    </MotionCard>
  );

  if (onClick) {
    return (
      <button className="w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  }
  return content;
}

const editDonorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  work_phone: z.string().optional(),
  preferred_contact: z.enum(["email", "phone", "text"]),
  type: z.enum(["Individual", "Organization", "Church"]),
  status: z.enum(["Active", "Lapsed", "New", "At Risk"]),
  frequency: z.string(),
  location: z.string().optional(),
  website: z.string().optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  spouse: z.string().optional(),
  birthday: z.string().optional(),
  anniversary: z.string().optional(),
  notes: z.string().optional(),
  street: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

type EditDonorFormValues = z.infer<typeof editDonorSchema>;

type SortOption = "name" | "last_gift" | "total_given" | "joined_date";

const TASK_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  call: {
    label: "Call",
    icon: Phone,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  to_do: {
    label: "To-do",
    icon: CheckCircle2,
    color: "text-zinc-600",
    bgColor: "bg-zinc-100",
  },
  follow_up: {
    label: "Follow Up",
    icon: User,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  thank_you: {
    label: "Thank You",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
};

function DonorTasks({
  donorId,
  donorName,
}: {
  donorId: string;
  donorName: string;
}) {
  const {
    filteredTasks,
    loading,
    completeTask,
    reopenTask,
    deleteTask,
    refresh,
  } = useTasks({ donorId });
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const activeTasks = filteredTasks.filter(
    (t) => t.status !== "completed" && t.status !== "deferred"
  );
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  const handleComplete = async (task: Task) => {
    if (task.status === "completed") {
      await reopenTask(task.id);
    } else {
      await completeTask(task.id);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskSuccess = () => {
    refresh();
    setEditingTask(null);
    setTaskDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            className="flex animate-pulse items-start gap-3 rounded-xl border bg-white p-4"
            key={i}
          >
            <div className="mt-0.5 h-5 w-5 rounded-md bg-zinc-200" />
            <div className="h-9 w-9 rounded-lg bg-zinc-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-zinc-200" />
              <div className="h-3 w-1/2 rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-zinc-900">Tasks</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Follow-ups and actions for {donorName}
          </p>
        </div>
        <TaskDialog
          defaultDonorId={donorId}
          onOpenChange={(open) => {
            setTaskDialogOpen(open);
            if (!open) {
              setEditingTask(null);
            }
          }}
          onSuccess={handleTaskSuccess}
          open={taskDialogOpen}
          task={editingTask}
          trigger={
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="h-8 rounded-xl px-3 text-xs" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Task
              </Button>
            </motion.div>
          }
        />
      </motion.div>

      {filteredTasks.length === 0 ? (
        <motion.div
          {...fadeInUp}
          className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 py-12 text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
            <ListTodo className="h-6 w-6 text-zinc-300" />
          </div>
          <p className="font-bold text-sm text-zinc-900">No tasks yet</p>
          <p className="mt-1 max-w-[240px] text-xs text-zinc-400">
            Create a task to track follow-ups with this partner.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {activeTasks.length > 0 && (
            <div className="space-y-2">
              <p className="px-1 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                Active ({activeTasks.length})
              </p>
              {activeTasks.map((task, i) => {
                const typeConfig =
                  TASK_TYPE_CONFIG[task.task_type] ?? TASK_TYPE_CONFIG.to_do!;
                if (!typeConfig) {
                  return null;
                }
                const Icon = typeConfig.icon;
                const isOverdue =
                  task.due_date && new Date(task.due_date) < new Date();
                const isDueToday =
                  task.due_date &&
                  new Date(task.due_date).toDateString() ===
                    new Date().toDateString();

                return (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200"
                    initial={{ opacity: 0, y: 10 }}
                    key={task.id}
                    transition={{ delay: i * 0.03 }}
                  >
                    <motion.div className="mt-0.5" whileTap={{ scale: 0.9 }}>
                      <Checkbox
                        checked={false}
                        className="h-5 w-5 rounded-md"
                        onCheckedChange={() => handleComplete(task)}
                      />
                    </motion.div>
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        typeConfig.bgColor,
                        typeConfig.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-sm text-zinc-900">
                          {task.title}
                        </p>
                        {task.priority === "high" && (
                          <Badge className="h-4 border-0 bg-rose-50 px-1.5 font-black text-[9px] text-rose-600 uppercase tracking-widest">
                            High
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                          {task.description}
                        </p>
                      )}
                      {task.due_date && (
                        <div
                          className={cn(
                            "mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider",
                            isOverdue
                              ? "border-rose-100 bg-rose-50 text-rose-600"
                              : isDueToday
                                ? "border-amber-100 bg-amber-50 text-amber-600"
                                : "border-zinc-200 bg-zinc-100 text-zinc-600"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {isOverdue
                            ? "Overdue"
                            : isDueToday
                              ? "Due Today"
                              : format(new Date(task.due_date), "MMM d")}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="h-8 w-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          className="font-medium text-xs"
                          onClick={() => handleEdit(task)}
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="font-medium text-xs"
                          onClick={() => handleComplete(task)}
                        >
                          <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Complete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="font-medium text-destructive text-xs focus:text-destructive"
                          onClick={() => deleteTask(task.id)}
                        >
                          <X className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <p className="px-1 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                Completed ({completedTasks.length})
              </p>
              {completedTasks.slice(0, 5).map((task, i) => {
                const typeConfig =
                  TASK_TYPE_CONFIG[task.task_type] ?? TASK_TYPE_CONFIG.to_do!;
                if (!typeConfig) {
                  return null;
                }
                const Icon = typeConfig.icon;

                return (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex items-start gap-3 rounded-xl border border-transparent bg-zinc-50/50 p-4"
                    initial={{ opacity: 0, y: 10 }}
                    key={task.id}
                    transition={{ delay: i * 0.03 }}
                  >
                    <motion.div className="mt-0.5" whileTap={{ scale: 0.9 }}>
                      <Checkbox
                        checked={true}
                        className="h-5 w-5 rounded-md data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                        onCheckedChange={() => handleComplete(task)}
                      />
                    </motion.div>
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg opacity-50",
                        typeConfig.bgColor,
                        typeConfig.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-zinc-400 line-through">
                        {task.title}
                      </p>
                      {task.completed_at && (
                        <p className="mt-0.5 text-xs text-zinc-400">
                          Completed{" "}
                          {formatDistanceToNow(new Date(task.completed_at), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                    <Button
                      className="h-8 w-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deleteTask(task.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-4 w-4 text-zinc-400" />
                    </Button>
                  </motion.div>
                );
              })}
              {completedTasks.length > 5 && (
                <p className="py-2 text-center text-xs text-zinc-400">
                  + {completedTasks.length - 5} more completed tasks
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function useDonorsPageLayout() {
  const { profile, loading: authLoading } = useAuth();
  const supabase = React.useMemo(
    () => (typeof window === "undefined" ? null : createBrowserClient()),
    []
  );
  const [donors, setDonors] = React.useState<Donor[]>([]);
  const [selectedDonorId, setSelectedDonorId] = React.useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [tagFilter, setTagFilter] = React.useState<string[]>([]);
  const [pledgeFilter, setPledgeFilter] = React.useState<string>("All");
  const [sortBy, setSortBy] = React.useState<SortOption>("last_gift");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [noteInput, setNoteInput] = React.useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isSavingTags, setIsSavingTags] = React.useState(false);
  const [isSavingNote, setIsSavingNote] = React.useState(false);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const [activityType, setActivityType] = React.useState<
    "note" | "call" | "meeting" | "email"
  >("note");

  const editForm = useForm<EditDonorFormValues>({
    resolver: zodResolver(editDonorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      mobile: "",
      work_phone: "",
      preferred_contact: "email",
      type: "Individual",
      status: "Active",
      frequency: "Monthly",
      location: "",
      website: "",
      organization: "",
      title: "",
      spouse: "",
      birthday: "",
      anniversary: "",
      notes: "",
      street: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const fetchDonors = React.useCallback(async () => {
    if (!(profile?.id && supabase)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: donorsData, error: donorsError } = await supabase
        .from("donors")
        .select("*")
        .eq("missionary_id", profile.id)
        .order("name", { ascending: true });

      if (donorsError) {
        throw donorsError;
      }

      const donorIds = (donorsData || []).map((d) => d.id);

      const { data: activitiesData, error: activitiesError } = await supabase
        .from("donor_activities")
        .select("*")
        .in("donor_id", donorIds)
        .order("date", { ascending: false });

      if (activitiesError) {
        throw activitiesError;
      }

      const { data: pledgesData, error: pledgesError } = await supabase
        .from("donor_pledges")
        .select("*")
        .in("donor_id", donorIds)
        .order("start_date", { ascending: false });

      if (pledgesError) {
        throw pledgesError;
      }

      const activitiesByDonor = (activitiesData || []).reduce(
        (acc, activity) => {
          if (!acc[activity.donor_id]) {
            acc[activity.donor_id] = [];
          }
          acc[activity.donor_id].push(activity);
          return acc;
        },
        {} as Record<string, Activity[]>
      );

      const pledgesByDonor = (pledgesData || []).reduce(
        (acc, pledge) => {
          if (!acc[pledge.donor_id]) {
            acc[pledge.donor_id] = [];
          }
          acc[pledge.donor_id].push(pledge);
          return acc;
        },
        {} as Record<string, RecurringDonation[]>
      );

      const formattedDonors: Donor[] = (donorsData || []).map((d) => ({
        ...d,
        initials: d.name
          ? d.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "??",
        activities: activitiesByDonor[d.id] || [],
        recurring_donations: pledgesByDonor[d.id] || [],
        address: d.address || {},
        work_address: d.work_address || {},
        tags: d.tags || [],
        total_given: Number(d.total_given) || 0,
        last_gift_amount: d.last_gift_amount
          ? Number(d.last_gift_amount)
          : null,
        score: Number(d.score) || 0,
      }));

      setDonors(formattedDonors);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load donors";
      setError(errorMessage);
      toast.error("Failed to load donors");
      console.error("Donors fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, supabase]);

  React.useEffect(() => {
    if (!authLoading && profile?.id) {
      fetchDonors();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [fetchDonors, authLoading, profile?.id]);

  const filteredDonors = React.useMemo(() => {
    const result = donors.filter((donor) => {
      const matchesSearch =
        (donor.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donor.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donor.location || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (donor.organization || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || donor.status === statusFilter;
      const matchesTags =
        tagFilter.length === 0 || tagFilter.some((t) => donor.tags.includes(t));
      const matchesPledge =
        pledgeFilter === "All" ||
        (pledgeFilter === "Active" && donor.has_active_pledge) ||
        (pledgeFilter === "Inactive" && !donor.has_active_pledge);
      return matchesSearch && matchesStatus && matchesTags && matchesPledge;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "last_gift": {
          const dateA = a.last_gift_date
            ? new Date(a.last_gift_date).getTime()
            : 0;
          const dateB = b.last_gift_date
            ? new Date(b.last_gift_date).getTime()
            : 0;
          comparison = dateB - dateA;
          break;
        }
        case "total_given":
          comparison = (b.total_given || 0) - (a.total_given || 0);
          break;
        case "joined_date": {
          const joinA = a.joined_date ? new Date(a.joined_date).getTime() : 0;
          const joinB = b.joined_date ? new Date(b.joined_date).getTime() : 0;
          comparison = joinB - joinA;
          break;
        }
      }
      return sortAsc ? -comparison : comparison;
    });

    return result;
  }, [
    donors,
    searchTerm,
    statusFilter,
    tagFilter,
    pledgeFilter,
    sortBy,
    sortAsc,
  ]);

  const selectedDonor = React.useMemo(
    () => donors.find((d) => d.id === selectedDonorId) || null,
    [donors, selectedDonorId]
  );

  React.useEffect(() => {
    if (selectedDonor) {
      setSelectedTags(selectedDonor.tags || []);
    }
  }, [selectedDonor]);

  const copyToClipboard = React.useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }, []);

  const handleAddNote = React.useCallback(async () => {
    if (!(selectedDonor && noteInput.trim() && supabase)) {
      return;
    }

    setIsSavingNote(true);
    try {
      const titleMap = {
        note: "Note",
        call: "Phone Call",
        meeting: "Meeting",
        email: "Email",
      };

      const { error: insertError } = await supabase
        .from("donor_activities")
        .insert({
          donor_id: selectedDonor.id,
          type: activityType,
          title: titleMap[activityType],
          description: noteInput.trim(),
          date: new Date().toISOString(),
        });

      if (insertError) {
        throw insertError;
      }

      toast.success("Activity logged successfully");
      setNoteInput("");
      setIsNoteDialogOpen(false);
      fetchDonors();
    } catch (err) {
      toast.error("Failed to add activity");
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  }, [selectedDonor, noteInput, activityType, supabase, fetchDonors]);

  const handleSaveTags = React.useCallback(async () => {
    if (!(selectedDonor && supabase)) {
      return;
    }

    setIsSavingTags(true);
    try {
      const { error: updateError } = await supabase
        .from("donors")
        .update({ tags: selectedTags, updated_at: new Date().toISOString() })
        .eq("id", selectedDonor.id);

      if (updateError) {
        throw updateError;
      }

      setDonors((prev) =>
        prev.map((d) =>
          d.id === selectedDonor.id ? { ...d, tags: selectedTags } : d
        )
      );
      toast.success("Tags updated successfully");
      setIsTagDialogOpen(false);
    } catch (err) {
      toast.error("Failed to update tags");
      console.error(err);
    } finally {
      setIsSavingTags(false);
    }
  }, [selectedDonor, selectedTags, supabase]);

  const toggleTag = React.useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }, []);

  const openEditDialog = React.useCallback(() => {
    if (!selectedDonor) {
      return;
    }
    editForm.reset({
      name: selectedDonor.name || "",
      email: selectedDonor.email || "",
      phone: selectedDonor.phone || "",
      mobile: selectedDonor.mobile || "",
      work_phone: selectedDonor.work_phone || "",
      preferred_contact: selectedDonor.preferred_contact || "email",
      type: selectedDonor.type || "Individual",
      status: selectedDonor.status || "Active",
      frequency: selectedDonor.frequency || "Monthly",
      location: selectedDonor.location || "",
      website: selectedDonor.website || "",
      organization: selectedDonor.organization || "",
      title: selectedDonor.title || "",
      spouse: selectedDonor.spouse || "",
      birthday: selectedDonor.birthday || "",
      anniversary: selectedDonor.anniversary || "",
      notes: selectedDonor.notes || "",
      street: selectedDonor.address?.street || "",
      street2: selectedDonor.address?.street2 || "",
      city: selectedDonor.address?.city || "",
      state: selectedDonor.address?.state || "",
      zip: selectedDonor.address?.zip || "",
    });
    setIsEditDialogOpen(true);
  }, [selectedDonor, editForm]);

  const handleSaveEdit = React.useCallback(
    async (values: EditDonorFormValues) => {
      if (!(selectedDonor && supabase)) {
        return;
      }

      setIsSavingEdit(true);
      try {
        const { error: updateError } = await supabase
          .from("donors")
          .update({
            name: values.name,
            email: values.email,
            phone: values.phone || null,
            mobile: values.mobile || null,
            work_phone: values.work_phone || null,
            preferred_contact: values.preferred_contact,
            type: values.type,
            status: values.status,
            frequency: values.frequency,
            location: values.location || null,
            website: values.website || null,
            organization: values.organization || null,
            title: values.title || null,
            spouse: values.spouse || null,
            birthday: values.birthday || null,
            anniversary: values.anniversary || null,
            notes: values.notes || null,
            address: {
              street: values.street || "",
              street2: values.street2 || "",
              city: values.city || "",
              state: values.state || "",
              zip: values.zip || "",
              country: "USA",
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedDonor.id);

        if (updateError) {
          throw updateError;
        }

        toast.success("Partner updated successfully");
        setIsEditDialogOpen(false);
        fetchDonors();
      } catch (err) {
        toast.error("Failed to update partner");
        console.error(err);
      } finally {
        setIsSavingEdit(false);
      }
    },
    [selectedDonor, supabase, fetchDonors]
  );

  const handleStatCardClick = React.useCallback(
    (filterType: "atRisk" | "activePledge" | "lapsed" | "new") => {
      setSearchTerm("");
      setTagFilter([]);

      switch (filterType) {
        case "atRisk":
          setStatusFilter("At Risk");
          setPledgeFilter("All");
          break;
        case "activePledge":
          setStatusFilter("All");
          setPledgeFilter("Active");
          break;
        case "lapsed":
          setStatusFilter("Lapsed");
          setPledgeFilter("All");
          break;
        case "new":
          setStatusFilter("New");
          setPledgeFilter("All");
          break;
      }
      setSelectedDonorId(null);
    },
    []
  );

  const clearAllFilters = React.useCallback(() => {
    setStatusFilter("All");
    setTagFilter([]);
    setPledgeFilter("All");
    setSearchTerm("");
  }, []);

  const isLoading = authLoading || loading;

  const activeCount = donors.filter((d) => d.status === "Active").length;
  const atRiskCount = donors.filter((d) => d.status === "At Risk").length;
  const lapsedCount = donors.filter((d) => d.status === "Lapsed").length;
  const activePledgeCount = donors.filter((d) => d.has_active_pledge).length;
  const totalGiven = donors.reduce((sum, d) => sum + (d.total_given || 0), 0);
  const monthlyPledgeTotal = donors.reduce((sum, d) => {
    const activeRecurring = d.recurring_donations.find(
      (p) => p.status === "active"
    );
    if (!activeRecurring) {
      return sum;
    }
    const monthly =
      activeRecurring.frequency === "Monthly"
        ? activeRecurring.amount
        : activeRecurring.frequency === "Quarterly"
          ? activeRecurring.amount / 3
          : activeRecurring.amount / 12;
    return sum + monthly;
  }, 0);

  const formatAddress = (address: Address) => {
    const parts = [];
    if (address.street) {
      parts.push(address.street);
    }
    if (address.street2) {
      parts.push(address.street2);
    }
    const cityLine = [address.city, address.state, address.zip]
      .filter(Boolean)
      .join(", ");
    if (cityLine) {
      parts.push(cityLine);
    }
    if (
      address.country &&
      address.country !== "United States" &&
      address.country !== "USA"
    ) {
      parts.push(address.country);
    }
    return parts;
  };

  const hasActiveFilters =
    statusFilter !== "All" ||
    tagFilter.length > 0 ||
    pledgeFilter !== "All" ||
    searchTerm.length > 0;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="space-y-6"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        description="Manage your support network and donor relationships."
        title="Partners"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="h-9 px-4 font-medium text-xs"
            size="sm"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </motion.div>
        {profile?.id && (
          <AddPartnerDialog
            missionaryId={profile.id}
            onSuccess={fetchDonors}
            trigger={
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="h-9 px-4 font-medium text-xs" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </Button>
              </motion.div>
            }
          />
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          delay={0}
          icon={Users}
          iconBg="bg-zinc-50 border-zinc-100"
          iconColor="text-zinc-900"
          label="Total Partners"
          subtext={`${activeCount} active`}
          value={donors.length}
        />
        <StatCard
          delay={0.05}
          icon={Heart}
          iconBg="bg-emerald-50 border-emerald-100"
          iconColor="text-emerald-600"
          label="Total Given"
          subtext="Lifetime"
          value={formatCurrency(totalGiven)}
        />
        <StatCard
          delay={0.1}
          icon={Repeat}
          iconBg="bg-blue-50 border-blue-100"
          iconColor="text-blue-600"
          isActive={pledgeFilter === "Active"}
          label="Recurring Donations"
          onClick={() => handleStatCardClick("activePledge")}
          subtext={`${formatCurrency(monthlyPledgeTotal)}/mo`}
          value={activePledgeCount}
        />
        <StatCard
          delay={0.15}
          icon={AlertCircle}
          iconBg="bg-amber-50 border-amber-100"
          iconColor="text-amber-600"
          isActive={statusFilter === "At Risk"}
          label="Needs Attention"
          onClick={() => handleStatCardClick("atRisk")}
          subtext={`${atRiskCount} at risk, ${lapsedCount} lapsed`}
          value={atRiskCount + lapsedCount}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 xl:col-span-3"
          initial={{ opacity: 0, x: -20 }}
          transition={{ ...smoothTransition, delay: 0.2 }}
        >
          <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
            <div className="shrink-0 space-y-4 border-zinc-100 border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                  Partner List{" "}
                  {hasActiveFilters && (
                    <span className="text-blue-600">
                      ({filteredDonors.length})
                    </span>
                  )}
                </h2>
                <div className="flex gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900"
                        size="icon"
                        variant="ghost"
                      >
                        <ArrowDownUp className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl border-zinc-100 shadow-xl"
                    >
                      <DropdownMenuLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                        Sort By
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {[
                        { value: "last_gift", label: "Last Gift Date" },
                        { value: "total_given", label: "Total Given" },
                        { value: "name", label: "Name" },
                        { value: "joined_date", label: "Partner Since" },
                      ].map((opt) => (
                        <DropdownMenuCheckboxItem
                          checked={sortBy === opt.value}
                          className="font-medium text-xs"
                          key={opt.value}
                          onCheckedChange={() =>
                            setSortBy(opt.value as SortOption)
                          }
                        >
                          {opt.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuCheckboxItem
                        checked={sortAsc}
                        className="font-medium text-xs"
                        onCheckedChange={() => setSortAsc(!sortAsc)}
                      >
                        Ascending
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          hasActiveFilters
                            ? "bg-blue-50 text-blue-600"
                            : "text-zinc-400 hover:text-zinc-900"
                        )}
                        size="icon"
                        variant="ghost"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="max-h-[400px] w-56 overflow-y-auto rounded-xl border-zinc-100 shadow-xl"
                    >
                      <DropdownMenuLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                        Filter by Status
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {["All", "Active", "New", "Lapsed", "At Risk"].map(
                        (s) => (
                          <DropdownMenuCheckboxItem
                            checked={statusFilter === s}
                            className="font-medium text-xs"
                            key={s}
                            onCheckedChange={() => setStatusFilter(s)}
                          >
                            {s}
                          </DropdownMenuCheckboxItem>
                        )
                      )}
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                        Filter by Recurring
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {["All", "Active", "Inactive"].map((p) => (
                        <DropdownMenuCheckboxItem
                          checked={pledgeFilter === p}
                          className="font-medium text-xs"
                          key={p}
                          onCheckedChange={() => setPledgeFilter(p)}
                        >
                          {p === "Active"
                            ? "Has Recurring"
                            : p === "Inactive"
                              ? "No Recurring"
                              : "All"}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                        Filter by Tag
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {AVAILABLE_TAGS.map((tag) => (
                        <DropdownMenuCheckboxItem
                          checked={tagFilter.includes(tag.id)}
                          className="font-medium text-xs"
                          key={tag.id}
                          onCheckedChange={() =>
                            setTagFilter((prev) =>
                              prev.includes(tag.id)
                                ? prev.filter((t) => t !== tag.id)
                                : [...prev, tag.id]
                            )
                          }
                        >
                          {tag.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {hasActiveFilters && (
                        <>
                          <DropdownMenuSeparator className="bg-zinc-100" />
                          <DropdownMenuItem
                            className="font-medium text-rose-600 text-xs"
                            onClick={clearAllFilters}
                          >
                            Clear All Filters
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
                <Input
                  className="h-10 rounded-xl border-zinc-100 bg-zinc-50 pl-9 text-sm transition-all focus:border-zinc-300 focus:bg-white"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search partners..."
                  value={searchTerm}
                />
              </div>
              <AnimatePresence mode="popLayout">
                {hasActiveFilters && (
                  <motion.div
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-wrap gap-1.5 overflow-hidden"
                    exit={{ opacity: 0, height: 0 }}
                    initial={{ opacity: 0, height: 0 }}
                  >
                    {statusFilter !== "All" && (
                      <motion.div
                        layout
                        {...scaleIn}
                        transition={springTransition}
                      >
                        <Badge
                          className="rounded-full border-zinc-200 bg-zinc-100 px-2 py-0.5 font-black text-[9px] text-zinc-600 uppercase tracking-widest"
                          variant="outline"
                        >
                          {statusFilter}
                          <button
                            className="ml-1 hover:text-zinc-900"
                            onClick={() => setStatusFilter("All")}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      </motion.div>
                    )}
                    {pledgeFilter !== "All" && (
                      <motion.div
                        layout
                        {...scaleIn}
                        transition={springTransition}
                      >
                        <Badge
                          className="rounded-full border-blue-200 bg-blue-50 px-2 py-0.5 font-black text-[9px] text-blue-600 uppercase tracking-widest"
                          variant="outline"
                        >
                          {pledgeFilter === "Active"
                            ? "Recurring"
                            : "No Recurring"}
                          <button
                            className="ml-1 hover:text-blue-900"
                            onClick={() => setPledgeFilter("All")}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      </motion.div>
                    )}
                    {tagFilter.map((tag) => (
                      <motion.div
                        key={tag}
                        layout
                        {...scaleIn}
                        transition={springTransition}
                      >
                        <Badge
                          className={cn(
                            "rounded-full border px-2 py-0.5 font-black text-[9px] uppercase tracking-widest",
                            getTagStyle(tag)
                          )}
                          variant="outline"
                        >
                          {getTagLabel(tag)}
                          <button
                            className="ml-1"
                            onClick={() =>
                              setTagFilter((prev) =>
                                prev.filter((t) => t !== tag)
                              )
                            }
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                    <motion.button
                      className="px-2 font-black text-[9px] text-rose-500 uppercase tracking-widest hover:text-rose-700"
                      layout
                      onClick={clearAllFilters}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear All
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              {error ? (
                <ErrorState message={error} onRetry={fetchDonors} />
              ) : isLoading ? (
                <DonorListSkeleton />
              ) : filteredDonors.length === 0 ? (
                <motion.div
                  {...fadeInUp}
                  className="flex h-64 flex-col items-center justify-center p-6 text-center"
                  transition={smoothTransition}
                >
                  <motion.div
                    animate={{ scale: 1 }}
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100"
                    initial={{ scale: 0.8 }}
                    transition={springTransition}
                  >
                    <Search className="h-6 w-6 text-zinc-300" />
                  </motion.div>
                  <p className="font-bold text-sm text-zinc-900">
                    No partners found
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {hasActiveFilters
                      ? "Try adjusting your filters"
                      : "Add your first partner to get started"}
                  </p>
                  {hasActiveFilters && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="mt-4 h-8 rounded-xl text-xs"
                        onClick={clearAllFilters}
                        size="sm"
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <LayoutGroup>
                  <motion.div
                    animate="animate"
                    className="space-y-1 p-2"
                    initial="initial"
                    variants={staggerContainer}
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredDonors.map((donor, index) => (
                        <motion.div
                          animate="animate"
                          className={cn(
                            "group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors",
                            selectedDonorId === donor.id
                              ? "border-zinc-900 bg-zinc-900"
                              : "border-transparent bg-white hover:border-zinc-200 hover:bg-zinc-50"
                          )}
                          exit="exit"
                          initial="initial"
                          key={donor.id}
                          layout
                          onClick={() => setSelectedDonorId(donor.id)}
                          transition={{
                            ...smoothTransition,
                            delay: index * 0.02,
                          }}
                          variants={fadeInUp}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="relative shrink-0">
                            <Avatar
                              className={cn(
                                "h-10 w-10 border-2",
                                selectedDonorId === donor.id
                                  ? "border-zinc-700"
                                  : "border-white shadow-sm"
                              )}
                            >
                              <AvatarImage src={donor.avatar_url} />
                              <AvatarFallback
                                className={cn(
                                  "font-bold text-xs",
                                  selectedDonorId === donor.id
                                    ? "bg-zinc-800 text-zinc-300"
                                    : "bg-zinc-100 text-zinc-500"
                                )}
                              >
                                {donor.initials}
                              </AvatarFallback>
                            </Avatar>
                            <motion.div
                              animate={{ scale: 1 }}
                              className={cn(
                                "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2",
                                selectedDonorId === donor.id
                                  ? "border-zinc-900"
                                  : "border-white",
                                getStatusColor(donor.status)
                              )}
                              initial={{ scale: 0.95, opacity: 0 }}
                              transition={springTransition}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 flex items-center justify-between">
                              <span
                                className={cn(
                                  "truncate font-bold text-sm",
                                  selectedDonorId === donor.id
                                    ? "text-white"
                                    : "text-zinc-900"
                                )}
                              >
                                {donor.name}
                              </span>
                              {donor.has_active_pledge && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  className={cn(
                                    "ml-1 h-2 w-2 shrink-0 rounded-full",
                                    selectedDonorId === donor.id
                                      ? "bg-emerald-400"
                                      : "bg-emerald-500"
                                  )}
                                  title="Active recurring donation"
                                  transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "max-w-[100px] truncate font-medium text-[10px] uppercase tracking-wider",
                                  selectedDonorId === donor.id
                                    ? "text-zinc-400"
                                    : "text-zinc-400"
                                )}
                              >
                                {donor.location || "Unknown"}
                              </span>
                              <span
                                className={cn(
                                  "font-black text-xs",
                                  selectedDonorId === donor.id
                                    ? "text-zinc-300"
                                    : "text-zinc-900"
                                )}
                              >
                                {formatCurrency(donor.total_given)}
                              </span>
                            </div>
                          </div>
                          <motion.div
                            animate={{
                              x: selectedDonorId === donor.id ? 0 : -2,
                            }}
                            whileHover={{ x: 2 }}
                          >
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 shrink-0",
                                selectedDonorId === donor.id
                                  ? "text-zinc-500"
                                  : "text-zinc-300"
                              )}
                            />
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </LayoutGroup>
              )}
            </ScrollArea>
          </Card>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 xl:col-span-9"
          initial={{ opacity: 0, x: 20 }}
          transition={{ ...smoothTransition, delay: 0.25 }}
        >
          <AnimatePresence mode="wait">
            {selectedDonor ? (
              <motion.div
                key={selectedDonor.id}
                {...slideInRight}
                transition={smoothTransition}
              >
                <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
                  <div className="shrink-0 border-zinc-100 border-b p-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="h-9 w-9 rounded-xl text-zinc-400 hover:bg-zinc-100 lg:hidden"
                            onClick={() => setSelectedDonorId(null)}
                            size="icon"
                            variant="ghost"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        </motion.div>
                        <motion.div
                          animate={{ scale: 1, opacity: 1 }}
                          initial={{ scale: 0.8, opacity: 0 }}
                          transition={springTransition}
                        >
                          <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-lg">
                            <AvatarImage src={selectedDonor.avatar_url} />
                            <AvatarFallback className="bg-zinc-100 font-bold text-lg text-zinc-500">
                              {selectedDonor.initials}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        <motion.div
                          animate={{ opacity: 1, x: 0 }}
                          initial={{ opacity: 0, x: -10 }}
                          transition={{ ...smoothTransition, delay: 0.1 }}
                        >
                          <div className="mb-1 flex items-center gap-3">
                            <h2 className="font-bold text-lg text-zinc-900 tracking-tight">
                              {selectedDonor.name}
                            </h2>
                            {getStatusBadge(selectedDonor.status)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{" "}
                              {selectedDonor.location || "Unknown"}
                            </span>
                            <span className="flex items-center gap-1 capitalize">
                              {selectedDonor.type === "Church" ? (
                                <Building2 className="h-3 w-3" />
                              ) : selectedDonor.type === "Organization" ? (
                                <Briefcase className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              {selectedDonor.type}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="flex w-full items-center gap-2 sm:w-auto"
                        initial={{ opacity: 0, y: 10 }}
                        transition={{ ...smoothTransition, delay: 0.15 }}
                      >
                        <motion.div
                          className="flex-1 sm:flex-none"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className="h-9 w-full rounded-xl border-zinc-200 px-4 font-medium text-xs hover:bg-zinc-50"
                            onClick={() => {
                              setActivityType("note");
                              setIsNoteDialogOpen(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Note
                          </Button>
                        </motion.div>
                        <motion.div
                          className="flex-1 sm:flex-none"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            asChild
                            className="h-9 w-full rounded-xl border-zinc-200 px-4 font-medium text-xs hover:bg-zinc-50"
                            size="sm"
                            variant="outline"
                          >
                            <a
                              href={`tel:${selectedDonor.phone || selectedDonor.mobile}`}
                            >
                              <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
                            </a>
                          </Button>
                        </motion.div>
                        <motion.div
                          className="flex-1 sm:flex-none"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            asChild
                            className="h-9 w-full rounded-xl px-4 font-medium text-xs"
                            size="sm"
                          >
                            <a href={`mailto:${selectedDonor.email}`}>
                              <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
                            </a>
                          </Button>
                        </motion.div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="h-9 w-9 rounded-xl text-zinc-400 hover:bg-zinc-100"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl border-zinc-100 shadow-xl"
                          >
                            <DropdownMenuLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-100" />
                            <DropdownMenuItem
                              className="font-medium text-xs"
                              onClick={openEditDialog}
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                              Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="font-medium text-xs"
                              onClick={() => setIsTagDialogOpen(true)}
                            >
                              <Tag className="mr-2 h-3.5 w-3.5" /> Manage Tags
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-100" />
                            <DropdownMenuItem
                              className="font-medium text-xs"
                              onClick={() => {
                                setActivityType("call");
                                setIsNoteDialogOpen(true);
                              }}
                            >
                              <Phone className="mr-2 h-3.5 w-3.5" /> Log Call
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="font-medium text-xs"
                              onClick={() => {
                                setActivityType("meeting");
                                setIsNoteDialogOpen(true);
                              }}
                            >
                              <Briefcase className="mr-2 h-3.5 w-3.5" /> Log
                              Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="font-medium text-xs"
                              onClick={() => {
                                setActivityType("email");
                                setIsNoteDialogOpen(true);
                              }}
                            >
                              <Mail className="mr-2 h-3.5 w-3.5" /> Log Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    </div>

                    <motion.div
                      animate="animate"
                      className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4"
                      initial="initial"
                      variants={staggerContainer}
                    >
                      {[
                        {
                          label: "Lifetime",
                          value: formatCurrency(selectedDonor.total_given),
                        },
                        {
                          label: "Last Gift",
                          value: formatCurrency(selectedDonor.last_gift_amount),
                          extra: selectedDonor.last_gift_date
                            ? formatDistanceToNow(
                                new Date(selectedDonor.last_gift_date),
                                { addSuffix: true }
                              )
                            : null,
                          showPulse:
                            selectedDonor.last_gift_date &&
                            differenceInMonths(
                              new Date(),
                              new Date(selectedDonor.last_gift_date)
                            ) < 1,
                        },
                        {
                          label: "Frequency",
                          value: selectedDonor.frequency || "N/A",
                          icon: ArrowUpRight,
                        },
                        {
                          label: "Partner Since",
                          value: selectedDonor.joined_date
                            ? format(
                                new Date(selectedDonor.joined_date),
                                "MMM yyyy"
                              )
                            : "N/A",
                        },
                      ].map((stat, i) => (
                        <motion.div
                          className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                          key={stat.label}
                          transition={{
                            ...smoothTransition,
                            delay: 0.2 + i * 0.05,
                          }}
                          variants={fadeInUp}
                          whileHover={{ y: -2 }}
                        >
                          <p className="mb-1 font-bold text-[10px] text-zinc-400 uppercase tracking-wider">
                            {stat.label}
                          </p>
                          <div className="flex items-center gap-2">
                            {stat.icon && (
                              <stat.icon className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                            <p
                              className={cn(
                                stat.label === "Lifetime" ||
                                  stat.label === "Last Gift"
                                  ? "text-lg"
                                  : "text-sm",
                                "font-bold text-zinc-900"
                              )}
                            >
                              {stat.value}
                            </p>
                            {stat.showPulse && (
                              <motion.div
                                animate={{
                                  scale: [1, 1.3, 1],
                                  opacity: [1, 0.7, 1],
                                }}
                                className="h-2 w-2 rounded-full bg-emerald-500"
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                }}
                              />
                            )}
                          </div>
                          {stat.extra && (
                            <p className="mt-0.5 text-[10px] text-zinc-400">
                              {stat.extra}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      animate={{ opacity: 1 }}
                      className="mt-4 flex flex-wrap items-center gap-1.5"
                      initial={{ opacity: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <AnimatePresence mode="popLayout">
                        {(selectedDonor.tags || []).map((tag, i) => (
                          <motion.div
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            key={tag}
                            layout
                            transition={{
                              ...springTransition,
                              delay: i * 0.03,
                            }}
                          >
                            <Badge
                              className={cn(
                                "rounded-full border px-2 py-0.5 font-black text-[9px] uppercase tracking-widest",
                                getTagStyle(tag)
                              )}
                              variant="outline"
                            >
                              {getTagLabel(tag)}
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className="h-6 px-2 font-black text-[10px] text-zinc-400 uppercase tracking-widest hover:text-zinc-900"
                          onClick={() => setIsTagDialogOpen(true)}
                          size="sm"
                          variant="ghost"
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add Tag
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>

                  <Tabs
                    className="flex min-h-0 flex-1 flex-col"
                    onValueChange={setActiveTab}
                    value={activeTab}
                  >
                    <div className="shrink-0 border-zinc-100 border-b px-6 py-4">
                      <TabsList className="grid h-auto w-full grid-cols-5 rounded-2xl border border-zinc-100 bg-zinc-100/50 p-1.5 sm:flex sm:w-auto">
                        {[
                          "overview",
                          "tasks",
                          "contact",
                          "recurring",
                          "giving",
                        ].map((tab) => (
                          <TabsTrigger
                            className="rounded-xl px-4 py-2 font-black text-[10px] text-zinc-400 uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm sm:px-6"
                            key={tab}
                            value={tab}
                          >
                            {tab === "overview"
                              ? "Overview"
                              : tab === "tasks"
                                ? "Tasks"
                                : tab === "contact"
                                  ? "Contact"
                                  : tab === "recurring"
                                    ? "Recurring"
                                    : "Giving"}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <ScrollArea className="min-h-0 flex-1">
                      <div className="p-6">
                        <AnimatePresence mode="wait">
                          <TabsContent
                            className="mt-0 space-y-6"
                            value="overview"
                          >
                            <motion.div
                              {...fadeInUp}
                              className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                              transition={smoothTransition}
                            >
                              <Textarea
                                className="min-h-[80px] resize-none rounded-xl border-none bg-white p-3 text-sm shadow-sm focus:ring-0"
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Log a call, meeting notes, or observation..."
                                value={noteInput}
                              />
                              <div className="mt-3 flex items-center justify-between border-zinc-100 border-t pt-3">
                                <div className="flex gap-2">
                                  {[
                                    {
                                      type: "call",
                                      icon: Phone,
                                      bg: "bg-blue-50 text-blue-600",
                                    },
                                    {
                                      type: "meeting",
                                      icon: Briefcase,
                                      bg: "bg-emerald-50 text-emerald-600",
                                    },
                                    {
                                      type: "note",
                                      icon: MessageSquare,
                                      bg: "bg-zinc-200 text-zinc-700",
                                      hidden: "hidden sm:flex",
                                    },
                                  ].map(({ type, icon: Icon, bg, hidden }) => (
                                    <motion.div
                                      key={type}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        className={cn(
                                          "h-8 rounded-lg font-black text-[10px] uppercase tracking-widest",
                                          hidden,
                                          activityType === type
                                            ? bg
                                            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                                        )}
                                        onClick={() =>
                                          setActivityType(
                                            type as typeof activityType
                                          )
                                        }
                                        size="sm"
                                        variant="ghost"
                                      >
                                        <Icon className="mr-1.5 h-3.5 w-3.5" />{" "}
                                        {type.charAt(0).toUpperCase() +
                                          type.slice(1)}
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button
                                    className="h-8 rounded-xl px-4 font-black text-[10px] uppercase tracking-widest"
                                    disabled={!noteInput.trim() || isSavingNote}
                                    onClick={handleAddNote}
                                    size="sm"
                                  >
                                    {isSavingNote ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        Post <Send className="ml-1.5 h-3 w-3" />
                                      </>
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>

                            <div className="relative space-y-4">
                              <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-zinc-100" />

                              {selectedDonor.activities.length === 0 ? (
                                <motion.div
                                  {...fadeInUp}
                                  className="ml-8 flex flex-col items-center justify-center py-16 text-center"
                                >
                                  <motion.div
                                    animate={{ scale: 1 }}
                                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100"
                                    initial={{ scale: 0.8 }}
                                    transition={springTransition}
                                  >
                                    <Calendar className="h-7 w-7 text-zinc-300" />
                                  </motion.div>
                                  <p className="font-bold text-sm text-zinc-900">
                                    No activity recorded yet
                                  </p>
                                  <p className="mt-1 text-xs text-zinc-400">
                                    Start by logging your first interaction
                                  </p>
                                </motion.div>
                              ) : (
                                <AnimatePresence>
                                  {selectedDonor.activities.map(
                                    (activity, i) => (
                                      <motion.div
                                        animate={{ opacity: 1, x: 0 }}
                                        className="group relative pl-10"
                                        initial={{ opacity: 0, x: -20 }}
                                        key={activity.id}
                                        transition={{
                                          ...smoothTransition,
                                          delay: i * 0.05,
                                        }}
                                      >
                                        <motion.div
                                          className={cn(
                                            "absolute top-1 left-0 z-10 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm",
                                            getActivityBg(
                                              activity.type as ActivityType
                                            )
                                          )}
                                          whileHover={{ scale: 1.15 }}
                                        >
                                          {getActivityIcon(
                                            activity.type as ActivityType
                                          )}
                                        </motion.div>

                                        <motion.div
                                          className="rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300"
                                          whileHover={{
                                            y: -2,
                                            boxShadow:
                                              "0 8px 30px rgba(0,0,0,0.08)",
                                          }}
                                        >
                                          <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                            <div className="space-y-1">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-sm text-zinc-900">
                                                  {activity.title}
                                                </span>
                                                {activity.amount && (
                                                  <Badge
                                                    className={cn(
                                                      "h-5 rounded-lg border-0 px-2 font-black text-[9px] uppercase tracking-widest",
                                                      activity.status ===
                                                        "Failed"
                                                        ? "bg-rose-50 text-rose-600"
                                                        : "bg-emerald-50 text-emerald-700"
                                                    )}
                                                  >
                                                    {formatCurrency(
                                                      activity.amount
                                                    )}
                                                  </Badge>
                                                )}
                                                {activity.gift_type && (
                                                  <span className="flex items-center gap-1 font-medium text-[10px] text-zinc-400">
                                                    {getGiftTypeIcon(
                                                      activity.gift_type
                                                    )}
                                                    {activity.gift_type}
                                                  </span>
                                                )}
                                                {activity.status ===
                                                  "Failed" && (
                                                  <Badge className="border-0 bg-rose-50 font-black text-[9px] text-rose-600 uppercase tracking-widest">
                                                    Failed
                                                  </Badge>
                                                )}
                                              </div>
                                              {activity.description && (
                                                <p className="text-sm text-zinc-500 leading-relaxed">
                                                  {activity.description}
                                                </p>
                                              )}
                                              {activity.note && (
                                                <p className="text-xs text-zinc-400 italic">
                                                  {activity.note}
                                                </p>
                                              )}
                                            </div>
                                            <span className="whitespace-nowrap font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                              {format(
                                                new Date(activity.date),
                                                "MMM d, yyyy"
                                              )}
                                            </span>
                                          </div>
                                        </motion.div>
                                      </motion.div>
                                    )
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent className="mt-0 space-y-6" value="tasks">
                            <DonorTasks
                              donorId={selectedDonor.id}
                              donorName={selectedDonor.name}
                            />
                          </TabsContent>

                          <TabsContent
                            className="mt-0 space-y-6"
                            value="contact"
                          >
                            <motion.div
                              {...fadeInUp}
                              className="mb-2 flex items-center justify-between"
                              transition={smoothTransition}
                            >
                              <h3 className="font-bold text-sm text-zinc-900">
                                Contact Information
                              </h3>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  className="h-8 rounded-xl border-zinc-200 px-3 text-xs"
                                  onClick={openEditDialog}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                                </Button>
                              </motion.div>
                            </motion.div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                              <motion.div
                                animate="animate"
                                className="space-y-3"
                                initial="initial"
                                variants={staggerContainer}
                              >
                                {[
                                  {
                                    icon: Mail,
                                    label: "Email",
                                    value: selectedDonor.email,
                                    preferred:
                                      selectedDonor.preferred_contact ===
                                      "email",
                                    color: "blue",
                                  },
                                  {
                                    icon: Phone,
                                    label: "Primary Phone",
                                    value: selectedDonor.phone,
                                    preferred:
                                      selectedDonor.preferred_contact ===
                                      "phone",
                                    color: "emerald",
                                  },
                                  {
                                    icon: MessageSquare,
                                    label: "Mobile / Text",
                                    value: selectedDonor.mobile,
                                    preferred:
                                      selectedDonor.preferred_contact ===
                                      "text",
                                    color: "purple",
                                  },
                                  {
                                    icon: Briefcase,
                                    label: "Work Phone",
                                    value: selectedDonor.work_phone,
                                    color: "zinc",
                                  },
                                ].map((item, i) => (
                                  <motion.div
                                    className="group flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition-all hover:border-zinc-200"
                                    key={item.label}
                                    transition={{ delay: i * 0.05 }}
                                    variants={fadeInUp}
                                    whileHover={{ y: -2 }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                          `bg-${item.color}-50 text-${item.color}-600`
                                        )}
                                      >
                                        <item.icon className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                            {item.label}
                                          </p>
                                          {item.preferred && (
                                            <Badge
                                              className={cn(
                                                `bg-${item.color}-50 text-${item.color}-600`,
                                                "border-0 px-1.5 py-0 font-black text-[8px] uppercase tracking-widest"
                                              )}
                                            >
                                              Preferred
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="truncate font-medium text-sm text-zinc-900">
                                          {item.value || "Not provided"}
                                        </p>
                                      </div>
                                    </div>
                                    {item.value && (
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Button
                                          className={cn(
                                            "h-9 w-9 shrink-0 rounded-xl",
                                            `text-zinc-400 hover:text-${item.color}-600 hover:bg-${item.color}-50`
                                          )}
                                          onClick={() =>
                                            copyToClipboard(
                                              item.value!,
                                              item.label
                                            )
                                          }
                                          size="icon"
                                          variant="ghost"
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                ))}
                                {selectedDonor.website && (
                                  <motion.div
                                    className="group flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition-all hover:border-zinc-200"
                                    variants={fadeInUp}
                                    whileHover={{ y: -2 }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Globe className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                          Website
                                        </p>
                                        <p className="truncate font-medium text-sm text-zinc-900">
                                          {selectedDonor.website}
                                        </p>
                                      </div>
                                    </div>
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Button
                                        asChild
                                        className="h-9 w-9 shrink-0 rounded-xl text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600"
                                        size="icon"
                                        variant="ghost"
                                      >
                                        <a
                                          href={
                                            selectedDonor.website.startsWith(
                                              "http"
                                            )
                                              ? selectedDonor.website
                                              : `https://${selectedDonor.website}`
                                          }
                                          rel="noopener noreferrer"
                                          target="_blank"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    </motion.div>
                                  </motion.div>
                                )}
                              </motion.div>

                              <motion.div
                                animate="animate"
                                className="space-y-4"
                                initial="initial"
                                variants={staggerContainer}
                              >
                                <motion.div
                                  className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                                  variants={fadeInUp}
                                  whileHover={{ y: -2 }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                                        <Home className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="mb-1 font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                          Mailing Address
                                        </p>
                                        {selectedDonor.address?.street ? (
                                          <>
                                            {formatAddress(
                                              selectedDonor.address
                                            ).map((line, i) => (
                                              <p
                                                className={cn(
                                                  "text-sm",
                                                  i === 0
                                                    ? "font-medium text-zinc-900"
                                                    : "text-zinc-500"
                                                )}
                                                key={`${line}-${selectedDonor.id}`}
                                              >
                                                {line}
                                              </p>
                                            ))}
                                          </>
                                        ) : (
                                          <p className="text-sm text-zinc-400 italic">
                                            No address on file
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {selectedDonor.address?.street && (
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Button
                                          asChild
                                          className="h-9 w-9 shrink-0 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                                          size="icon"
                                          variant="ghost"
                                        >
                                          <a
                                            href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(selectedDonor.address).join(", "))}`}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>

                                {(selectedDonor.organization ||
                                  selectedDonor.title) && (
                                  <motion.div
                                    className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                                    variants={fadeInUp}
                                    whileHover={{ y: -2 }}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                                        <Building2 className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="mb-1 font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                          Organization
                                        </p>
                                        {selectedDonor.organization && (
                                          <p className="font-medium text-sm text-zinc-900">
                                            {selectedDonor.organization}
                                          </p>
                                        )}
                                        {selectedDonor.title && (
                                          <p className="text-sm text-zinc-500">
                                            {selectedDonor.title}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                  {selectedDonor.spouse && (
                                    <motion.div
                                      className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                                      variants={fadeInUp}
                                      whileHover={{ y: -2 }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                                          <Heart className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                            Spouse
                                          </p>
                                          <p className="font-medium text-sm text-zinc-900">
                                            {selectedDonor.spouse}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                  {selectedDonor.birthday && (
                                    <motion.div
                                      className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                                      variants={fadeInUp}
                                      whileHover={{ y: -2 }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                                          <Star className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                            Birthday
                                          </p>
                                          <p className="font-medium text-sm text-zinc-900">
                                            {format(
                                              new Date(selectedDonor.birthday),
                                              "MMMM d"
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                  {selectedDonor.anniversary && (
                                    <motion.div
                                      className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                                      variants={fadeInUp}
                                      whileHover={{ y: -2 }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                                          <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                            Anniversary
                                          </p>
                                          <p className="font-medium text-sm text-zinc-900">
                                            {format(
                                              new Date(
                                                selectedDonor.anniversary
                                              ),
                                              "MMMM d"
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>

                                {selectedDonor.notes && (
                                  <motion.div
                                    className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4"
                                    variants={fadeInUp}
                                    whileHover={{ y: -2 }}
                                  >
                                    <p className="mb-2 font-bold text-[10px] text-amber-600 uppercase tracking-widest">
                                      Internal Notes
                                    </p>
                                    <p className="text-sm text-zinc-700">
                                      {selectedDonor.notes}
                                    </p>
                                  </motion.div>
                                )}
                              </motion.div>
                            </div>
                          </TabsContent>

                          <TabsContent
                            className="mt-0 space-y-6"
                            value="recurring"
                          >
                            <motion.div
                              {...fadeInUp}
                              className="mb-2 flex items-center justify-between"
                              transition={smoothTransition}
                            >
                              <div>
                                <h3 className="font-bold text-sm text-zinc-900">
                                  Recurring Donations
                                </h3>
                                <p className="mt-0.5 text-xs text-zinc-500">
                                  Scheduled giving commitments for this partner
                                </p>
                              </div>
                            </motion.div>

                            {selectedDonor.recurring_donations.length === 0 ? (
                              <motion.div
                                {...fadeInUp}
                                className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 py-16 text-center"
                              >
                                <motion.div
                                  animate={{ scale: 1 }}
                                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm"
                                  initial={{ scale: 0.8 }}
                                  transition={springTransition}
                                >
                                  <Repeat className="h-7 w-7 text-zinc-300" />
                                </motion.div>
                                <p className="font-bold text-sm text-zinc-900">
                                  No recurring donations
                                </p>
                                <p className="mt-1 max-w-[280px] text-xs text-zinc-400">
                                  When this partner sets up a recurring gift, it
                                  will appear here with all the details.
                                </p>
                              </motion.div>
                            ) : (
                              <motion.div
                                animate="animate"
                                className="space-y-4"
                                initial="initial"
                                variants={staggerContainer}
                              >
                                {selectedDonor.recurring_donations.map(
                                  (recurring, i) => (
                                    <motion.div
                                      className={cn(
                                        "rounded-2xl border p-5 transition-all",
                                        recurring.status === "active"
                                          ? "border-emerald-200 bg-linear-to-br from-emerald-50/80 to-emerald-50/30"
                                          : "border-zinc-200 bg-zinc-50"
                                      )}
                                      key={recurring.id}
                                      transition={{ delay: i * 0.1 }}
                                      variants={fadeInUp}
                                      whileHover={{ y: -2 }}
                                    >
                                      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                                        <div className="flex items-start gap-4">
                                          <motion.div
                                            className={cn(
                                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                                              recurring.status === "active"
                                                ? "bg-emerald-100"
                                                : "bg-zinc-100"
                                            )}
                                            whileHover={{
                                              scale: 1.1,
                                              rotate: 5,
                                            }}
                                          >
                                            {getPaymentMethodIcon(
                                              recurring.payment_method
                                            )}
                                          </motion.div>
                                          <div>
                                            <div className="mb-1 flex items-center gap-3">
                                              <h4 className="font-bold text-xl text-zinc-900">
                                                {formatCurrency(
                                                  Number(recurring.amount)
                                                )}
                                              </h4>
                                              <span className="font-medium text-sm text-zinc-500">
                                                /{" "}
                                                {recurring.frequency.toLowerCase()}
                                              </span>
                                              {getRecurringStatusBadge(
                                                recurring.status as RecurringStatus
                                              )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                                              <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Started{" "}
                                                {format(
                                                  new Date(
                                                    recurring.start_date
                                                  ),
                                                  "MMM d, yyyy"
                                                )}
                                              </span>
                                              {recurring.end_date ? (
                                                <span className="flex items-center gap-1 text-amber-600">
                                                  <Clock className="h-3.5 w-3.5" />
                                                  Ends{" "}
                                                  {format(
                                                    new Date(
                                                      recurring.end_date
                                                    ),
                                                    "MMM d, yyyy"
                                                  )}
                                                </span>
                                              ) : (
                                                <span className="text-emerald-600">
                                                  No end date
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        {recurring.status === "active" &&
                                          recurring.next_payment_date && (
                                            <motion.div
                                              animate={{ opacity: 1, scale: 1 }}
                                              className="rounded-xl border border-emerald-100 bg-white p-3 text-center lg:text-right"
                                              initial={{
                                                opacity: 0,
                                                scale: 0.9,
                                              }}
                                            >
                                              <p className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                                Next Payment
                                              </p>
                                              <p className="font-bold text-lg text-zinc-900">
                                                {format(
                                                  new Date(
                                                    recurring.next_payment_date
                                                  ),
                                                  "MMM d"
                                                )}
                                              </p>
                                              <p className="text-xs text-zinc-500">
                                                {formatDistanceToNow(
                                                  new Date(
                                                    recurring.next_payment_date
                                                  ),
                                                  { addSuffix: true }
                                                )}
                                              </p>
                                            </motion.div>
                                          )}
                                      </div>

                                      <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-100 bg-white/60 p-4 sm:grid-cols-5">
                                        {[
                                          {
                                            label: "Payment Method",
                                            value:
                                              recurring.payment_method ||
                                              "Online",
                                            icon: true,
                                          },
                                          {
                                            label: "Total Paid",
                                            value: formatCurrency(
                                              Number(recurring.total_paid)
                                            ),
                                            color: "text-emerald-600",
                                          },
                                          {
                                            label: "Expected",
                                            value: formatCurrency(
                                              Number(recurring.total_expected)
                                            ),
                                          },
                                          {
                                            label: "Completed",
                                            value: `${recurring.payments_completed} payments`,
                                          },
                                          {
                                            label: "Remaining",
                                            value:
                                              recurring.payments_remaining > 0
                                                ? `${recurring.payments_remaining} payments`
                                                : "Ongoing",
                                          },
                                        ].map((item) => (
                                          <div key={item.label}>
                                            <p className="mb-1 font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                              {item.label}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                              {item.icon &&
                                                getPaymentMethodIcon(
                                                  recurring.payment_method
                                                )}
                                              <p
                                                className={cn(
                                                  "font-bold text-sm",
                                                  item.color || "text-zinc-900"
                                                )}
                                              >
                                                {item.value}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="mt-4">
                                        <div className="mb-1.5 flex items-center justify-between">
                                          <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                                            Progress
                                          </span>
                                          <span className="font-bold text-xs text-zinc-600">
                                            {Number(recurring.total_expected) >
                                            0
                                              ? `${Math.round((Number(recurring.total_paid) / Number(recurring.total_expected)) * 100)}%`
                                              : "Ongoing"}
                                          </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                                          <motion.div
                                            animate={{
                                              width:
                                                Number(
                                                  recurring.total_expected
                                                ) > 0
                                                  ? `${Math.min((Number(recurring.total_paid) / Number(recurring.total_expected)) * 100, 100)}%`
                                                  : "100%",
                                            }}
                                            className={cn(
                                              "h-full rounded-full",
                                              recurring.status === "active"
                                                ? "bg-emerald-500"
                                                : recurring.status ===
                                                    "completed"
                                                  ? "bg-blue-500"
                                                  : "bg-zinc-400"
                                            )}
                                            initial={{ width: 0 }}
                                            transition={{
                                              duration: 0.8,
                                              ease: "easeOut",
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </motion.div>
                                  )
                                )}
                              </motion.div>
                            )}
                          </TabsContent>

                          <TabsContent className="mt-0" value="giving">
                            <motion.div
                              {...fadeInUp}
                              className="overflow-x-auto rounded-2xl border border-zinc-200"
                              transition={smoothTransition}
                            >
                              <table className="w-full text-left text-sm">
                                <thead className="border-zinc-200 border-b bg-zinc-50 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                                  <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                  {selectedDonor.activities.filter(
                                    (a) => a.type === "gift"
                                  ).length > 0 ? (
                                    selectedDonor.activities
                                      .filter((a) => a.type === "gift")
                                      .map((gift, i) => (
                                        <motion.tr
                                          animate={{ opacity: 1 }}
                                          className="transition-colors hover:bg-zinc-50"
                                          initial={{ opacity: 0 }}
                                          key={gift.id}
                                          transition={{ delay: i * 0.05 }}
                                        >
                                          <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900">
                                            {format(
                                              new Date(gift.date),
                                              "MMM d, yyyy"
                                            )}
                                          </td>
                                          <td className="px-6 py-4 text-zinc-500">
                                            {gift.title}
                                          </td>
                                          <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-zinc-500">
                                              {gift.gift_type &&
                                                getGiftTypeIcon(gift.gift_type)}
                                              {gift.gift_type || "Online"}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 font-bold text-zinc-900">
                                            {formatCurrency(gift.amount || 0)}
                                          </td>
                                          <td className="px-6 py-4">
                                            <Badge
                                              className={cn(
                                                "rounded-full border-0 font-black text-[9px] uppercase tracking-widest",
                                                gift.status === "Failed"
                                                  ? "bg-rose-50 text-rose-600"
                                                  : "bg-emerald-50 text-emerald-700"
                                              )}
                                            >
                                              {gift.status || "Succeeded"}
                                            </Badge>
                                          </td>
                                        </motion.tr>
                                      ))
                                  ) : (
                                    <tr>
                                      <td colSpan={5}>
                                        <motion.div
                                          {...fadeInUp}
                                          className="p-16 text-center"
                                        >
                                          <motion.div
                                            animate={{ scale: 1 }}
                                            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100"
                                            initial={{ scale: 0.8 }}
                                            transition={springTransition}
                                          >
                                            <History className="h-6 w-6 text-zinc-300" />
                                          </motion.div>
                                          <p className="font-bold text-sm text-zinc-900">
                                            No giving history available
                                          </p>
                                        </motion.div>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </motion.div>
                          </TabsContent>
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </Tabs>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                {...scaleIn}
                transition={smoothTransition}
              >
                <Card className="flex h-full min-h-[600px] items-center justify-center rounded-[2.5rem] border-zinc-200 border-dashed bg-zinc-50/30">
                  <CardContent className="p-16 text-center">
                    <motion.div
                      animate={{ scale: 1, opacity: 1 }}
                      className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-100 bg-white shadow-sm"
                      initial={{ scale: 0.8, opacity: 0 }}
                      transition={springTransition}
                    >
                      <User className="h-10 w-10 text-zinc-200" />
                    </motion.div>
                    <motion.h3
                      animate={{ opacity: 1, y: 0 }}
                      className="font-black text-2xl text-zinc-900 tracking-tight"
                      initial={{ opacity: 0, y: 10 }}
                      transition={{ delay: 0.1 }}
                    >
                      Select a Partner
                    </motion.h3>
                    <motion.p
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-auto mt-2 max-w-[280px] font-medium text-sm text-zinc-400"
                      initial={{ opacity: 0, y: 10 }}
                      transition={{ delay: 0.15 }}
                    >
                      Choose a donor from the list to view their profile,
                      recurring donations, and giving history.
                    </motion.p>
                    {profile?.id && (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <AddPartnerDialog
                          missionaryId={profile.id}
                          onSuccess={fetchDonors}
                          trigger={
                            <Button className="mt-10 h-11 rounded-2xl bg-zinc-900 px-8 font-black text-[10px] text-white uppercase tracking-[0.2em] hover:bg-zinc-800">
                              <Plus className="mr-2 h-4 w-4" /> Add Partner
                            </Button>
                          }
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Dialog onOpenChange={setIsNoteDialogOpen} open={isNoteDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg tracking-tight">
              {activityType === "note"
                ? "Add Note"
                : activityType === "call"
                  ? "Log Call"
                  : activityType === "meeting"
                    ? "Log Meeting"
                    : "Log Email"}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Add to {selectedDonor?.name}&apos;s timeline.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              className="min-h-[150px] resize-none rounded-xl border-zinc-200"
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={
                activityType === "call"
                  ? "What did you discuss?"
                  : activityType === "meeting"
                    ? "Meeting notes..."
                    : "Type your note here..."
              }
              value={noteInput}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              className="h-10 rounded-xl border-zinc-200 px-6"
              onClick={() => setIsNoteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="h-10 rounded-xl px-6"
              disabled={!noteInput.trim() || isSavingNote}
              onClick={handleAddNote}
            >
              {isSavingNote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setIsTagDialogOpen} open={isTagDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg tracking-tight">
              Manage Tags
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Select tags for {selectedDonor?.name}. Tags help you organize and
              filter your partners.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <motion.div
              animate="animate"
              className="flex flex-wrap gap-2"
              initial="initial"
              variants={staggerContainer}
            >
              {AVAILABLE_TAGS.map((tag, i) => (
                <motion.button
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-bold text-xs transition-all",
                    selectedTags.includes(tag.id)
                      ? cn(tag.color, "ring-2 ring-zinc-400 ring-offset-1")
                      : "border-zinc-200 bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                  )}
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  transition={{ delay: i * 0.02 }}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence mode="wait">
                    {selectedTags.includes(tag.id) && (
                      <motion.span
                        animate={{ width: "auto", opacity: 1 }}
                        className="inline-flex overflow-hidden"
                        exit={{ width: 0, opacity: 0 }}
                        initial={{ width: 0, opacity: 0 }}
                      >
                        <Check className="mr-1 h-3 w-3" />
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
              className="h-10 rounded-xl border-zinc-200 px-6"
              onClick={() => setIsTagDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="h-10 rounded-xl px-6"
              disabled={isSavingTags}
              onClick={handleSaveTags}
            >
              {isSavingTags ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Tags"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setIsEditDialogOpen} open={isEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg tracking-tight">
              Edit Partner
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Update {selectedDonor?.name}&apos;s information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              className="space-y-6 py-4"
              onSubmit={editForm.handleSubmit(handleSaveEdit)}
            >
              <div className="space-y-4">
                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Individual">
                              Individual
                            </SelectItem>
                            <SelectItem value="Church">Church</SelectItem>
                            <SelectItem value="Organization">
                              Organization
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Lapsed">Lapsed</SelectItem>
                            <SelectItem value="At Risk">At Risk</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Primary Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Mobile / Text
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="work_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Work Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="preferred_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Preferred Contact
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Website
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                  Address
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Street Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="street2"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Apt, Suite, etc.
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          City
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                            State
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                            ZIP
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={editForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Display Location (e.g. Denver, CO)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City, State"
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                  Personal Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Organization
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Title / Role
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="spouse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Spouse
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Birthday
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                            type="date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="anniversary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                          Anniversary
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                            type="date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                      Internal Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[100px] resize-none rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 pt-4 sm:gap-0">
                <Button
                  className="h-10 rounded-xl border-zinc-200 px-6"
                  onClick={() => setIsEditDialogOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="h-10 rounded-xl px-6"
                  disabled={isSavingEdit}
                  type="submit"
                >
                  {isSavingEdit ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function DonorsPageView() {
  return useDonorsPageLayout();
}

export default function DonorsPage() {
  return <DonorsPageView />;
}
