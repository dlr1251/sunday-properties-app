import React from 'react';
import { Skeleton } from './ui/skeleton';

interface PropertyCardSkeletonProps {
  className?: string;
}

export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden ${className}`}>
      {/* Image Skeleton - Aspect ratio matching PropertyCard */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-4/5" />
        
        {/* Location */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-4 w-3/5" />
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-6" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-6" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Grid skeleton for loading multiple cards
export const PropertyGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};
