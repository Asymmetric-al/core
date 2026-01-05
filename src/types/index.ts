/**
 * Type Definitions
 *
 * Central export for all TypeScript types used across the application.
 */

export type { Role, NavItem } from '@/config/navigation'
export * from './database'
export * from './api'

/**
 * Authenticated user shape (client-side)
 */
export interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  avatarUrl?: string
}
