import React from 'react';
import { useTranslation } from 'react-i18next';
import StatGrid from '../../components/data/StatGrid';
import StatCard from '../../components/data/StatCard';

export type ReportsStatsProps = {
  stats?: Record<string, number> | null;
  isLoading?: boolean;
};

export function ReportsStats(props: ReportsStatsProps) {
  const { t } = useTranslation();
  const { stats, isLoading } = props;
  if (isLoading) return <div className="text-sm text-muted-foreground py-2">{t('admin.loadingStats')}</div>;
  if (!stats) return null;
  return (
    <StatGrid>
      <StatCard label={t('admin.total')} value={stats.total ?? 0} variant="gray" />
      <StatCard label={t('admin.pendingPlural')} value={stats.pending ?? 0} variant="secondary" />
      <StatCard label={t('admin.resolved')} value={stats.resolved ?? 0} variant="primary" />
      <StatCard label={t('admin.dismissed')} value={stats.dismissed ?? 0} variant="gray" />
      <StatCard label={t('admin.escalated')} value={stats.escalated ?? 0} variant="secondary" />
    </StatGrid>
  );
}

export default ReportsStats;
