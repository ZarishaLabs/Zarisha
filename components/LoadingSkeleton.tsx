export default function LoadingSkeleton({ type = 'card' }: { type?: 'card' | 'page' | 'list' }) {
  if (type === 'card') {
    return (
      <div className="card animate-pulse">
        {/* Poster skeleton */}
        <div className="aspect-[3/4] bg-surface rounded-t-card" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="h-5 bg-surface rounded w-3/4" />
          
          {/* Secondary title */}
          <div className="h-4 bg-surface rounded w-1/2" />
          
          {/* Metadata */}
          <div className="flex justify-between">
            <div className="h-4 bg-surface rounded w-1/4" />
            <div className="h-4 bg-surface rounded w-1/4" />
          </div>
          
          {/* Tags */}
          <div className="flex gap-2">
            <div className="h-6 bg-surface rounded-full w-16" />
            <div className="h-6 bg-surface rounded-full w-20" />
            <div className="h-6 bg-surface rounded-full w-12" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 bg-surface rounded w-full" />
            <div className="h-3 bg-surface rounded w-5/6" />
          </div>
          
          {/* Buttons */}
          <div className="flex justify-between pt-2">
            <div className="h-10 bg-surface rounded w-24" />
            <div className="h-10 bg-surface rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Hero section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aspect-[3/4] bg-surface rounded-card" />
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-surface rounded w-3/4" />
            <div className="h-4 bg-surface rounded w-1/2" />
            <div className="h-20 bg-surface rounded" />
            <div className="flex gap-2">
              <div className="h-8 bg-surface rounded-full w-20" />
              <div className="h-8 bg-surface rounded-full w-24" />
              <div className="h-8 bg-surface rounded-full w-16" />
            </div>
          </div>
        </div>
        
        {/* Episodes section */}
        <div className="space-y-4">
          <div className="h-6 bg-surface rounded w-32" />
          <div className="grid grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square bg-surface rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-4 flex gap-4">
            <div className="w-20 h-20 bg-surface rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-surface rounded w-1/2" />
              <div className="h-4 bg-surface rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
