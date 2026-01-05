import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Globe,
  Users,
  DollarSign,
  Mail,
  FileText,
  PenTool,
  Rocket,
  BarChart3,
  HelpCircle,
  Zap,
  Settings,
  Heart,
  CalendarDays,
} from 'lucide-react'

export type Role = 'finance' | 'fundraising' | 'mobilizers' | 'member_care' | 'events' | 'staff' | 'admin'

export interface NavItem {
  id: string
  title: string
  href: string
  icon: LucideIcon
  roles: Role[]
  section: 'main' | 'tools'
}

export const navigation: NavItem[] = [
  { id: 'home', title: 'Mission Control', href: '/mc', icon: LayoutDashboard, roles: ['finance', 'fundraising', 'mobilizers', 'member_care', 'events', 'staff', 'admin'], section: 'main' },
  { id: 'web-studio', title: 'Web Studio', href: '/mc/web-studio', icon: Globe, roles: ['fundraising', 'staff', 'admin'], section: 'main' },
  { id: 'crm', title: 'People & Churches', href: '/mc/crm', icon: Users, roles: ['fundraising', 'mobilizers', 'member_care', 'events', 'staff', 'admin'], section: 'main' },
  { id: 'contributions', title: 'Contributions', href: '/mc/contributions', icon: DollarSign, roles: ['finance', 'events', 'admin'], section: 'main' },
  { id: 'email', title: 'Email Studio', href: '/mc/email', icon: Mail, roles: ['fundraising', 'admin'], section: 'main' },
  { id: 'pdf', title: 'PDF Studio', href: '/mc/pdf', icon: FileText, roles: ['finance', 'admin'], section: 'main' },
  { id: 'sign', title: 'Sign Studio', href: '/mc/sign', icon: PenTool, roles: ['mobilizers', 'events', 'admin'], section: 'main' },
  { id: 'mobilize', title: 'Mobilize', href: '/mc/mobilize', icon: Rocket, roles: ['mobilizers', 'admin'], section: 'main' },
  { id: 'support', title: 'Support Hub', href: '/mc/support', icon: HelpCircle, roles: ['member_care', 'admin'], section: 'main' },
  { id: 'care', title: 'Member Care', href: '/mc/care', icon: Heart, roles: ['member_care', 'admin'], section: 'main' },
  { id: 'events', title: 'Events', href: '/mc/events', icon: CalendarDays, roles: ['events', 'admin'], section: 'main' },
  { id: 'reports', title: 'Report Studio', href: '/mc/reports', icon: BarChart3, roles: ['finance', 'fundraising', 'member_care', 'events', 'admin'], section: 'tools' },
  { id: 'automations', title: 'Automations', href: '/mc/automations', icon: Zap, roles: ['mobilizers', 'admin'], section: 'tools' },
  { id: 'admin', title: 'Admin', href: '/mc/admin', icon: Settings, roles: ['finance', 'admin'], section: 'tools' },
]

export function getNavItemsByRole(role: Role): NavItem[] {
  return navigation.filter((item) => item.roles.includes(role))
}

export function getMainNavItems(role: Role): NavItem[] {
  return navigation.filter((item) => item.section === 'main' && item.roles.includes(role))
}

export function getToolsNavItems(role: Role): NavItem[] {
  return navigation.filter((item) => item.section === 'tools' && item.roles.includes(role))
}
