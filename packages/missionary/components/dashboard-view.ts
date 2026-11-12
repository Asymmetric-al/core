import { moneyProgress } from "./money-units";

import type { MissionaryPortalSnapshot } from "@asym/database/hooks";

/**
 * Pure presenter for the missionary dashboard home. Selects REAL values from
 * the (already server-redacted) portal snapshot — no mock fallbacks, no
 * hardcoded support figures. An absent snapshot yields empty selections so the
 * component can render honest empty states instead of fake numbers.
 */

export interface DashboardSupportView {
  goalCents: number | null;
  goalCurrency: string | null;
  monthlyCommittedCurrency: string | null;
  /** Active recurring pledges, normalised to a month. */
  monthlyCommittedCents: number | null;
  remainingCents: number | null;
  percentFunded: number | null;
  giftCount: number;
  activeDonorCount: number;
  hasGoal: boolean;
}

export interface DashboardUpdateView {
  id: string;
  title: string;
  content: string;
  createdAt: string | null;
}

export interface DashboardTaskView {
  id: string;
  title: string;
  priority: string;
  dueDate: string | null;
  /** Due before today (local calendar day). */
  overdue: boolean;
}

export interface DashboardAlertView {
  id: string;
  text: string;
  severity: "high" | "medium";
}

interface MissionaryDashboardView {
  support: DashboardSupportView | null;
  updates: DashboardUpdateView[];
  pendingTasks: DashboardTaskView[];
  alerts: DashboardAlertView[];
}

/** A YYYY-MM-DD (or ISO) due date as a local calendar day. */
function localDay(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function isOverdue(dueDate: string | null, now: Date): boolean {
  if (!dueDate) return false;
  const due = localDay(dueDate);
  if (!due) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return due.getTime() < today.getTime();
}

/** Task statuses that no longer need doing: completed or set aside. */
const CLOSED_TASK_STATUSES = new Set(["completed", "deferred"]);

export function buildMissionaryDashboardView(
  snapshot: MissionaryPortalSnapshot | undefined | null,
  now: Date = new Date(),
): MissionaryDashboardView {
  const rawSupport = snapshot?.support ?? null;
  const progress = rawSupport
    ? moneyProgress(
        rawSupport.recurringMonthlyCents,
        rawSupport.recurringCurrency,
        rawSupport.goalCents,
        rawSupport.goalCurrency,
      )
    : null;
  const support: DashboardSupportView | null = rawSupport
    ? {
        goalCents: rawSupport.goalCents,
        goalCurrency: rawSupport.goalCurrency,
        monthlyCommittedCurrency: rawSupport.recurringCurrency,
        monthlyCommittedCents: rawSupport.recurringMonthlyCents,
        remainingCents: progress?.remaining ?? null,
        percentFunded: progress?.percent ?? null,
        giftCount: rawSupport.giftCount,
        activeDonorCount: rawSupport.activeDonorCount,
        hasGoal: progress !== null,
      }
    : null;

  const updates: DashboardUpdateView[] = (snapshot?.ministryUpdates ?? []).map(
    (update) => ({
      id: String(update.id),
      title: update.title,
      content: update.excerpt,
      createdAt: update.createdAt,
    }),
  );

  const pendingTasks: DashboardTaskView[] = (snapshot?.tasks ?? []).flatMap(
    (task) =>
      CLOSED_TASK_STATUSES.has(task.status)
        ? []
        : [
            {
              id: String(task.id),
              title: task.title,
              priority: task.priority ?? "none",
              dueDate: task.due_date ?? null,
              overdue: isOverdue(task.due_date ?? null, now),
            },
          ],
  );

  const alerts: DashboardAlertView[] = [];
  if (pendingTasks.length > 0) {
    const overdue = pendingTasks.filter((task) => task.overdue).length;
    const open = `${pendingTasks.length} open ${pendingTasks.length === 1 ? "task" : "tasks"}`;
    alerts.push(
      overdue > 0
        ? {
            id: "tasks",
            text: `${overdue} of ${open} ${overdue === 1 ? "is" : "are"} overdue`,
            severity: "high",
          }
        : { id: "tasks", text: open, severity: "medium" },
    );
  }

  return { support, updates, pendingTasks, alerts };
}
