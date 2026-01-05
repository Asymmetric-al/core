'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { MoreHorizontal, Pencil, CheckCircle2, User, Trash2, Clock, Bell, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import type { Task } from '@/lib/missionary/types'
import { TASK_TYPE_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG, getDueDateStatus, springTransition, smoothTransition } from './task-config'

interface TaskRowProps {
  task: Task
  onComplete: () => void
  onEdit: () => void
  onDelete: () => void
  index: number
}

export function TaskRow({
  task,
  onComplete,
  onEdit,
  onDelete,
  index,
}: TaskRowProps) {
  const typeConfig = TASK_TYPE_CONFIG[task.task_type]
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const statusConfig = STATUS_CONFIG[task.status]
  const dueDateStatus = getDueDateStatus(task.due_date)
  const isCompleted = task.status === 'completed'
  const Icon = typeConfig.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ...smoothTransition, delay: index * 0.02 }}
      className={cn(
        'relative group flex items-start gap-5 p-6 border rounded-[2rem] transition-all duration-300',
        isCompleted
          ? 'bg-[oklch(0.985_0.002_265)]/50 border-[oklch(0.915_0.003_265)] opacity-75'
          : 'bg-white border-[oklch(0.915_0.003_265)] hover:border-[oklch(0.205_0.015_265)] hover:shadow-xl hover:-translate-y-1'
      )}
    >
      <motion.div className="mt-1.5 relative z-10" whileTap={{ scale: 0.9 }}>
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onComplete}
          className="h-6 w-6 rounded-lg border-[oklch(0.915_0.003_265)] data-[state=checked]:bg-[oklch(0.205_0.015_265)] data-[state=checked]:border-[oklch(0.205_0.015_265)] transition-all cursor-pointer"
        />
      </motion.div>

      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {task.is_auto_generated && (
                <Badge className="bg-[oklch(0.205_0.015_265)] text-white border-0 text-[8px] font-black uppercase tracking-[0.2em] px-2 h-5 rounded-full">
                  Automated
                </Badge>
              )}
              <div className={cn(
                'flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest',
                typeConfig.color,
                'bg-white'
              )}>
                <Icon className="h-3 w-3" />
                {typeConfig.label}
              </div>
            </div>
            
            <motion.h3
              className={cn(
                'text-lg font-black tracking-tight leading-tight',
                isCompleted ? 'line-through text-[oklch(0.45_0.008_265)]' : 'text-[oklch(0.145_0.015_265)]'
              )}
            >
              {task.title}
            </motion.h3>
            
            {task.description && (
              <p className={cn(
                'text-sm font-medium mt-1 line-clamp-2 transition-all',
                isCompleted ? 'text-[oklch(0.708_0.01_265)]' : 'text-[oklch(0.45_0.008_265)]'
              )}>
                {task.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-[oklch(0.915_0.003_265)] hover:text-[oklch(0.145_0.015_265)] hover:bg-[oklch(0.965_0.003_265)] rounded-xl transition-all"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-[oklch(0.915_0.003_265)] p-2 shadow-2xl min-w-[180px]">
              <DropdownMenuItem onClick={onEdit} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 cursor-pointer">
                <Pencil className="mr-3 h-4 w-4 text-[oklch(0.45_0.008_265)]" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onComplete} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 cursor-pointer">
                <CheckCircle2 className="mr-3 h-4 w-4 text-[oklch(0.45_0.008_265)]" />
                {isCompleted ? 'Reopen Task' : 'Mark Complete'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-[oklch(0.965_0.003_265)]" />
              <DropdownMenuItem
                onClick={onDelete}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 text-[oklch(0.55_0.2_25)] focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {task.donor && (
            <Link href={`/missionary-dashboard/donors?selected=${task.donor.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[oklch(0.985_0.002_265)] border border-[oklch(0.915_0.003_265)] hover:bg-white hover:border-[oklch(0.205_0.015_265)] transition-all cursor-pointer group/donor"
              >
                <Avatar className="h-5 w-5 border-2 border-white shadow-sm">
                  <AvatarImage src={task.donor.avatar_url || undefined} />
                  <AvatarFallback className="text-[8px] font-black bg-[oklch(0.915_0.003_265)] text-[oklch(0.45_0.008_265)]">
                    {task.donor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-black text-[oklch(0.45_0.008_265)] uppercase tracking-widest group-hover/donor:text-[oklch(0.145_0.015_265)] transition-colors">
                  {task.donor.name}
                </span>
              </motion.div>
            </Link>
          )}

          {dueDateStatus && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-sm',
              dueDateStatus.color.includes('rose') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-[oklch(0.985_0.002_265)] border-[oklch(0.915_0.003_265)] text-[oklch(0.45_0.008_265)]'
            )}>
              <Clock className="h-3.5 w-3.5" />
              {dueDateStatus.label}
            </div>
          )}

          {task.priority !== 'none' && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-sm',
              priorityConfig.badgeColor
            )}>
              <Sparkles className="h-3.5 w-3.5" />
              {priorityConfig.label} Priority
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
