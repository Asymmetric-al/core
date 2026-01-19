export type Stage = "New" | "Contacted" | "Meeting" | "Proposal" | "Won";

export interface Activity {
  id: string;
  type: "note" | "call" | "email" | "meeting" | "stage_change" | "gift";
  date: string;
  title: string;
  description?: string;
  amount?: number;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: Stage;
  owner: string;
  lastActivity: string;
  tags: string[];
  city: string;
  bio: string;
  activities: Activity[];
}

export const STAGES: Stage[] = [
  "New",
  "Contacted",
  "Meeting",
  "Proposal",
  "Won",
];

export const STAGE_COLORS: Record<Stage, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/50 dark:text-blue-400",
  Contacted:
    "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400",
  Meeting:
    "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/50 dark:text-amber-400",
  Proposal:
    "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/50 dark:text-purple-400",
  Won: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400",
};
