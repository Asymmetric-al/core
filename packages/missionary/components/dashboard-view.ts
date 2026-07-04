import type { MissionaryPortalSnapshot } from "@asym/database/hooks";

/**
 * Pure presenter for the missionary dashboard home. Selects REAL values from
 * the (already server-redacted) portal snapshot — no mock fallbacks, no
 * hardcoded support figures. An absent snapshot yields empty selections so the
 * component can render honest empty states instead of fake numbers.
 */

export interface DashboardSupportView {
  goalCents: number;
  raisedCents: number;
  remainingCents: number;
  percentFunded: number;
  giftCount: number;
  activeDonorCount: number;
  hasGoal: boolean;
}

export interface DashboardUpdateView {
  id: string;
  content: string;
  createdAt: string | null;
}

export interface DashboardTaskView {
  id: string;
  title: string;
  priority: string;
  dueDate: string | null;
}

export interface DashboardAlertView {
  id: string;
  text: string;
  severity: "high" | "medium";
}

export interface MissionaryDashboardView {
  support: DashboardSupportView | null;
  updates: DashboardUpdateView[];
  pendingTasks: DashboardTaskView[];
  alerts: DashboardAlertView[];
}

export function buildMissionaryDashboardView(
  snapshot: MissionaryPortalSnapshot | undefined | null,
): MissionaryDashboardView {
  const rawSupport = snapshot?.support ?? null;
  const support: DashboardSupportView | null = rawSupport
    ? {
        goalCents: rawSupport.goalCents,
        raisedCents: rawSupport.raisedCents,
        remainingCents: Math.max(0, rawSupport.goalCents - rawSupport.raisedCents),
        percentFunded: rawSupport.percentFunded,
        giftCount: rawSupport.giftCount,
        activeDonorCount: rawSupport.activeDonorCount,
        hasGoal: rawSupport.goalCents > 0,
      }
    : null;

  const updates: DashboardUpdateView[] = (snapshot?.ministryUpdates ?? []).map(
    (update) => ({
      id: String(update.id),
      content: update.excerpt,
      createdAt: update.createdAt,
    }),
  );

  const pendingTasks: DashboardTaskView[] = (snapshot?.tasks ?? [])
    .filter((task) => task.status !== "completed")
    .map((task) => ({
      id: String(task.id),
      title: task.title,
      priority: task.priority ?? "none",
      dueDate: task.due_date ?? null,
    }));

  const alerts: DashboardAlertView[] = [];
  if (pendingTasks.length > 0) {
    const noun = pendingTasks.length === 1 ? "task needs" : "tasks need";
    alerts.push({
      id: "tasks",
      text: `${pendingTasks.length} support ${noun} attention`,
      severity: "high",
    });
  }
  if (support && support.activeDonorCount > 0) {
    alerts.push({
      id: "donors",
      text: `${support.activeDonorCount} active donor relationships`,
      severity: "medium",
    });
  }

  return { support, updates, pendingTasks, alerts };
}
