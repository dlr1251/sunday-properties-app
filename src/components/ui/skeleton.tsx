import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  shimmer?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', shimmer = true, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'rounded-lg bg-muted',
        shimmer
          ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent'
          : 'animate-pulse',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  )
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;


