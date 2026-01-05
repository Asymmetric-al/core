import type { Tile, Workflow } from './types'

export const TILES: Tile[] = [
  {
    id: 'web-studio',
    title: 'Web Studio',
    route: '/web-studio',
    icon: 'Globe',
    purpose: 'Your whole website in one place. Public site, donor experience, and missionary pages all live here.',
    inside: 'Directus CMS',
    quickActions: [
      { label: 'Edit give page', href: '/web-studio/pages/give', icon: 'Edit' },
      { label: 'Update a missionary page', href: '/web-studio/missionaries', icon: 'User' },
    ],
    roles: ['fundraising', 'staff', 'admin'],
  },
  {
    id: 'crm',
    title: 'People & Churches CRM',
    route: '/crm',
    icon: 'Users',
    purpose: 'Search and work with people, churches, and orgs in one surface.',
    inside: 'Fork of Twenty CRM · People · Churches · Households · Activity · Notes · Tasks · Fundraiser-friendly reports',
    quickActions: [
      { label: 'Add person', href: '/crm/people/new', icon: 'UserPlus' },
      { label: 'Add pledge', href: '/crm/pledges/new', icon: 'FileText' },
      { label: 'Create call task', href: '/crm/tasks/new?type=call', icon: 'Phone' },
      { label: 'Open recent donors', href: '/crm/people?filter=recent-donors', icon: 'TrendingUp' },
    ],
    roles: ['fundraising', 'mobilizers', 'member_care', 'events', 'staff', 'admin'],
  },
  {
    id: 'contributions',
    title: 'Contributions Hub',
    route: '/contributions',
    icon: 'DollarSign',
    purpose: 'Single hub for every gift and payout.',
    inside: 'All contributions feed · Offline entry · Stripe · ACH · Tie out',
    quickActions: [
      { label: 'New batch', href: '/contributions/batches/new', icon: 'Plus' },
      { label: 'Reconcile yesterday', href: '/contributions/reconcile?date=yesterday', icon: 'CheckCircle' },
      { label: 'View Stripe disputes', href: '/contributions/disputes', icon: 'AlertTriangle' },
    ],
    roles: ['finance', 'events', 'admin'],
  },
  {
    id: 'email',
    title: 'Email Studio',
    route: '/email',
    icon: 'Mail',
    purpose: 'Design and send. Auth and logs stay nested.',
    inside: 'White label Unlayer · Templates · Layouts · Brand styles · Variables · Mail auth · Mail logs',
    quickActions: [
      { label: 'New campaign', href: '/email/campaigns/new', icon: 'PenSquare' },
      { label: 'Duplicate template', href: '/email/templates', icon: 'Copy' },
      { label: 'View bounces', href: '/email/logs?filter=bounces', icon: 'XCircle' },
    ],
    roles: ['fundraising', 'admin'],
  },
  {
    id: 'pdf',
    title: 'PDF Studio',
    route: '/pdf',
    icon: 'FileText',
    purpose: 'Build documents and themes once and reuse everywhere.',
    inside: 'White label Unlayer PDF builder · Templates · Themes · Data bindings · Statements and receipt packs',
    quickActions: [
      { label: 'New template', href: '/pdf/templates/new', icon: 'Plus' },
      { label: 'Build receipt template', href: '/pdf/templates/new?type=receipt', icon: 'Receipt' },
      { label: 'Build year-end pack', href: '/pdf/packs/new?type=year-end', icon: 'Calendar' },
    ],
    roles: ['finance', 'admin'],
  },
  {
    id: 'sign',
    title: 'Sign Studio',
    route: '/sign',
    icon: 'PenTool',
    purpose: 'Create, manage, and audit everything that gets signed.',
    inside: 'Fork of Documenso CE · Packet templates · Active sends · Completed docs · Search · Export',
    quickActions: [
      { label: 'New packet from template', href: '/sign/packets/new', icon: 'FilePlus' },
      { label: 'Search by signer', href: '/sign/search', icon: 'Search' },
    ],
    roles: ['mobilizers', 'events', 'admin'],
  },
  {
    id: 'mobilize',
    title: 'Mobilize',
    route: '/mobilize',
    icon: 'Rocket',
    purpose: 'From application to onboarding with a task-list front end and Zapier behind the scenes.',
    inside: 'Pipeline · Stages · Checklists · Team tasks · Interviews · Training · Final onboarding',
    quickActions: [
      { label: 'Advance stage', href: '/mobilize/pipeline', icon: 'ArrowRight' },
      { label: 'Assign checklist', href: '/mobilize/checklists', icon: 'ClipboardList' },
      { label: 'Request background doc', href: '/mobilize/documents/request', icon: 'FileSearch' },
    ],
    roles: ['mobilizers', 'admin'],
  },
  {
    id: 'reports',
    title: 'Report Studio',
    route: '/reports',
    icon: 'BarChart3',
    purpose: 'Run reports with deep filters. Export CSV or PDF.',
    inside: 'Build · Library · Schedules · Destinations',
    quickActions: [
      { label: 'New report', href: '/reports/new', icon: 'Plus' },
      { label: 'Save to CRM', href: '/reports/library?dest=crm', icon: 'Users' },
      { label: 'Save to Contributions', href: '/reports/library?dest=contributions', icon: 'DollarSign' },
    ],
    roles: ['finance', 'fundraising', 'member_care', 'events', 'admin'],
  },
  {
    id: 'support',
    title: 'Support Hub',
    route: '/support',
    icon: 'HelpCircle',
    purpose: 'Care requests routed to the right agents.',
    inside: 'Inbox · Contacts · Tags · Macros · Knowledge',
    quickActions: [
      { label: 'New ticket', href: '/support/tickets/new', icon: 'Plus' },
      { label: 'Escalate to finance', href: '/support/tickets?escalate=finance', icon: 'ArrowUp' },
      { label: 'Send to Mobilization team', href: '/support/tickets?assign=mobilization', icon: 'Send' },
    ],
    roles: ['member_care', 'admin'],
  },
  {
    id: 'automations',
    title: 'Automation Hub',
    route: '/automations',
    icon: 'Zap',
    purpose: 'All automations in one place. Branded Zapier.',
    inside: 'Zaps and flows · Connections · Errors and retries · Change log',
    quickActions: [
      { label: 'Create flow', href: '/automations/flows/new', icon: 'Plus' },
      { label: 'Reconnect Stripe', href: '/automations/connections?filter=stripe', icon: 'RefreshCw' },
      { label: 'Review failed runs', href: '/automations/runs?status=failed', icon: 'AlertCircle' },
    ],
    roles: ['mobilizers', 'admin'],
  },
  {
    id: 'admin',
    title: 'Admin',
    route: '/admin',
    icon: 'Settings',
    purpose: 'Trust and platform settings.',
    inside: 'Domains and certs · API keys · AI keys and settings · Exports · Status and health',
    quickActions: [
      { label: 'Add domain', href: '/admin/domains/new', icon: 'Globe' },
      { label: 'Rotate key', href: '/admin/keys', icon: 'Key' },
      { label: 'Download month-end export', href: '/admin/exports?type=month-end', icon: 'Download' },
    ],
    roles: ['finance', 'admin'],
  },
  {
    id: 'care',
    title: 'Member Care Hub',
    route: '/care',
    icon: 'Heart',
    purpose: 'Live view of missionary health and needs.',
    inside: 'Care list · Check-ins · Prayer requests · Care plans · Alerts · Resources',
    quickActions: [
      { label: 'Log check-in', href: '/care/check-ins/new', icon: 'CheckSquare' },
      { label: 'Start care plan', href: '/care/plans/new', icon: 'ClipboardPlus' },
      { label: 'Request pastoral packet', href: '/care/packets/request', icon: 'FileHeart' },
    ],
    roles: ['member_care', 'admin'],
  },
  {
    id: 'events',
    title: 'Event & Conference Hub',
    route: '/events',
    icon: 'CalendarDays',
    purpose: 'Plan events, registration, attendance, and sync to giving and care.',
    inside: 'Events · Sessions · Speakers · Budgets · Registration · Discounts · Attendees · Check-in',
    quickActions: [
      { label: 'Create event', href: '/events/new', icon: 'Plus' },
      { label: 'Open registration', href: '/events?action=open-registration', icon: 'DoorOpen' },
      { label: 'Print badges', href: '/events/badges', icon: 'Printer' },
      { label: 'Export attendance', href: '/events/export', icon: 'Download' },
    ],
    roles: ['events', 'admin'],
  },
]

export const WORKFLOWS: Workflow[] = [
  {
    id: 'gift-lifecycle',
    title: 'Gift Lifecycle',
    description: 'From donation to receipt to year-end statement',
    primaryTile: 'contributions',
    route: '/contributions',
  },
  {
    id: 'missionary-onboarding',
    title: 'Missionary Onboarding',
    description: 'Application through training to field deployment',
    primaryTile: 'mobilize',
    route: '/mobilize',
  },
  {
    id: 'event-registration-giving',
    title: 'Event Registration with Giving',
    description: 'Register, attend, and give at conferences',
    primaryTile: 'events',
    route: '/events',
  },
  {
    id: 'care-signal-action',
    title: 'Care Signal to Action',
    description: 'Identify needs and respond with care plans',
    primaryTile: 'care',
    route: '/care',
  },
]

export function getTileById(id: string): Tile | undefined {
  return TILES.find((tile) => tile.id === id)
}

export function getTilesByRole(roleIds: string[]): Tile[] {
  return TILES.filter((tile) => tile.roles.some((r) => roleIds.includes(r)))
}
