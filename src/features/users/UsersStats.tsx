import React from 'react';
import StatGrid from '../../components/data/StatGrid';
import StatCard from '../../components/data/StatCard';

export type UsersStatsProps = {
  stats?: { [k: string]: number } | null;
  isLoading?: boolean;
};

export function UsersStats(props: UsersStatsProps) {
  const { stats, isLoading } = props;
  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-2">Loading stats…</div>;
  }
  if (!stats) return null;
  return (
    <StatGrid>
      <StatCard label="Total users" value={stats.total_users ?? 0} variant="gray" />
      <StatCard label="Super admins" value={stats.super_admins ?? 0} variant="secondary" />
      <StatCard label="Admins" value={stats.admins ?? 0} variant="secondary" />
      <StatCard label="Agents" value={stats.agents ?? 0} variant="secondary" />
      <StatCard label="Verified" value={stats.verified_users ?? 0} variant="primary" />
      <StatCard label="Unverified" value={stats.unverified_users ?? 0} variant="gray" />
    </StatGrid>
  );
}

export default UsersStats;


