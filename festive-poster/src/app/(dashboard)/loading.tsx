import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 fade-in">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 rounded-lg shimmer" />
        <div className="h-4 w-96 rounded-md shimmer" />
      </div>

      {/* Grid skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border-subtle bg-[#120D23]/40 overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Image placeholder */}
            <div className="aspect-square w-full shimmer" />
            {/* Body placeholder */}
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded shimmer" />
                <div className="h-3 w-16 rounded shimmer" />
              </div>
              <div className="h-5 w-40 rounded shimmer" />
              <div className="h-3 w-full rounded shimmer" />
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-border-subtle/50">
                <div className="h-8 rounded-lg shimmer" />
                <div className="h-8 rounded-lg shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
