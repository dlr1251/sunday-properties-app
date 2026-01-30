import React from 'react';
import StatGrid from '../../components/data/StatGrid';
import StatCard from '../../components/data/StatCard';

export type VisitsStatsProps = {
  stats?: Record<string, number> | null;
  isLoading?: boolean;
};

export function VisitsStats(props: VisitsStatsProps) {
  const { stats, isLoading } = props;
  if (isLoading) return <div className="text-sm text-muted-foreground py-2">Loading stats…</div>;
  if (!stats) return null;
  return (
    <StatGrid>
      <StatCard label="Total" value={stats.total ?? 0} variant="gray" />
      <StatCard label="Pending" value={stats.pending ?? 0} variant="secondary" />
      <StatCard label="Confirmed" value={stats.confirmed ?? 0} variant="primary" />
      <StatCard label="Completed" value={stats.completed ?? 0} variant="primary" />
      <StatCard label="Cancelled" value={stats.cancelled ?? 0} variant="gray" />
    </StatGrid>
  );
}

export default VisitsStats;

