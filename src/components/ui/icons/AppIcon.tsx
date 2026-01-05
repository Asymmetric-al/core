'use client'

import * as React from 'react'
import { type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface AppIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  icon: LucideIcon
  animated?: boolean
  size?: number | string
  strokeWidth?: number
}

/**
 * AppIcon abstraction that renders a Lucide icon with optional animation.
 * Animate ONLY the active route icon as per Phase 3 requirements.
 * 
 * Falls back gracefully to standard Lucide icons if animated version is unavailable.
 */
export const AppIcon = React.memo(function AppIcon({ 
  icon: Icon, 
  animated = false, 
  className, 
  size = 16, 
  strokeWidth = 2,
  ...props 
}: AppIconProps) {
  // Graceful fallback: If not animated, or for SSR consistency, render standard icon
  if (!animated) {
    return (
      <Icon 
        className={cn("shrink-0", className)} 
        size={size} 
        strokeWidth={strokeWidth} 
        {...props} 
      />
    )
  }

  // Active route animation: subtle scale and opacity entrance
  // This ensures no layout shift while providing a visual cue for the active state
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
    >
      <Icon 
        size={size} 
        strokeWidth={strokeWidth} 
        {...props} 
      />
    </motion.span>
  )
})
