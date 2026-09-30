export type ActivityType =
  | "gift"
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "pledge_started"
  | "pledge_completed";

export type GiftType =
  | "Online"
  | "Check"
  | "Cash"
  | "Bank Transfer"
  | "Stock"
  | "In-Kind";

export type RecurringStatus = "active" | "completed" | "paused" | "cancelled";

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  description?: string;
  amount?: number;
  status?: string;
  gift_type?: GiftType;
  note?: string;
}

export interface RecurringDonation {
  id: string;
  amount: number;
  frequency: string;
  status: RecurringStatus;
  start_date: string;
  end_date?: string;
  next_payment_date?: string;
  total_paid: number;
  total_expected: number;
  payments_completed: number;
  payments_remaining: number;
  payment_method?: string;
}

export interface Address {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface Donor {
  id: string;
  name: string;
  initials: string;
  type: "Individual" | "Organization" | "Church";
  status: "Active" | "Lapsed" | "New" | "At Risk";
  total_given: number;
  last_gift_date: string | null;
  last_gift_amount: number | null;
  frequency: string;
  email: string;
  phone: string;
  mobile?: string;
  work_phone?: string;
  preferred_contact: "email" | "phone" | "text";
  avatar_url?: string;
  location: string;
  address: Address;
  work_address?: Address;
  website?: string;
  organization?: string;
  title?: string;
  joined_date: string;
  birthday?: string;
  anniversary?: string;
  spouse?: string;
  notes?: string;
  tags: string[];
  score: number;
  activities: Activity[];
  recurring_donations: RecurringDonation[];
  has_active_pledge: boolean;
  /** True when the row is redacted because the donor is anonymous to this missionary. */
  is_anonymous?: boolean;
}
