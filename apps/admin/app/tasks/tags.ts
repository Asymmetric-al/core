export interface TaskTag {
  id: string;
  label: string;
  color: string;
  category: TagCategory;
}

export type TagCategory =
  | "donor-relations"
  | "missionary-care"
  | "fundraising"
  | "events"
  | "communications"
  | "administrative"
  | "spiritual"
  | "reporting"
  | "mobilization"
  | "logistics"
  | "strategy";

export const TAG_CATEGORIES: { value: TagCategory; label: string }[] = [
  { value: "donor-relations", label: "Donor Relations" },
  { value: "missionary-care", label: "Missionary Care" },
  { value: "fundraising", label: "Fundraising" },
  { value: "events", label: "Events" },
  { value: "communications", label: "Communications" },
  { value: "administrative", label: "Administrative" },
  { value: "spiritual", label: "Spiritual" },
  { value: "reporting", label: "Reporting" },
  { value: "mobilization", label: "Mobilization" },
  { value: "logistics", label: "Logistics" },
  { value: "strategy", label: "Strategy" },
];

export const DEFAULT_TASK_TAGS: TaskTag[] = [
  // Donor Relations
  {
    id: "major-donor",
    label: "Major Donor",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    category: "donor-relations",
  },
  {
    id: "new-donor",
    label: "New Donor",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    category: "donor-relations",
  },
  {
    id: "lapsed-donor",
    label: "Lapsed Donor",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    category: "donor-relations",
  },
  {
    id: "stewardship",
    label: "Stewardship",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    category: "donor-relations",
  },
  {
    id: "thank-you",
    label: "Thank You",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
    category: "donor-relations",
  },
  {
    id: "planned-giving",
    label: "Planned Giving",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    category: "donor-relations",
  },
  {
    id: "corporate-partner",
    label: "Corporate Partner",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    category: "donor-relations",
  },
  {
    id: "church-partner",
    label: "Church Partner",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    category: "donor-relations",
  },
  {
    id: "foundation",
    label: "Foundation",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    category: "donor-relations",
  },

  // Missionary Care
  {
    id: "onboarding",
    label: "Onboarding",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    category: "missionary-care",
  },
  {
    id: "new-member",
    label: "New Member",
    color: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
    category: "missionary-care",
  },
  {
    id: "support-raising",
    label: "Support Raising",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    category: "missionary-care",
  },
  {
    id: "deputation",
    label: "Deputation",
    color:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    category: "missionary-care",
  },
  {
    id: "field-transition",
    label: "Field Transition",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    category: "missionary-care",
  },
  {
    id: "home-assignment",
    label: "Home Assignment",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    category: "missionary-care",
  },
  {
    id: "member-care",
    label: "Member Care",
    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    category: "missionary-care",
  },
  {
    id: "crisis-response",
    label: "Crisis Response",
    color: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200",
    category: "missionary-care",
  },
  {
    id: "training",
    label: "Training",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
    category: "missionary-care",
  },

  // Fundraising
  {
    id: "campaign",
    label: "Campaign",
    color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    category: "fundraising",
  },
  {
    id: "year-end",
    label: "Year-End",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    category: "fundraising",
  },
  {
    id: "grant",
    label: "Grant",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    category: "fundraising",
  },
  {
    id: "matching-gift",
    label: "Matching Gift",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    category: "fundraising",
  },
  {
    id: "appeal",
    label: "Appeal",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    category: "fundraising",
  },
  {
    id: "pledge",
    label: "Pledge",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    category: "fundraising",
  },
  {
    id: "recurring",
    label: "Recurring",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    category: "fundraising",
  },

  // Events
  {
    id: "gala",
    label: "Gala",
    color:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    category: "events",
  },
  {
    id: "banquet",
    label: "Banquet",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    category: "events",
  },
  {
    id: "conference",
    label: "Conference",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    category: "events",
  },
  {
    id: "mission-trip",
    label: "Mission Trip",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    category: "events",
  },
  {
    id: "short-term",
    label: "Short-Term",
    color: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
    category: "events",
  },
  {
    id: "webinar",
    label: "Webinar",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    category: "events",
  },
  {
    id: "prayer-meeting",
    label: "Prayer Meeting",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    category: "events",
  },

  // Communications
  {
    id: "newsletter",
    label: "Newsletter",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    category: "communications",
  },
  {
    id: "social-media",
    label: "Social Media",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
    category: "communications",
  },
  {
    id: "prayer-letter",
    label: "Prayer Letter",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    category: "communications",
  },
  {
    id: "video",
    label: "Video",
    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    category: "communications",
  },
  {
    id: "testimony",
    label: "Testimony",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    category: "communications",
  },
  {
    id: "annual-report",
    label: "Annual Report",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    category: "communications",
  },

  // Administrative
  {
    id: "compliance",
    label: "Compliance",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    category: "administrative",
  },
  {
    id: "legal",
    label: "Legal",
    color: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    category: "administrative",
  },
  {
    id: "tax-receipt",
    label: "Tax Receipt",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    category: "administrative",
  },
  {
    id: "audit",
    label: "Audit",
    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    category: "administrative",
  },
  {
    id: "visa",
    label: "Visa",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    category: "administrative",
  },
  {
    id: "insurance",
    label: "Insurance",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    category: "administrative",
  },
  {
    id: "background-check",
    label: "Background Check",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    category: "administrative",
  },
  {
    id: "safeguarding",
    label: "Safeguarding",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
    category: "administrative",
  },

  // Spiritual
  {
    id: "prayer-request",
    label: "Prayer Request",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    category: "spiritual",
  },
  {
    id: "praise-report",
    label: "Praise Report",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
    category: "spiritual",
  },
  {
    id: "discipleship",
    label: "Discipleship",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    category: "spiritual",
  },
  {
    id: "pastoral",
    label: "Pastoral",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    category: "spiritual",
  },
  {
    id: "counseling",
    label: "Counseling",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    category: "spiritual",
  },

  // Reporting
  {
    id: "board",
    label: "Board",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    category: "reporting",
  },
  {
    id: "quarterly",
    label: "Quarterly",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    category: "reporting",
  },
  {
    id: "annual",
    label: "Annual",
    color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    category: "reporting",
  },
  {
    id: "metrics",
    label: "Metrics",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    category: "reporting",
  },
  {
    id: "impact",
    label: "Impact",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    category: "reporting",
  },

  // Mobilization
  {
    id: "mobilization",
    label: "Mobilization",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    category: "mobilization",
  },
  {
    id: "student-mission",
    label: "Student Mission",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    category: "mobilization",
  },
  {
    id: "recruitment",
    label: "Recruitment",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    category: "mobilization",
  },
  {
    id: "candidate",
    label: "Candidate",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    category: "mobilization",
  },

  // Logistics
  {
    id: "visa-renewal",
    label: "Visa Renewal",
    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    category: "logistics",
  },
  {
    id: "travel-prep",
    label: "Travel Prep",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    category: "logistics",
  },
  {
    id: "site-visit",
    label: "Site Visit",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    category: "logistics",
  },
  {
    id: "deployment",
    label: "Deployment",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    category: "logistics",
  },
  {
    id: "shipping",
    label: "Shipping",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    category: "logistics",
  },

  // Strategy
  {
    id: "strategic-plan",
    label: "Strategic Plan",
    color:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    category: "strategy",
  },
  {
    id: "goal-setting",
    label: "Goal Setting",
    color: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
    category: "strategy",
  },
  {
    id: "field-strategy",
    label: "Field Strategy",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    category: "strategy",
  },
  {
    id: "partnership-dev",
    label: "Partnership Dev",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    category: "strategy",
  },
];

export function getTagConfig(tagId: string): TaskTag | undefined {
  return DEFAULT_TASK_TAGS.find((t) => t.id === tagId);
}

export function getTagsByCategory(category: TagCategory): TaskTag[] {
  return DEFAULT_TASK_TAGS.filter((t) => t.category === category);
}
