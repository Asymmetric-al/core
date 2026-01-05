/**
 * Mock Data Types
 *
 * Centralized type definitions for all mock data used across the application.
 * These types mirror the expected database schema for easy migration to real data.
 */

export type UserRole = 'admin' | 'staff' | 'missionary' | 'donor'
export type DonorStage = 'prospect' | 'new' | 'active' | 'lapsed' | 'major'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskType = 'call' | 'email' | 'meeting' | 'todo' | 'follow_up'
export type DonationFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
export type DonationStatus = 'succeeded' | 'pending' | 'failed' | 'refunded'
export type PaymentMethod = 'visa' | 'mastercard' | 'amex' | 'discover' | 'bank_transfer' | 'check'
export type MissionaryStatus = 'active' | 'on_leave' | 'furlough' | 'retired'
export type HealthStatus = 'healthy' | 'at_risk' | 'critical'
export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'gift' | 'stage_change' | 'video_call' | 'pastoral_note'
export type PostType = 'update' | 'prayer_request' | 'praise_report' | 'newsletter'

export interface Address {
  id: string
  type: 'home' | 'work' | 'mailing' | 'other'
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary: boolean
}

export interface PhoneNumber {
  id: string
  type: 'mobile' | 'home' | 'work' | 'other'
  number: string
  isPrimary: boolean
}

export interface BaseProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  coverImageUrl?: string
  phones: PhoneNumber[]
  addresses: Address[]
  tags: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface StaffMember extends BaseProfile {
  role: 'admin' | 'staff'
  title: string
  department: string
  hireDate: string
}

export interface Missionary extends BaseProfile {
  role: 'missionary'
  title: string
  location: string
  region: string
  timezone: string
  status: MissionaryStatus
  healthStatus: HealthStatus
  healthSignals: {
    emotional: number
    spiritual: number
    physical: number
    financial: number
  }
  ministryFocus: string
  bio: string
  monthlyGoal: number
  currentSupport: number
  donorCount: number
  startDate: string
  lastCheckIn: string
  careGaps: string[]
  projectImage: string
}

export interface Donor extends BaseProfile {
  role: 'donor'
  stage: DonorStage
  company?: string
  jobTitle?: string
  totalGiven: number
  totalGivenYTD: number
  firstGiftDate: string
  lastGiftDate: string
  lastGiftAmount: number
  averageGift: number
  largestGift: number
  giftCount: number
  assignedTo?: string
  preferredContact: 'email' | 'phone' | 'mail'
  communicationPreferences: {
    newsletter: boolean
    taxReceipts: boolean
    eventInvites: boolean
    prayerRequests: boolean
  }
}

export interface Donation {
  id: string
  donorId: string
  recipientId: string
  recipientType: 'missionary' | 'project' | 'general_fund'
  amount: number
  currency: string
  frequency: DonationFrequency
  status: DonationStatus
  paymentMethod: PaymentMethod
  last4: string
  transactionId: string
  date: string
  receiptUrl?: string
  isRecurring: boolean
  pledgeId?: string
}

export interface Pledge {
  id: string
  donorId: string
  recipientId: string
  recipientType: 'missionary' | 'project' | 'general_fund'
  amount: number
  frequency: DonationFrequency
  startDate: string
  nextChargeDate: string
  endDate?: string
  status: 'active' | 'paused' | 'cancelled' | 'completed'
  paymentMethodId: string
  totalContributed: number
  missedPayments: number
}

export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  assignedTo: string
  assignedBy: string
  relatedTo?: {
    type: 'donor' | 'missionary' | 'donation'
    id: string
    name: string
  }
  dueDate: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  type: ActivityType
  entityType: 'donor' | 'missionary' | 'donation' | 'task'
  entityId: string
  title: string
  description?: string
  amount?: number
  date: string
  authorId: string
  authorName: string
  isPrivate: boolean
  metadata?: Record<string, unknown>
}

export interface Post {
  id: string
  authorId: string
  type: PostType
  title: string
  content: string
  imageUrl?: string
  videoUrl?: string
  isPublic: boolean
  isPinned: boolean
  likes: number
  comments: number
  prayers: number
  fires: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  likes: number
  createdAt: string
}

export interface PaymentMethodRecord {
  id: string
  donorId: string
  type: PaymentMethod
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  billingAddress?: Address
  createdAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  location: string
  region: string
  category: string
  imageUrl: string
  goal: number
  raised: number
  donorCount: number
  status: 'active' | 'funded' | 'completed'
  startDate: string
  endDate?: string
  missionaryId?: string
}

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  severity: 'low' | 'medium' | 'high'
  title: string
  message: string
  relatedTo?: {
    type: string
    id: string
  }
  isRead: boolean
  createdAt: string
}

export interface FeedItem {
  id: string
  workerId: string
  workerName: string
  location: string
  activity: string
  impact: string
  status: 'active' | 'urgent' | 'resolved'
  lastUpdate: string
}
