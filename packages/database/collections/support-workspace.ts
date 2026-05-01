export type SupportQueueId =
  | "donor_care"
  | "missionary_support"
  | "mobilization";

export type SupportTicketStatus = "open" | "waiting" | "resolved" | "escalated";

export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";

export type SupportTicketChannel = "email" | "chat" | "form" | "phone";

export interface SupportQueue {
  id: SupportQueueId;
  label: string;
  description: string;
}

export interface SupportContact {
  id: string;
  name: string;
  email: string;
  relationship: string;
  organization?: string;
  lastSeenAt: string;
  givingSummary?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  contactId: string;
  contactEmail?: string;
  contactName?: string;
  queueId: SupportQueueId;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  channel: SupportTicketChannel;
  followUpAt?: string;
  updatedAt: string;
  summary: string;
  tags: string[];
  assignedTo?: string;
}

export interface SupportMacro {
  id: string;
  title: string;
  queueId: SupportQueueId;
  preview: string;
}

export interface SupportKnowledgeEntry {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  summary: string;
}

export interface SupportHubReadModel {
  generatedAt: string;
  queues: SupportQueue[];
  tickets: SupportTicket[];
  contacts: SupportContact[];
  macros: SupportMacro[];
  knowledge: SupportKnowledgeEntry[];
}

export const supportHubReadModel: SupportHubReadModel = {
  generatedAt: "2026-04-30T15:00:00.000Z",
  queues: [
    {
      id: "donor_care",
      label: "Donor Care",
      description: "Giving, receipts, account, and donor technical support",
    },
    {
      id: "mobilization",
      label: "Mobilization / Interested in Joining",
      description: "Candidate, church partner, and opportunity exploration",
    },
    {
      id: "missionary_support",
      label: "Existing Missionary Support",
      description:
        "Admin, technical, and support requests from current missionaries",
    },
  ],
  tickets: [
    {
      id: "SUP-1042",
      subject: "Receipt missing for March recurring gift",
      contactId: "contact-maria",
      queueId: "donor_care",
      status: "open",
      priority: "urgent",
      channel: "email",
      followUpAt: "2026-04-30T14:45:00.000Z",
      updatedAt: "2026-04-30T13:30:00.000Z",
      summary:
        "Donor needs a receipt before tonight's board packet is finalized.",
      tags: ["receipt", "recurring-gift", "board-report"],
      assignedTo: "Maya",
    },
    {
      id: "SUP-1041",
      subject: "Field worker profile image will not crop correctly",
      contactId: "contact-joseph",
      queueId: "missionary_support",
      status: "waiting",
      priority: "normal",
      channel: "chat",
      followUpAt: "2026-04-30T15:25:00.000Z",
      updatedAt: "2026-04-30T14:10:00.000Z",
      summary:
        "Existing missionary uploaded a new profile photo, but the cropper rejects the file.",
      tags: ["profile", "image-upload"],
      assignedTo: "Jon",
    },
    {
      id: "SUP-1040",
      subject: "Escalate pledge allocation for partner church",
      contactId: "contact-grace",
      queueId: "donor_care",
      status: "escalated",
      priority: "high",
      channel: "email",
      followUpAt: "2026-04-30T15:08:00.000Z",
      updatedAt: "2026-04-30T14:35:00.000Z",
      summary:
        "Church pledge was allocated to the general fund instead of a specific worker.",
      tags: ["pledge", "allocation", "church"],
      assignedTo: "Priya",
    },
    {
      id: "SUP-1039",
      subject: "Existing missionary needs admin reimbursement help",
      contactId: "contact-ethan",
      queueId: "missionary_support",
      status: "open",
      priority: "high",
      channel: "form",
      followUpAt: "2026-04-30T16:10:00.000Z",
      updatedAt: "2026-04-30T13:50:00.000Z",
      summary:
        "Existing missionary is asking how to upload receipts for a field expense reimbursement.",
      tags: ["reimbursement", "admin"],
      assignedTo: "Alina",
    },
    {
      id: "SUP-1038",
      subject: "New church partner wants onboarding next steps",
      contactId: "contact-newlife",
      queueId: "mobilization",
      status: "open",
      priority: "normal",
      channel: "phone",
      followUpAt: "2026-04-30T17:00:00.000Z",
      updatedAt: "2026-04-30T12:25:00.000Z",
      summary:
        "Pastor requested next steps for exploring missionary opportunities and partnership.",
      tags: ["church", "onboarding"],
      assignedTo: "Ben",
    },
    {
      id: "SUP-1037",
      subject: "Donor dashboard question",
      contactId: "contact-lena",
      queueId: "donor_care",
      status: "resolved",
      priority: "low",
      channel: "form",
      followUpAt: "2026-04-30T17:30:00.000Z",
      updatedAt: "2026-04-29T20:10:00.000Z",
      summary: "Question answered with a dashboard documentation link.",
      tags: ["docs", "dashboard"],
      assignedTo: "Maya",
    },
  ],
  contacts: [
    {
      id: "contact-maria",
      name: "Maria Chen",
      email: "maria.chen@example.org",
      relationship: "Major donor",
      organization: "Chen Family Foundation",
      lastSeenAt: "2026-04-30T13:22:00.000Z",
      givingSummary: "$18.4k lifetime giving",
    },
    {
      id: "contact-joseph",
      name: "Joseph Okafor",
      email: "joseph.okafor@example.org",
      relationship: "Missionary",
      organization: "Nairobi Field Team",
      lastSeenAt: "2026-04-30T14:06:00.000Z",
      givingSummary: "82% monthly support raised",
    },
    {
      id: "contact-grace",
      name: "Grace Community Church",
      email: "ops@grace.example.org",
      relationship: "Church partner",
      organization: "Grace Community Church",
      lastSeenAt: "2026-04-30T14:30:00.000Z",
      givingSummary: "$42k annual pledge",
    },
    {
      id: "contact-ethan",
      name: "Ethan Brooks",
      email: "ethan.brooks@example.org",
      relationship: "Regional lead",
      organization: "Asia Pacific",
      lastSeenAt: "2026-04-30T13:42:00.000Z",
    },
    {
      id: "contact-lena",
      name: "Lena Ortiz",
      email: "lena.ortiz@example.org",
      relationship: "Recurring donor",
      organization: "Individual partner",
      lastSeenAt: "2026-04-29T20:10:00.000Z",
      givingSummary: "$125 monthly support",
    },
  ],
  macros: [
    {
      id: "macro-receipt",
      title: "Receipt resend with tax language",
      queueId: "donor_care",
      preview:
        "Thanks for your patience. I found the gift and resent the receipt to the email on file.",
    },
    {
      id: "macro-profile-image",
      title: "Profile image troubleshooting",
      queueId: "missionary_support",
      preview:
        "Please try a square JPG under 5MB. If it still fails, send the file and support will crop it for you.",
    },
    {
      id: "macro-church-onboarding",
      title: "Church partner onboarding checklist",
      queueId: "mobilization",
      preview:
        "Here are the three next steps for launching your church partnership with GiveHope.",
    },
  ],
  knowledge: [
    {
      id: "kb-receipts",
      title: "Donation receipt resend workflow",
      category: "Donor Care",
      updatedAt: "2026-04-26T17:00:00.000Z",
      summary:
        "How to verify gift status, resend receipts, and document donor-visible tax language.",
    },
    {
      id: "kb-profile-media",
      title: "Profile media upload requirements",
      category: "Existing Missionary Support",
      updatedAt: "2026-04-25T12:30:00.000Z",
      summary:
        "Supported image formats, crop constraints, and staff override steps.",
    },
    {
      id: "kb-care-benefits",
      title: "Existing missionary admin support requests",
      category: "Existing Missionary Support",
      updatedAt: "2026-04-18T09:20:00.000Z",
      summary:
        "How current missionaries request help with admin, profile, technical, and reimbursement issues.",
    },
  ],
};
