import React from 'react';
import { useTranslation } from 'react-i18next';
import StatGrid from '../../components/data/StatGrid';
import StatCard from '../../components/data/StatCard';

export type VerificationStatsProps = {
  stats?: Record<string, number> | null;
  isLoading?: boolean;
};

export function VerificationStats(props: VerificationStatsProps) {
  const { t } = useTranslation();
  const { stats, isLoading } = props;
  if (isLoading) return <div className="text-sm text-muted-foreground py-2">{t('admin.loadingStats')}</div>;
  if (!stats) return null;
  return (
    <StatGrid>
      <StatCard label={t('admin.total')} value={stats.total ?? 0} variant="gray" />
      <StatCard label={t('admin.pendingPlural')} value={stats.pending ?? 0} variant="secondary" />
      <StatCard label={t('admin.approvedPlural')} value={stats.approved ?? 0} variant="primary" />
      <StatCard label={t('admin.rejectedPlural')} value={stats.rejected ?? 0} variant="gray" />
    </StatGrid>
  );
}

export default VerificationStats;
