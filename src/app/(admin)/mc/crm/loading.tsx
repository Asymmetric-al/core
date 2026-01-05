import { PageHeaderSkeleton, TableSkeleton } from '@/features/mission-control/components/patterns/skeletons'

export default function Loading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeaderSkeleton />
      <div className="flex-1 p-6 lg:p-8">
        <TableSkeleton rows={8} />
      </div>
    </div>
  )
}
