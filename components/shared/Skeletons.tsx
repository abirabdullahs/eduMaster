import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-slate-800 rounded-xl", className)} />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] overflow-hidden p-6 space-y-6">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#161b22] border border-slate-800 rounded-[2rem] p-6 space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-8 h-4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ExamQuestionSkeleton() {
  return (
    <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-10 space-y-10">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
      <div className="flex justify-between pt-10">
        <Skeleton className="h-12 w-32 rounded-xl" />
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
    </div>
  );
}
