'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardAction,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, AlertCircle, Inbox } from 'lucide-react'

// --- ChartCard ---

interface ChartCardProps extends React.ComponentProps<typeof Card> {
  title: string
  description?: string
  actions?: React.ReactNode
  footer?: React.ReactNode
  isLoading?: boolean
  isEmpty?: boolean
  isError?: boolean
  errorTitle?: string
  errorMessage?: string
  emptyMessage?: string
  emptyCTA?: React.ReactNode
  children: React.ReactNode
}

export function ChartCard({
  title,
  description,
  actions,
  footer,
  isLoading,
  isEmpty,
  isError,
  errorTitle = 'Failed to load chart',
  errorMessage = 'There was an error loading the data.',
  emptyMessage = 'No data available to display.',
  emptyCTA,
  children,
  className,
  ...props
}: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      <CardHeader className={actions ? 'has-data-[slot=card-action]:grid-cols-[1fr_auto]' : undefined}>
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground/70 uppercase">
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      <CardContent className="min-h-[200px] flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-destructive/10 p-3 rounded-full mb-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{errorTitle}</h3>
            <p className="text-xs text-muted-foreground max-w-[200px]">{errorMessage}</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-muted p-3 rounded-full mb-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">{emptyMessage}</p>
            {emptyCTA}
          </div>
        ) : (
          <div className="w-full h-full animate-in fade-in duration-500">
            {children}
          </div>
        )}
      </CardContent>
      {footer && <CardFooter className="border-t bg-muted/5 py-3">{footer}</CardFooter>}
    </Card>
  )
}

// --- ChartLegend ---

interface LegendItem {
  label: string
  color: string
  value?: string | number
}

interface ChartLegendProps {
  items: LegendItem[]
  className?: string
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-6 gap-y-2', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 group">
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              {item.label}
            </span>
            {item.value !== undefined && (
              <span className="text-xs font-bold">{item.value}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// --- ChartTooltip ---

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-xl p-3 min-w-[120px] animate-in fade-in zoom-in-95 duration-200">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 border-b border-zinc-50 pb-1.5">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.color || item.fill }}
              />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-bold text-zinc-900 tabular-nums">
              {typeof item.value === 'number' ? `$${item.value.toLocaleString()}` : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- KpiTile ---

interface KpiTileProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: React.ElementType
  delta?: {
    value: string | number
    trend: 'up' | 'down' | 'neutral'
    label?: string
  }
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  className?: string
}

export function KpiTile({
  label,
  value,
  subtitle,
  icon: Icon,
  delta,
  isLoading,
  isError,
  isEmpty,
  className,
}: KpiTileProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-40" />
      </Card>
    )
  }

  return (
    <Card className={cn('relative overflow-hidden group hover:border-zinc-300 transition-colors', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {isEmpty ? '--' : value}
              </h3>
              {delta && !isEmpty && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "h-5 px-1.5 text-[10px] font-bold border-none",
                    delta.trend === 'up' && "bg-emerald-50 text-emerald-700",
                    delta.trend === 'down' && "bg-rose-50 text-rose-700",
                    delta.trend === 'neutral' && "bg-zinc-100 text-zinc-600"
                  )}
                >
                  {delta.trend === 'up' && <TrendingUp className="mr-1 h-3 w-3" />}
                  {delta.trend === 'down' && <TrendingDown className="mr-1 h-3 w-3" />}
                  {delta.value}
                </Badge>
              )}
            </div>
            {(subtitle || (delta?.label && !isEmpty)) && (
              <p className="text-xs text-muted-foreground font-medium">
                {subtitle} {delta?.label && <span className="opacity-70">{delta.label}</span>}
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
              <Icon className="h-5 w-5 text-zinc-600" />
            </div>
          )}
        </div>
        {isError && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center p-4 text-center">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-semibold">Error loading data</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
