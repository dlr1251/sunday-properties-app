import React from 'react';

export type StatGridProps = {
  children: React.ReactNode;
  className?: string;
};

export function StatGrid(props: StatGridProps) {
  const { children, className } = props;
  return <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className ?? ''}`}>{children}</div>;
}

export default StatGrid;


