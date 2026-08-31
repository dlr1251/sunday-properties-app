import React from 'react';
import { useTranslation } from 'react-i18next';
import StatGrid from '../../components/data/StatGrid';
import StatCard from '../../components/data/StatCard';

export type UsersStatsProps = {
  stats?: { [k: string]: number } | null;
  isLoading?: boolean;
};

export function UsersStats(props: UsersStatsProps) {
  const { t } = useTranslation();
  const { stats, isLoading } = props;
  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-2">{t('admin.loadingStats')}</div>;
  }
  if (!stats) return null;
  return (
    <StatGrid>
      <StatCard label={t('admin.totalUsers')} value={stats.total_users ?? 0} variant="gray" />
      <StatCard label={t('admin.superAdmins')} value={stats.super_admins ?? 0} variant="secondary" />
      <StatCard label={t('admin.admins')} value={stats.admins ?? 0} variant="secondary" />
      <StatCard label={t('admin.agents')} value={stats.agents ?? 0} variant="secondary" />
      <StatCard label={t('admin.verifiedCount')} value={stats.verified_users ?? 0} variant="primary" />
      <StatCard label={t('admin.unverified')} value={stats.unverified_users ?? 0} variant="gray" />
    </StatGrid>
  );
}

export default UsersStats;
