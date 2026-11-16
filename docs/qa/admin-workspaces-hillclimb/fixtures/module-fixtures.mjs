// Browser API fixtures for the Mission Control modules beyond CRM and
// Contributions: Member Care, Locations, Workflows, Support Hub, Eve,
// Automations, Reports, Email delivery (Resend), Email Studio and PDF Studio.
//
// Plain Node ESM. Register AFTER installApiFixtures (Playwright consults the
// last route first); anything not handled here falls back to it, so gaps stay
// visible as "fixture missing". Shapes follow the client parsers named in
// docs/qa/admin-workspaces-hillclimb/run.md (phase 2 inventory). Every name,
// email (example.org) and amount is fictional. Times are relative to "now"
// so both versions captured minutes apart read the same ("2 hours ago").

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (offsetMs) => new Date(Date.now() + offsetMs).toISOString();
const dateOnly = (offsetMs) => iso(offsetMs).slice(0, 10);
const TENANT = "11111111-1111-4111-8111-111111111111";

// ---------------------------------------------------------------- care ----

const PERSONNEL = [
  [
    "Grace Mwangi",
    "Nairobi, Kenya",
    "Africa/Nairobi",
    "Needs Attention",
    34,
    "Field nurse",
    "Africa",
    [72, 85, 60, 45],
    ["Quarterly video call overdue"],
    9,
  ],
  [
    "Daniel Okafor",
    "Lagos, Nigeria",
    "Africa/Lagos",
    "Healthy",
    6,
    "Church planter",
    "Africa",
    [88, 90, 82, 76],
    [],
    null,
  ],
  [
    "Priya Raman",
    "Chiang Mai, Thailand",
    "Asia/Bangkok",
    "At Risk",
    41,
    "Teacher",
    "SE Asia",
    [48, 70, 55, 40],
    ["Debrief after evacuation", "Counselling referral"],
    null,
  ],
  [
    "Mateo Alvarez",
    "Quito, Ecuador",
    "America/Guayaquil",
    "Healthy",
    3,
    "Radio producer",
    "Latin America",
    [91, 86, 88, 80],
    [],
    26,
  ],
  [
    "Hannah Lindqvist",
    "Tirana, Albania",
    "Europe/Tirane",
    "Healthy",
    12,
    "Youth worker",
    "Europe",
    [80, 84, 79, 70],
    [],
    null,
  ],
  [
    "Samuel Osei",
    "Amman, Jordan",
    "Asia/Amman",
    "Crisis",
    2,
    "Relief coordinator",
    "Middle East",
    [30, 52, 41, 38],
    ["Security incident follow-up", "Family check-in"],
    null,
  ],
  [
    "Leah Park",
    "Phnom Penh, Cambodia",
    "Asia/Phnom_Penh",
    "Needs Attention",
    22,
    "Medical doctor",
    "SE Asia",
    [66, 74, 58, 61],
    ["Visa renewal support"],
    4,
  ],
  [
    "Joel Martins",
    "Maputo, Mozambique",
    "Africa/Maputo",
    "Healthy",
    9,
    "Agriculture trainer",
    "Africa",
    [82, 80, 85, 72],
    [],
    null,
  ],
  [
    "Ruth Mbeki",
    "Toronto, Canada",
    "America/Toronto",
    "Healthy",
    15,
    "Home assignment",
    "North America",
    [78, 88, 83, 69],
    [],
    null,
  ],
  [
    "Isabel Cruz",
    "Lima, Peru",
    "America/Lima",
    "At Risk",
    47,
    "Bible translator",
    "Latin America",
    [52, 66, 59, 44],
    ["Burnout screening", "Sabbatical planning"],
    null,
  ],
  [
    "Tomas Novak",
    "Prague, Czechia",
    "Europe/Prague",
    "Healthy",
    18,
    "Student ministry",
    "Europe",
    [84, 77, 81, 74],
    [],
    null,
  ],
  [
    "Esther Haddad",
    "Beirut, Lebanon",
    "Asia/Beirut",
    "Needs Attention",
    29,
    "Trauma counsellor",
    "Middle East",
    [61, 72, 64, 50],
    ["Housing move support"],
    null,
  ],
].map(
  (
    [
      name,
      location,
      timezone,
      status,
      daysSinceCheckIn,
      role,
      region,
      signals,
      careGaps,
      birthdayInDays,
    ],
    index,
  ) => {
    const id = `9a0c1e00-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
    const birth =
      birthdayInDays === null
        ? undefined
        : (() => {
            const date = new Date(Date.now() + birthdayInDays * DAY);
            return `1987-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          })();
    return {
      id,
      name,
      location,
      timezone,
      status,
      lastCheckIn: dateOnly(-daysSinceCheckIn * DAY),
      initials: name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2),
      role,
      region,
      healthSignals: {
        emotional: signals[0],
        spiritual: signals[1],
        physical: signals[2],
        financial: signals[3],
      },
      careGaps,
      manualAttention: status === "Crisis",
      ...(birth ? { birthDate: birth } : {}),
    };
  },
);

const CARE_TYPES = [
  "Video Call",
  "Check-in",
  "Pastoral Note",
  "Care Plan Update",
  "In-Person Visit",
  "Prayer Request",
];
const CARE_AUTHORS = [
  ["c1", "Naomi Ellis"],
  ["c2", "David Ross"],
  ["c3", "Miriam Cole"],
];
const CARE_ACTIVITIES = PERSONNEL.flatMap((person, index) =>
  [0, 1, 2].map((step) => {
    const [authorId, authorName] =
      CARE_AUTHORS[(index + step) % CARE_AUTHORS.length];
    const type = CARE_TYPES[(index + step) % CARE_TYPES.length];
    return {
      id: `${person.id}-a${step}`,
      personnelId: person.id,
      type,
      content: `<p>${type} with ${person.name.split(" ")[0]}: ${["shared prayer needs and ministry updates", "reviewed the care plan and next steps", "talked through rest, family and team dynamics"][step]}.</p>`,
      // The newest activity is the person's last check-in; older ones before it.
      date: iso(
        -(
          Math.round(
            (Date.now() - Date.parse(`${person.lastCheckIn}T12:00:00Z`)) / DAY,
          ) +
          step * 11
        ) * DAY,
      ),
      authorId,
      authorName,
      isPrivate: false,
    };
  }),
);

function careDetail(id) {
  const personnel = PERSONNEL.find((person) => person.id === id) ?? null;
  return {
    personnel,
    activities: CARE_ACTIVITIES.filter(
      (activity) => activity.personnelId === id,
    ),
    privateNotes: personnel
      ? [
          {
            id: `${id}-n1`,
            personnelId: id,
            content:
              "<p>Asked for prayer about a family health matter; follow up next call.</p>",
            date: iso(-5 * DAY),
            authorId: "c2",
            authorName: "David Ross",
          },
        ]
      : [],
    goals: [],
    requirements: [],
  };
}

// ----------------------------------------------------------- locations ----

const LOCATIONS = [
  [
    "Kibera Health Clinic",
    -1.3133,
    36.7876,
    "project",
    "Primary care and maternal health in Nairobi.",
    "published",
  ],
  [
    "Quito Radio Studio",
    -0.1807,
    -78.4678,
    "project",
    "Community radio and training hub.",
    "published",
  ],
  [
    "Chiang Mai Learning Center",
    18.7883,
    98.9853,
    "project",
    "After-school tutoring for hill-tribe students.",
    "published",
  ],
  [
    "Grace Mwangi",
    -1.2921,
    36.8219,
    "missionary",
    "Field nurse serving Nairobi's informal settlements.",
    "published",
  ],
  [
    "Mateo Alvarez",
    -0.2295,
    -78.5243,
    "missionary",
    "Radio producer and trainer.",
    "published",
  ],
  [
    "Amman Relief Office",
    31.9539,
    35.9106,
    "project",
    "Refugee relief coordination.",
    "draft",
  ],
  [
    "Maputo Farm School",
    -25.9692,
    32.5732,
    "project",
    "Conservation farming for smallholders.",
    "published",
  ],
  [
    "Lima Translation Desk",
    -12.0464,
    -77.0428,
    "custom",
    "Quechua Bible translation team.",
    "published",
  ],
].map(([title, lat, lng, type, summary, status], index) => ({
  id: `4c1d2e00-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  tenant_id: TENANT,
  title,
  lat,
  lng,
  type,
  linked_id:
    type === "missionary"
      ? `5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a0${index}`
      : null,
  summary,
  image_public_id: null,
  status,
  sort_key: index,
  created_at: iso(-(120 - index) * DAY),
  updated_at: iso(-(index + 2) * DAY),
}));

// ----------------------------------------------------------- workflows ----

const WORKFLOW_SUMMARIES = [
  [
    "Giving",
    "Donation receipt",
    "donation",
    "retrying",
    2,
    "smtp_timeout",
    "urgent",
    "Retrying after a delivery timeout",
  ],
  // Held for routing review is only ever an inbound email (summaries.ts
  // loadInboundEmailOutcomes); the reason is the notification policy's.
  [
    "Support Hub",
    "Inbound email routing",
    "email_inbound_message",
    "action_required",
    1,
    null,
    "visible",
    "Held for routing review until an administrator routes it.",
  ],
  [
    "Member Care",
    "Check-in reminder",
    "missionary",
    "processing",
    1,
    null,
    "visible",
    "Running",
  ],
  [
    "Contributions",
    "Year-end statement",
    "donor",
    "completed",
    1,
    null,
    "visible",
    "Completed",
  ],
  [
    "Web Studio",
    "Publish giving page",
    "page",
    "completed",
    1,
    null,
    "visible",
    "Completed",
  ],
  [
    "Giving",
    "Refund notice",
    "donation",
    "failed",
    3,
    "provider_rejected",
    "urgent",
    "Provider rejected the refund",
  ],
  [
    "CRM",
    "Duplicate record review",
    "donor",
    "dispatching",
    0,
    null,
    "visible",
    "Queued",
  ],
].map(
  (
    [
      productArea,
      workflowName,
      subjectType,
      state,
      attempts,
      lastErrorCode,
      level,
      reason,
    ],
    index,
  ) => ({
    dispatchRequestId: `dr_${1000 + index}`,
    productArea,
    workflowName,
    subjectType,
    subjectId: `${subjectType}_${4200 + index}`,
    state,
    attempts,
    lastErrorCode,
    createdAt: iso(-(index * 3 + 1) * HOUR),
    notification: { level, reason },
  }),
);

// ------------------------------------------------------------- support ----

/** Staff accounts by role, as GET /api/admin/users?role=… returns them. */
const STAFF_ACCOUNTS = [
  {
    id: "8a1f4c2e-5b7d-4e9a-a3c1-2f6b8d0e4a11",
    full_name: "Naomi Achterberg",
    email: "naomi.achterberg@example.org",
    role: "super_admin",
  },
  {
    id: "3c9e7b15-0d42-4f8e-b6a7-91e2c5d8f302",
    full_name: "Joel Mwangi",
    email: "joel.mwangi@example.org",
    role: "super_admin",
  },
  {
    id: "5d2b8e41-7a19-4c63-9f0e-1b4a6c8d2e01",
    full_name: "Dana Reyes",
    email: "dana.reyes@example.org",
    role: "admin",
  },
  {
    id: "6e3c9f52-8b2a-4d74-a01f-2c5b7d9e3f02",
    full_name: "Samuel Okoro",
    email: "samuel.okoro@example.org",
    role: "staff",
  },
  {
    id: "7f4d0a63-9c3b-4e85-b12a-3d6c8e0f4a03",
    full_name: "Priya Nair",
    email: "priya.nair@example.org",
    role: "finance",
  },
  {
    id: "8a5e1b74-0d4c-4f96-c23b-4e7d9f1a5b04",
    full_name: "Hannah Weiss",
    email: "hannah.weiss@example.org",
    role: "fundraising",
  },
  {
    id: "9b6f2c85-1e5d-4a07-d34c-5f8e0a2b6c05",
    full_name: "Naomi Ellis",
    email: "naomi.ellis@example.org",
    role: "member_care",
  },
  {
    id: "0c7a3d96-2f6e-4b18-e45d-6a9f1b3c7d06",
    full_name: "David Ross",
    email: "david.ross@example.org",
    role: "member_care",
  },
  {
    id: "1d8b4ea7-3a7f-4c29-f56e-7b0a2c4d8e07",
    full_name: "Miriam Cole",
    email: "miriam.cole@example.org",
    role: "mobilizers",
  },
  {
    id: "2e9c5fb8-4b8a-4d3a-a67f-8c1b3d5e9f08",
    full_name: "Kwame Mensah",
    email: "kwame.mensah@example.org",
    role: "events",
  },
];

const tiptapDoc = (...paragraphs) =>
  JSON.stringify({
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  });

const MODERATION_POSTS = [
  {
    id: "0d000000-0000-4000-8000-000000000001",
    title: "Clinic opening day",
    content: tiptapDoc(
      "The new clinic in Kajiado opened its doors this morning. Forty families came through before noon.",
      "Thank you for praying us through the last permits.",
    ),
    post_type: "update",
    status: "published",
    visibility: "public",
    created_at: iso(-3 * HOUR),
    like_count: 24,
    prayer_count: 11,
    fires_count: 3,
    comment_count: 4,
    author: {
      full_name: "Grace Okafor",
      first_name: "Grace",
      last_name: "Okafor",
      avatar_url: null,
    },
  },
  {
    id: "0d000000-0000-4000-8000-000000000002",
    title: "Prayer for the team in Taichung",
    content:
      "Please pray for the English club launch next week and for visas to come through on time.",
    post_type: "prayer",
    status: "flagged",
    visibility: "supporters",
    created_at: iso(-20 * HOUR),
    like_count: 6,
    prayer_count: 19,
    fires_count: 0,
    comment_count: 2,
    author: {
      full_name: "Daniel Zhang",
      first_name: "Daniel",
      last_name: "Zhang",
      avatar_url: null,
    },
  },
  {
    id: "0d000000-0000-4000-8000-000000000003",
    title: "Year-end giving thank you",
    content: tiptapDoc(
      "Every gift this season went straight to the school build. Here is where it stands.",
    ),
    post_type: "update",
    status: "pending_review",
    visibility: "public",
    created_at: iso(-2 * DAY),
    like_count: 0,
    prayer_count: 0,
    fires_count: 0,
    comment_count: 0,
    author: {
      full_name: "Ruth Mbeki",
      first_name: "Ruth",
      last_name: "Mbeki",
      avatar_url: null,
    },
  },
  {
    id: "0d000000-0000-4000-8000-000000000004",
    title: null,
    content: "Back from the village trip. Photos coming soon.",
    post_type: "update",
    status: "hidden",
    visibility: "supporters",
    created_at: iso(-4 * DAY),
    like_count: 2,
    prayer_count: 0,
    fires_count: 0,
    comment_count: 1,
    author: {
      full_name: "Peter Novak",
      first_name: "Peter",
      last_name: "Novak",
      avatar_url: null,
    },
  },
  {
    id: "0d000000-0000-4000-8000-000000000005",
    title: "Wells completed in Kajiado",
    content: tiptapDoc(
      "Three wells are finished and tested. The water committee takes over maintenance next month.",
    ),
    post_type: "update",
    status: "published",
    visibility: "public",
    created_at: iso(-6 * DAY),
    like_count: 41,
    prayer_count: 8,
    fires_count: 12,
    comment_count: 7,
    author: {
      full_name: "Grace Okafor",
      first_name: "Grace",
      last_name: "Okafor",
      avatar_url: null,
    },
  },
];

const MODERATION_COMMENTS = [
  {
    id: "0c000000-0000-4000-8000-000000000001",
    content: "So encouraging to see this. Praying for the clinic staff.",
    created_at: iso(-2 * HOUR),
    author: {
      full_name: "Olivia Chen",
      first_name: "Olivia",
      last_name: "Chen",
      avatar_url: null,
    },
  },
  {
    id: "0c000000-0000-4000-8000-000000000002",
    content: "Will the clinic be open on weekends?",
    created_at: iso(-5 * HOUR),
    author: {
      full_name: "Kenji Nakamura",
      first_name: "Kenji",
      last_name: "Nakamura",
      avatar_url: null,
    },
  },
  {
    id: "0c000000-0000-4000-8000-000000000003",
    content: "Our church is praying for the visas this Sunday.",
    created_at: iso(-18 * HOUR),
    author: {
      full_name: "Chloe Martin",
      first_name: "Chloe",
      last_name: "Martin",
      avatar_url: null,
    },
  },
];

const SUPPORT_AGENTS = [
  {
    id: "agent-1",
    name: "Dana Reyes",
    email: "dana.reyes@example.org",
    avatarUrl: null,
    title: "Donor care lead",
  },
  {
    id: "agent-2",
    name: "Marcus Hill",
    email: "marcus.hill@example.org",
    avatarUrl: null,
    title: "Donor care",
  },
  {
    id: "agent-3",
    name: "Aiko Tanaka",
    email: "aiko.tanaka@example.org",
    avatarUrl: null,
    title: "Mobilization",
  },
  {
    id: "agent-4",
    name: "Ruth Adeyemi",
    email: "ruth.adeyemi@example.org",
    avatarUrl: null,
    title: "Missionary support",
  },
];
const SUPPORT_TEAMS = [
  {
    id: "team-1",
    name: "Donor Care",
    slug: "donor-care",
    description: "Gifts, receipts and giving questions.",
    initials: "DC",
  },
  {
    id: "team-2",
    name: "Mobilization",
    slug: "mobilization",
    description: "Applicants and short-term trips.",
    initials: "MO",
  },
  {
    id: "team-3",
    name: "Missionary Support",
    slug: "missionary-support",
    description: "Field staff requests.",
    initials: "MS",
  },
];
const SUPPORT_LABELS = [
  ["Receipts", "receipts", "blue", "Receipt requests and corrections."],
  ["Recurring", "recurring", "violet", "Recurring gift changes."],
  ["Urgent", "urgent", "rose", "Needs a same-day answer."],
  ["Trips", "trips", "amber", "Short-term trip questions."],
  ["Address change", "address-change", "emerald", "Donor contact updates."],
  ["Prayer", "prayer", "zinc", "Prayer requests to pass on."],
].map(([name, slug, tone, description], index) => ({
  id: `label-${index + 1}`,
  tenantId: TENANT,
  name,
  slug,
  tone,
  description,
}));

const CONTACTS = [
  ["Maria Chen", "maria.chen@example.org"],
  ["Thomas Becker", "thomas.becker@example.org"],
  ["Olivia Grant", "olivia.grant@example.org"],
  ["Samuel Okoro", "samuel.okoro@example.org"],
  ["Hannah Weiss", "hannah.weiss@example.org"],
  ["Peter Novak", "peter.novak@example.org"],
  ["Alicia Romero", "alicia.romero@example.org"],
  ["Kwame Mensah", "kwame.mensah@example.org"],
  ["Laura Fischer", "laura.fischer@example.org"],
  ["Daniel Kim", "daniel.kim@example.org"],
  ["Sofia Rossi", "sofia.rossi@example.org"],
  ["Ethan Brooks", "ethan.brooks@example.org"],
  ["Grace Liu", "grace.liu@example.org"],
  ["Noah Patel", "noah.patel@example.org"],
];
const CONVERSATION_SPECS = [
  ["Receipt for my March gift", "open", "high", 0, 0, [0], 2 * HOUR, "inbound"],
  [
    "Update card on my monthly gift",
    "open",
    "normal",
    1,
    0,
    [1],
    5 * HOUR,
    "inbound",
  ],
  [
    "Trip dates for Ecuador team",
    "pending",
    "normal",
    2,
    1,
    [3],
    26 * HOUR,
    "outbound",
  ],
  ["Change of address", "open", "low", null, 0, [4], 50 * 60_000, "inbound"],
  [
    "Gift not showing in my history",
    "open",
    "urgent",
    0,
    0,
    [0, 2],
    30 * 60_000,
    "inbound",
  ],
  [
    "Prayer for Samuel's family",
    "resolved",
    "normal",
    3,
    2,
    [5],
    3 * DAY,
    "outbound",
  ],
  [
    "Year-end statement missing",
    "snoozed",
    "normal",
    1,
    0,
    [0],
    2 * DAY,
    "inbound",
  ],
  [
    "Visa letter for field staff",
    "open",
    "high",
    3,
    2,
    [],
    9 * HOUR,
    "inbound",
  ],
  ["Stop recurring gift", "pending", "high", 0, 0, [1], 20 * HOUR, "outbound"],
  ["Application status", "open", "normal", 2, 1, [], 3 * HOUR, "inbound"],
  ["Matching gift form", "resolved", "low", 1, 0, [0], 6 * DAY, "outbound"],
  [
    "Housing allowance question",
    "open",
    "normal",
    null,
    2,
    [],
    7 * HOUR,
    "inbound",
  ],
  [
    "Duplicate receipt emails",
    "open",
    "normal",
    0,
    0,
    [0],
    12 * HOUR,
    "inbound",
  ],
  [
    "Short-term trip fundraising page",
    "pending",
    "low",
    2,
    1,
    [3],
    4 * DAY,
    "outbound",
  ],
];
const CONVERSATIONS = CONVERSATION_SPECS.map(
  (
    [
      subject,
      status,
      priority,
      agentIndex,
      teamIndex,
      labelIndexes,
      ageMs,
      direction,
    ],
    index,
  ) => {
    const [name, email] = CONTACTS[index];
    const lastMessageAt = iso(-ageMs);
    const firstMessageAt = iso(-ageMs - 6 * HOUR);
    const pastDue = index === 4 || index === 7;
    return {
      id: `conv-${1001 + index}`,
      tenantId: TENANT,
      inboxId: teamIndex === 1 ? "inbox-2" : "inbox-1",
      subject,
      status,
      priority,
      channel: "email",
      assignee: agentIndex === null ? null : SUPPORT_AGENTS[agentIndex],
      team: SUPPORT_TEAMS[teamIndex],
      externalContactEmail: email,
      externalContactName: name,
      contact: {
        contactId: null,
        donorId: null,
        giftId: null,
        contributionId: null,
        missionaryId: null,
        crmPersonId: null,
        churchId: null,
      },
      labels: labelIndexes.map((labelIndex) => SUPPORT_LABELS[labelIndex]),
      unreadCount: direction === "inbound" && status === "open" ? 1 : 0,
      messageCount: 2 + (index % 3),
      firstMessageAt,
      lastMessageAt,
      lastCustomerMessageAt:
        direction === "inbound" ? lastMessageAt : firstMessageAt,
      lastMessageDirection: direction,
      firstRespondedAt:
        direction === "outbound" || status === "resolved"
          ? iso(-ageMs + HOUR)
          : null,
      firstResponseDueAt:
        status === "resolved"
          ? null
          : iso(pastDue ? -HOUR : 4 * HOUR - ageMs / 4),
      nextResponseDueAt: null,
      resolvedAt: status === "resolved" ? lastMessageAt : null,
      snoozedUntil: status === "snoozed" ? iso(DAY) : null,
      escalatedAt: priority === "urgent" ? iso(-20 * 60_000) : null,
      boardOrder: index,
      slaPolicyId: "sla-1",
      createdAt: firstMessageAt,
      updatedAt: lastMessageAt,
    };
  },
);

function supportMessages(conversation) {
  const contact = {
    id: `contact-${conversation.id}`,
    role: "donor",
    name: conversation.externalContactName,
    email: conversation.externalContactEmail,
    avatarUrl: null,
  };
  const agent = conversation.assignee ?? SUPPORT_AGENTS[0];
  const message = (
    index,
    type,
    direction,
    author,
    text,
    postedAt,
    isPrivate = false,
  ) => ({
    id: `${conversation.id}-m${index}`,
    tenantId: TENANT,
    conversationId: conversation.id,
    type,
    direction,
    isPrivate,
    deliveryState: "delivered",
    author: {
      id: author.id,
      role: author === contact ? "donor" : "agent",
      name: author.name,
      email: author.email,
      avatarUrl: null,
    },
    body: { json: null, html: `<p>${text}</p>`, text },
    attachments: [],
    emailHeaders:
      type === "email"
        ? {
            messageId: null,
            inReplyTo: null,
            references: [],
            subject: conversation.subject,
            from: author.email,
            to: [
              direction === "inbound"
                ? "care@example.org"
                : conversation.externalContactEmail,
            ],
            cc: [],
            bcc: [],
          }
        : null,
    outboundSendLogId: null,
    inboundEmailId: null,
    inboundAttachmentStatus: "none",
    postedAt,
    createdAt: postedAt,
    updatedAt: postedAt,
  });
  const first = `Hello, ${conversation.subject.toLowerCase()} — could you help? Thank you so much for all you do.`;
  return [
    message(1, "email", "inbound", contact, first, conversation.firstMessageAt),
    message(
      2,
      "note",
      "internal",
      agent,
      "Checked the giving record; the gift posted on the 3rd. Sending the receipt now.",
      iso(Date.parse(conversation.firstMessageAt) - Date.now() + HOUR),
      true,
    ),
    message(
      3,
      "email",
      conversation.lastMessageDirection,
      conversation.lastMessageDirection === "inbound" ? contact : agent,
      conversation.lastMessageDirection === "inbound"
        ? "Just following up on this — I still haven't seen it come through."
        : "Thanks for your patience! I've attached the receipt and updated your record.",
      conversation.lastMessageAt,
    ),
  ];
}

const SUPPORT_SETTINGS = {
  inboxes: [
    {
      id: "inbox-1",
      tenantId: TENANT,
      name: "Donor Care",
      channel: "email",
      inboundAddress: "care@in.example.org",
      fromAddress: "care@example.org",
      fromName: "Give Hope Donor Care",
      replyToAddress: null,
      description: "Gifts, receipts and giving questions.",
      isDefault: true,
      createdAt: iso(-200 * DAY),
      updatedAt: iso(-10 * DAY),
    },
    {
      id: "inbox-2",
      tenantId: TENANT,
      name: "Mobilization",
      channel: "email",
      inboundAddress: "go@in.example.org",
      fromAddress: "go@example.org",
      fromName: "Give Hope Mobilization",
      replyToAddress: null,
      description: "Applicants and trips.",
      isDefault: false,
      createdAt: iso(-180 * DAY),
      updatedAt: iso(-12 * DAY),
    },
  ],
  settings: [
    {
      id: "is-1",
      tenantId: TENANT,
      inboxId: "inbox-1",
      defaultSignatureId: "sig-1",
      defaultSlaPolicyId: "sla-1",
      defaultBusinessHoursId: "bh-1",
      roundRobinEnabled: true,
      autoResolveAfterDays: 14,
      showContactSidecar: true,
      createdAt: iso(-200 * DAY),
      updatedAt: iso(-10 * DAY),
    },
    {
      id: "is-2",
      tenantId: TENANT,
      inboxId: "inbox-2",
      defaultSignatureId: "sig-1",
      defaultSlaPolicyId: "sla-1",
      defaultBusinessHoursId: "bh-1",
      roundRobinEnabled: false,
      autoResolveAfterDays: 21,
      showContactSidecar: true,
      createdAt: iso(-180 * DAY),
      updatedAt: iso(-12 * DAY),
    },
  ],
  businessHours: [
    {
      id: "bh-1",
      tenantId: TENANT,
      name: "Standard week",
      timezone: "America/Chicago",
      weeklySchedule: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ].map((day, index) => ({
        day,
        enabled: index < 5,
        openTime: "09:00",
        closeTime: "17:00",
      })),
      holidays: [{ date: dateOnly(30 * DAY), label: "Thanksgiving" }],
      isDefault: true,
      createdAt: iso(-200 * DAY),
      updatedAt: iso(-30 * DAY),
    },
  ],
  slaPolicies: [
    {
      id: "sla-1",
      tenantId: TENANT,
      name: "Standard",
      description: "Reply within a working day.",
      firstResponseMinutes: 480,
      nextResponseMinutes: 720,
      resolutionMinutes: 4320,
      businessHoursId: "bh-1",
      isDefault: true,
      createdAt: iso(-200 * DAY),
      updatedAt: iso(-30 * DAY),
    },
    {
      id: "sla-2",
      tenantId: TENANT,
      name: "Urgent giving issues",
      description: "Same-day answers for failed or missing gifts.",
      firstResponseMinutes: 120,
      nextResponseMinutes: 240,
      resolutionMinutes: 1440,
      businessHoursId: "bh-1",
      isDefault: false,
      createdAt: iso(-100 * DAY),
      updatedAt: iso(-20 * DAY),
    },
  ],
  signatures: [
    {
      id: "sig-1",
      tenantId: TENANT,
      ownerAgentId: null,
      name: "Donor Care team",
      bodyText: "Grace and peace,\nThe Give Hope Donor Care team",
      bodyHtml: null,
      isDefault: true,
      createdAt: iso(-200 * DAY),
      updatedAt: iso(-40 * DAY),
    },
    {
      id: "sig-2",
      tenantId: TENANT,
      ownerAgentId: "agent-1",
      name: "Dana",
      bodyText: "Dana Reyes\nDonor care lead, Give Hope",
      bodyHtml: null,
      isDefault: false,
      createdAt: iso(-90 * DAY),
      updatedAt: iso(-15 * DAY),
    },
  ],
  macros: [
    {
      id: "macro-1",
      tenantId: TENANT,
      ownerAgentId: null,
      name: "Receipt resent",
      description: "Send the receipt template and resolve.",
      actions: [
        { kind: "add_label", labelId: "label-1" },
        { kind: "set_status", status: "resolved" },
      ],
      createdAt: iso(-100 * DAY),
      updatedAt: iso(-8 * DAY),
    },
    {
      id: "macro-2",
      tenantId: TENANT,
      ownerAgentId: null,
      name: "Hand to mobilization",
      description: "Route trip questions to the mobilization team.",
      actions: [
        { kind: "add_label", labelId: "label-4" },
        { kind: "set_priority", priority: "normal" },
      ],
      createdAt: iso(-60 * DAY),
      updatedAt: iso(-6 * DAY),
    },
  ],
  cannedResponses: [
    {
      id: "cr-1",
      tenantId: TENANT,
      ownerAgentId: null,
      shortCode: "receipt",
      title: "Receipt resend",
      bodyText:
        "Thank you for your gift! I've attached your receipt to this email.",
      bodyHtml: null,
      createdAt: iso(-100 * DAY),
      updatedAt: iso(-8 * DAY),
    },
    {
      id: "cr-2",
      tenantId: TENANT,
      ownerAgentId: null,
      shortCode: "card",
      title: "Update card details",
      bodyText:
        "You can update your card from your giving account at any time.",
      bodyHtml: null,
      createdAt: iso(-80 * DAY),
      updatedAt: iso(-9 * DAY),
    },
  ],
  savedViews: [
    {
      id: "sv-1",
      tenantId: TENANT,
      ownerAgentId: null,
      name: "Open receipts",
      slug: "open-receipts",
      scope: "workspace",
      filter: {
        view: "all",
        layout: "table",
        status: "open",
        q: "",
        labelSlugs: ["receipts"],
        assignee: "",
      },
      createdAt: iso(-50 * DAY),
      updatedAt: iso(-5 * DAY),
    },
    {
      id: "sv-2",
      tenantId: TENANT,
      ownerAgentId: null,
      name: "Trip questions",
      slug: "trip-questions",
      scope: "workspace",
      filter: {
        view: "all",
        layout: "board",
        status: "",
        q: "",
        labelSlugs: ["trips"],
        assignee: "",
      },
      createdAt: iso(-40 * DAY),
      updatedAt: iso(-4 * DAY),
    },
  ],
  automationRules: [
    {
      id: "ar-1",
      tenantId: TENANT,
      name: "Tag receipt requests",
      description: "Label new conversations that mention a receipt.",
      enabled: true,
      trigger: "conversation_created",
      conditions: [{ kind: "subject_contains", value: "receipt" }],
      actions: [{ kind: "add_label", labelId: "label-1" }],
      createdAt: iso(-70 * DAY),
      updatedAt: iso(-7 * DAY),
    },
  ],
};

const NOTIFICATION_PREFERENCES = SUPPORT_AGENTS.map((agent, index) => ({
  id: `np-${index + 1}`,
  tenantId: TENANT,
  agentId: agent.id,
  emailMentions: true,
  emailAssignments: true,
  emailDailyDigest: index === 0,
  inAppMentions: true,
  inAppAssignments: true,
  inAppSlaWarnings: true,
  createdAt: iso(-100 * DAY),
  updatedAt: iso(-3 * DAY),
}));

// ------------------------------------------------------------------ eve ---

const EVE_GOVERNANCE = {
  system: {
    source: "persisted",
    releaseEnabled: false,
    emergencyOff: false,
    killSwitchState: {
      all_automation: false,
      active_runs: false,
      github_actions: false,
      production_writes: false,
      sandbox_networking: false,
      dynamic_workflows: false,
      model_policy_changes: false,
      force_approval: true,
    },
    policyStatus: "ready",
    stateVersion: 3,
    updatedAt: iso(-2 * DAY),
  },
  recentRuns: [],
  auditHistory: [],
};

// ---------------------------------------------------------- automations ---

const AUTOMATION_RULES = [
  ["giving.thank-you-email", "donation_completed", "automatic", true, "active"],
  [
    "giving.failed-card-follow-up",
    "recurring_payment_failed",
    "review_first",
    true,
    "active",
  ],
  [
    "care.check-in-reminder",
    "care_checkin_overdue",
    "automatic",
    true,
    "active",
  ],
  [
    "mobilize.applicant-welcome",
    "applicant_created",
    "automatic",
    false,
    "paused",
  ],
  [
    "giving.year-end-statement",
    "scheduled_yearly",
    "review_first",
    false,
    "ready",
  ],
  [
    "crm.duplicate-review",
    "duplicate_detected",
    "review_first",
    false,
    "draft",
  ],
].map(([name, kind, runMode, enabled, activationStatus], index) => ({
  id: `rule-${index + 1}`,
  name,
  mode: index % 2 === 0 ? "simple" : "advanced",
  trigger: { kind },
  conditions: [],
  actions: [{ kind: "send_email" }],
  runMode,
  enabled,
  activationStatus,
}));

// -------------------------------------------------------------- reports ---

const FUND_ROWS = [
  ["General Fund", 4_825_000, 212, 141],
  ["Clean Water Initiative", 1_960_000, 96, 74],
  ["Kenya School Build", 1_412_500, 61, 48],
  ["Medical Missions", 1_108_000, 57, 39],
  ["Disaster Relief", 742_300, 88, 80],
  ["Bible Translation", 515_000, 23, 17],
].map(([label, amountCents, giftCount, donorCount], index) => ({
  id: `fund-${index + 1}`,
  label,
  amountCents,
  giftCount,
  donorCount,
  lastGiftAt: iso(-(index + 1) * DAY),
  status: null,
  metadata: {},
}));

// --------------------------------------------------------------- studio ---

const EMAIL_TEMPLATES = [
  "Year-end appeal",
  "Monthly partner update",
  "Welcome to Give Hope",
].map((name, index) => ({
  id: `tpl_${index + 1}`,
  name,
  builder: "react_email",
  builder_version: "1",
  version: index + 1,
  html_content: null,
  text_content: null,
  default_subject: name,
  default_preheader: null,
  design_json: {},
}));

const PDF_TEMPLATES = [
  ["Donation receipt", "donation_receipt", "published"],
  ["Year-end giving statement", "giving_statement", "published"],
  ["Pledge confirmation", "pledge_confirmation", "draft"],
].map(([name, category, status], index) => ({
  id: `pdf_${index + 1}`,
  name,
  description: null,
  design: { counters: {}, body: { rows: [], values: {} } },
  html: null,
  category,
  page_size: "Letter",
  orientation: "portrait",
  status,
  engine: "unlayer",
  updated_at: iso(-(index + 2) * DAY),
}));

const RESEND_CONNECTED = {
  success: true,
  connected: true,
  sendReady: true,
  apiKeyHint: "a1b2",
  validatedAt: iso(-3 * DAY),
  defaultFromEmail: "hello@example.org",
  defaultFromName: "Give Hope",
  replyToEmail: "care@example.org",
  senderIdentities: [
    {
      id: 1,
      nickname: "Main",
      from_email: "hello@example.org",
      from_name: "Give Hope",
      reply_to_email: "care@example.org",
      verified: true,
    },
  ],
  domainAuthentication: [
    { id: 1, domain: "example.org", subdomain: null, valid: true },
  ],
  deliverabilityScore: 92,
  warnings: [
    {
      code: "dmarc_policy_none",
      message:
        "Your DMARC policy is set to none. Consider quarantine once mail is aligned.",
      severity: "warning",
    },
  ],
  persisted: true,
};

// -------------------------------------------------------------- install ---

/**
 * Registers the module fixtures. `scenario` "empty" serves empty lists and
 * "error" answers 500 for every module GET, like installApiFixtures.
 */
export async function installModuleFixtures(
  page,
  { scenario = "populated" } = {},
) {
  const empty = scenario === "empty";
  const state = {
    conversations: empty ? [] : structuredClone(CONVERSATIONS),
    labels: structuredClone(SUPPORT_LABELS),
    locations: empty ? [] : structuredClone(LOCATIONS),
  };
  const ok = (body, status = 200) => ({ status, body });
  const list = (items) => (empty ? [] : items);

  /** [method, regexp on pathname, handler(match, url, body)] */
  const routes = [
    // Member Care
    [
      "GET",
      /^\/api\/admin\/member-care\/dashboard$/,
      () =>
        ok({
          personnel: list(PERSONNEL),
          activities: list(CARE_ACTIVITIES),
          goals: [],
          requirements: [],
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/member-care\/directory\/([^/]+)$/,
      (match) => {
        const detail = careDetail(decodeURIComponent(match[1]));
        return detail.personnel ? ok(detail) : ok({ error: "Not found" }, 404);
      },
    ],
    [
      "POST",
      /^\/api\/admin\/member-care\/(thread|private-notes|goals|activity|requirements)$/,
      () => ok({ id: "m1" }, 201),
    ],
    ["PATCH", /^\/api\/admin\/member-care\/attention$/, () => ok({ id: "m1" })],
    // Locations
    [
      "GET",
      /^\/api\/admin\/locations$/,
      () =>
        ok({
          locations: state.locations,
          linkedEntities: {
            missionaries: PERSONNEL.slice(0, 6).map((person, index) => ({
              id: `5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a0${index}`,
              full_name: person.name,
            })),
            projects: [],
          },
        }),
    ],
    [
      "POST",
      /^\/api\/admin\/locations$/,
      (_match, _url, body) => {
        const location = {
          ...LOCATIONS[0],
          ...body,
          id:
            body?.id ??
            `4c1d2e00-0000-4000-8000-${String(state.locations.length + 100).padStart(12, "0")}`,
          updated_at: iso(0),
        };
        state.locations = [
          ...state.locations.filter((entry) => entry.id !== location.id),
          location,
        ];
        return ok({ location });
      },
    ],
    [
      "DELETE",
      /^\/api\/admin\/locations$/,
      (_match, _url, body) => {
        state.locations = state.locations.filter(
          (entry) => entry.id !== body?.id,
        );
        return ok({ success: true });
      },
    ],
    // Workflows
    [
      "GET",
      /^\/api\/admin\/workflows\/summaries$/,
      () => {
        const summaries = list(WORKFLOW_SUMMARIES);
        return ok({
          summaries,
          counts: {
            urgent: summaries.filter(
              (row) => row.notification.level === "urgent",
            ).length,
            visible: summaries.filter(
              (row) => row.notification.level === "visible",
            ).length,
          },
        });
      },
    ],
    // Support Hub
    [
      "GET",
      /^\/api\/admin\/support\/conversations$/,
      () => ok({ conversations: state.conversations }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/conversations\/([^/]+)$/,
      (match) => {
        const conversation = state.conversations.find(
          (entry) => entry.id === match[1],
        );
        return conversation
          ? ok({ conversation })
          : ok({ error: "Conversation not found." }, 404);
      },
    ],
    [
      "GET",
      /^\/api\/admin\/support\/conversations\/([^/]+)\/messages$/,
      (match) => {
        const conversation = state.conversations.find(
          (entry) => entry.id === match[1],
        );
        return ok({
          messages: conversation ? supportMessages(conversation) : [],
        });
      },
    ],
    [
      "PATCH",
      /^\/api\/admin\/support\/conversations\/([^/]+)\/(assign|status|snooze|priority|labels)$/,
      (match, _url, body) => {
        const conversation = state.conversations.find(
          (entry) => entry.id === match[1],
        );
        if (!conversation) return ok({ error: "Conversation not found." }, 404);
        if (match[2] === "status" && body?.status)
          conversation.status = body.status;
        if (match[2] === "priority" && body?.priority)
          conversation.priority = body.priority;
        if (match[2] === "assign")
          conversation.assignee =
            SUPPORT_AGENTS.find((agent) => agent.id === body?.assigneeId) ??
            null;
        return ok({ conversation });
      },
    ],
    [
      "DELETE",
      /^\/api\/admin\/support\/conversations\/([^/]+)\/snooze$/,
      (match) =>
        ok({
          conversation: state.conversations.find(
            (entry) => entry.id === match[1],
          ),
        }),
    ],
    [
      "POST",
      /^\/api\/admin\/support\/conversations\/([^/]+)\/(notes|replies)$/,
      (match) => {
        const conversation = state.conversations.find(
          (entry) => entry.id === match[1],
        );
        return ok(
          { message: supportMessages(conversation ?? CONVERSATIONS[0])[1] },
          201,
        );
      },
    ],
    [
      "POST",
      /^\/api\/admin\/support\/conversations\/([^/]+)\/run-macro$/,
      (match) =>
        ok({
          result: {
            macroId: "macro-1",
            conversationId: match[1],
            outcomes: [
              {
                index: 0,
                action: { kind: "set_status", status: "resolved" },
                status: "ok",
                message: "Status set to resolved",
              },
            ],
            ok: true,
          },
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/reports$/,
      () =>
        ok({
          conversations: state.conversations,
          messages: state.conversations.flatMap(supportMessages),
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/agents$/,
      () => ok({ agents: SUPPORT_AGENTS }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/teams$/,
      () => ok({ teams: SUPPORT_TEAMS }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/labels$/,
      () => ok({ labels: state.labels }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/macros$/,
      () => ok({ macros: SUPPORT_SETTINGS.macros }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/canned-responses$/,
      () => ok({ cannedResponses: SUPPORT_SETTINGS.cannedResponses }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/saved-views$/,
      () => ok({ savedViews: SUPPORT_SETTINGS.savedViews }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/inboxes$/,
      () => ok({ inboxes: SUPPORT_SETTINGS.inboxes }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/inbox-settings$/,
      () => ok({ settings: SUPPORT_SETTINGS.settings }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/business-hours$/,
      () => ok({ businessHours: SUPPORT_SETTINGS.businessHours }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/sla-policies$/,
      () => ok({ slaPolicies: SUPPORT_SETTINGS.slaPolicies }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/signatures$/,
      () => ok({ signatures: SUPPORT_SETTINGS.signatures }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/automation-rules$/,
      () => ok({ automationRules: SUPPORT_SETTINGS.automationRules }),
    ],
    [
      "GET",
      /^\/api\/admin\/support\/notification-preferences$/,
      () => ok({ preferences: NOTIFICATION_PREFERENCES }),
    ],
    [
      "POST",
      /^\/api\/admin\/support\/tickets$/,
      () => ok({ id: "SUP-2001" }, 201),
    ],
    // Eve
    // Platform owners for Eve's launch-permission picker (tenant-scoped
    // profiles with role super_admin, as GET /api/admin/users returns them).
    // and the staff directory, which reads each staff role a page at a time.
    [
      "GET",
      /^\/api\/admin\/users$/,
      (_match, url) => {
        const role = url.searchParams.get("role");
        const offset = Number(url.searchParams.get("offset") ?? "0");
        if (offset > 0) return ok({ users: [] });
        return ok({
          users: STAFF_ACCOUNTS.filter(
            (account) => !role || account.role === role,
          ),
        });
      },
    ],
    // Moderation reads real posts (all, and the review queue) and comments.
    [
      "GET",
      /^\/api\/admin\/posts$/,
      (_match, url) => {
        const statuses = url.searchParams
          .get("status")
          ?.split(",")
          .filter(Boolean);
        const posts = statuses
          ? MODERATION_POSTS.filter((post) => statuses.includes(post.status))
          : MODERATION_POSTS;
        return ok({
          posts,
          total: posts.length,
          stats: {
            total: MODERATION_POSTS.length,
            flagged: MODERATION_POSTS.filter(
              (post) => post.status === "flagged",
            ).length,
            hidden: MODERATION_POSTS.filter((post) => post.status === "hidden")
              .length,
          },
        });
      },
    ],
    [
      "GET",
      /^\/api\/admin\/comments$/,
      () =>
        ok({
          comments: MODERATION_COMMENTS,
          total: MODERATION_COMMENTS.length,
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/eve\/governance$/,
      () => ok({ requestId: "req_fixture", ...EVE_GOVERNANCE }),
    ],
    [
      "GET",
      /^\/api\/admin\/eve\/launch-readiness$/,
      () =>
        ok({
          requestId: "req_fixture",
          canActivate: false,
          canReview: true,
          manifests: [],
          governance: EVE_GOVERNANCE.system,
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/eve\/approval-budget$/,
      () =>
        ok({
          requestId: "req_fixture",
          approvals: [],
          budgets: [],
          catalog: [],
          decisions: [],
          policies: [],
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/eve\/model-policy$/,
      () =>
        ok({
          requestId: "req_fixture",
          budgetOverrides: [],
          canManage: true,
          policies: [],
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/eve\/admin-memory$/,
      () =>
        ok({
          requestId: "req_fixture",
          entries: [],
          history: [],
          settings: [],
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/eve\/notifications$/,
      () =>
        ok({
          requestId: "req_fixture",
          channels: [],
          recipients: [],
          recentNotifications: [],
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/eve\/engineering-monitors$/,
      () =>
        ok({
          requestId: "req_fixture",
          configs: [],
          findings: [],
          recentRuns: [],
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/eve\/retention$/,
      () =>
        ok({
          requestId: "req_fixture",
          categories: [],
          artifacts: [],
          holds: [],
          lifecycle: [],
        }),
    ],
    // Automations
    [
      "GET",
      /^\/api\/admin\/mission-control\/automations$/,
      () => {
        // Per-rule activity for the last 24 hours, adding up to the summary
        // (148 runs, 2 failed), as the store reports it from the activity log.
        const activity = {
          "rule-1": { runs24h: 92, failedRuns24h: 0, lastFailureAt: null },
          "rule-2": {
            runs24h: 31,
            failedRuns24h: 2,
            lastFailureAt: iso(-3 * HOUR),
          },
          "rule-3": { runs24h: 25, failedRuns24h: 0, lastFailureAt: null },
        };
        const rules = list(AUTOMATION_RULES).map((rule) => ({
          ...rule,
          ...(empty
            ? { runs24h: 0, failedRuns24h: 0, lastFailureAt: null }
            : (activity[rule.id] ?? {
                runs24h: 0,
                failedRuns24h: 0,
                lastFailureAt: null,
              })),
        }));
        return ok({
          automationRules: rules,
          summary: {
            totalRules: rules.length,
            activeRules: rules.filter(
              (rule) => rule.activationStatus === "active",
            ).length,
            pausedRules: rules.filter(
              (rule) => rule.activationStatus === "paused",
            ).length,
            readyRules: rules.filter(
              (rule) => rule.activationStatus === "ready",
            ).length,
            draftRules: rules.filter(
              (rule) => rule.activationStatus === "draft",
            ).length,
            invalidRules: 0,
            executions24h: empty ? 0 : 148,
            failedRuns24h: empty ? 0 : 2,
            activityLogBacked: true,
            integrationHealthBacked: false,
          },
        });
      },
    ],
    // Reports
    [
      "GET",
      /^\/api\/admin\/crm\/reports$/,
      (_match, url) => {
        const rows = list(FUND_ROWS);
        return ok({
          slice: url.searchParams.get("slice") ?? "funds",
          filters: { dateFrom: null, dateTo: null, search: null },
          rows,
          // As the service sets it for a giving report (service.ts
          // buildAdminCrmReport): every gift read, under the 50,000 bound.
          completeness: {
            complete: true,
            donationLimit: 50_000,
            includedGiftCount: rows.reduce(
              (sum, row) => sum + row.giftCount,
              0,
            ),
          },
          totals: {
            amountCents: rows.reduce((sum, row) => sum + row.amountCents, 0),
            giftCount: rows.reduce((sum, row) => sum + row.giftCount, 0),
            donorCount: empty ? 0 : 312,
            rowCount: rows.length,
          },
          audit: {
            exportRequired: true,
            loggedEvents: [
              "actor",
              "tenant",
              "filters",
              "rowCount",
              "timestamp",
            ],
          },
        });
      },
    ],
  ];

  await page.route("**/api/admin/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    for (const [method, pattern, handler] of routes) {
      if (method !== request.method()) continue;
      const match = pattern.exec(url.pathname);
      if (!match) continue;
      let body = null;
      try {
        body = request.postDataJSON();
      } catch {
        body = null;
      }
      const result =
        scenario === "error" && method === "GET"
          ? {
              status: 500,
              body: {
                error: "The service is unavailable. Try again shortly.",
                requestId: "req_fixture_error",
              },
            }
          : handler(match, url, body);
      await route.fulfill({
        status: result.status,
        contentType: "application/json",
        headers: { "x-fixture": `module/${scenario}` },
        body: JSON.stringify(result.body),
      });
      return;
    }
    await route.fallback();
  });

  // Email delivery and the studios use /api/email and /api/pdf-templates.
  await page.route(/\/api\/(email|pdf-templates)(\/|\?|$)/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    let result = null;
    if (scenario === "error" && method === "GET") {
      result = {
        status: 500,
        body: {
          success: false,
          error: "The service is unavailable. Try again shortly.",
        },
      };
    } else if (path === "/api/email/connect" && method === "GET") {
      result = ok(
        empty
          ? {
              success: true,
              connected: false,
              sendReady: false,
              defaultFromEmail: null,
              defaultFromName: null,
              replyToEmail: null,
            }
          : RESEND_CONNECTED,
      );
    } else if (path === "/api/email/connect" && method === "POST") {
      result = ok({ ...RESEND_CONNECTED, validatedAt: iso(0) });
    } else if (path === "/api/email/connect" && method === "DELETE") {
      result = ok({ success: true, persisted: true });
    } else if (path.endsWith("/test-send")) {
      result = ok({
        success: true,
        messageId: "msg_fixture",
        auditLogged: true,
      });
    } else if (path === "/api/email/templates" && method === "GET") {
      result = ok({ success: true, templates: list(EMAIL_TEMPLATES) });
    } else if (path.startsWith("/api/email/templates")) {
      result = ok({
        success: true,
        template: { id: "tpl_1", name: "Year-end appeal" },
      });
    } else if (path === "/api/pdf-templates" && method === "GET") {
      result = ok({ success: true, templates: list(PDF_TEMPLATES) });
    } else if (path.startsWith("/api/pdf-templates")) {
      result = ok({ template: { id: "pdf_1" } });
    }
    if (!result) return route.fallback();
    await route.fulfill({
      status: result.status,
      contentType: "application/json",
      headers: { "x-fixture": `module/${scenario}` },
      body: JSON.stringify(result.body),
    });
  });

  return { state };
}

export const MODULE_FIXTURE_IDS = {
  carePersonnelId: PERSONNEL[0].id,
  supportConversationId: CONVERSATIONS[0].id,
};
