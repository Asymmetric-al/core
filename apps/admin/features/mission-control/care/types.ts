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
  location: string;
  timezone: string;
  status: CarePriority;
  lastCheckIn: string;
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
    emotional: number; // 0-100
    spiritual: number;
    physical: number;
    financial: number;
  };
  careGaps: string[];
  manualAttention?: boolean;
}

export interface ActivityLogEntry {
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

export interface CareThread {
  id: string;
  personnelId: string;
  title: string;
  status: "Open" | "Resolved";
  lastActivity: string;
  entries: ActivityLogEntry[];
}

export interface CarePlan {
  id: string;
  personnelId: string;
  title: string;
  objectives: string[];
  status: "Active" | "Completed" | "Archived";
  startDate: string;
  endDate?: string;
  reviewDate?: string;
}

export interface HeatmapData {
  date: string;
  intensity: number; // 0-4
  type: ActivityType;
}

export interface CareSettings {
  defaultRegion?: string;
  localTimezone: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    atRiskOnly: boolean;
  };
  integrations: {
    googleCalendar: boolean;
    calCom: boolean;
  };
}
