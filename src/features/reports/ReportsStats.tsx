import React from 'react';
import StatGrid from '../../components/data/StatGrid';
import StatCard from '../../components/data/StatCard';

export type ReportsStatsProps = {
  stats?: Record<string, number> | null;
  isLoading?: boolean;
};

export function ReportsStats(props: ReportsStatsProps) {
  const { stats, isLoading } = props;
  if (isLoading) return <div className="text-sm text-muted-foreground py-2">Loading stats…</div>;
  if (!stats) return null;
  return (
    <StatGrid>
      <StatCard label="Total" value={stats.total ?? 0} variant="gray" />
      <StatCard label="Pending" value={stats.pending ?? 0} variant="secondary" />
      <StatCard label="Resolved" value={stats.resolved ?? 0} variant="primary" />
      <StatCard label="Dismissed" value={stats.dismissed ?? 0} variant="gray" />
      <StatCard label="Escalated" value={stats.escalated ?? 0} variant="secondary" />
    </StatGrid>
  );
}

export default ReportsStats;


