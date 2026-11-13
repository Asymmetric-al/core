export type CarePriority = "Healthy" | "Needs Attention" | "At Risk" | "Crisis";

export type ActivityType =
  | "Video Call"
  | "In-Person Visit"
  | "Check-in"
  | "Pastoral Note"
  | "Care Plan Update"
  | "Crisis Intervention"
  | "Birthday"
  | "Prayer Request";

export interface CarePersonnel {
  id: string;
  name: string;
  nameMissing?: boolean;
  location: string;
  timezone: string;
  status: CarePriority;
  lastCheckIn: string | null;
  birthDate?: string;
  nextScheduledCheckIn?: string;
  initials: string;
  avatarUrl?: string;
  role: string;
  region:
    | "Africa"
    | "SE Asia"
    | "Europe"
    | "Latin America"
    | "Middle East"
    | "North America";
  healthSignals: {
    emotional: number | null;
    spiritual: number | null;
    physical: number | null;
    financial: number | null;
  };
  careGaps: string[];
  manualAttention?: boolean;
}

export interface ActivityLogEntry {
  kind?: "thread" | "activity";
  id: string;
  personnelId: string;
  type: ActivityType;
  content: string;
  date: string;
  authorId: string;
  authorName: string;
  isPrivate: boolean;
  threadId?: string;
}
