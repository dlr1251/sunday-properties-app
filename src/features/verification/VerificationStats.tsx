import React from 'react';
import StatGrid from '../../components/data/StatGrid';
import StatCard from '../../components/data/StatCard';

export type VerificationStatsProps = {
  stats?: Record<string, number> | null;
  isLoading?: boolean;
};

export function VerificationStats(props: VerificationStatsProps) {
  const { stats, isLoading } = props;
  if (isLoading) return <div className="text-sm text-muted-foreground py-2">Loading stats…</div>;
  if (!stats) return null;
  return (
    <StatGrid>
      <StatCard label="Total" value={stats.total ?? 0} variant="gray" />
      <StatCard label="Pending" value={stats.pending ?? 0} variant="secondary" />
      <StatCard label="Approved" value={stats.approved ?? 0} variant="primary" />
      <StatCard label="Rejected" value={stats.rejected ?? 0} variant="gray" />
    </StatGrid>
  );
}

export default VerificationStats;

