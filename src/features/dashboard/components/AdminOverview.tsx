import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { UserCheck, UserPlus, Settings, Building2 } from 'lucide-react';

type AdminOverviewProps = {
  stats: {
    totalUsers: number;
    totalProperties: number;
    pendingVerifications: number;
    totalRevenue: number;
  };
  onTabChange?: (tab: string) => void;
};

export function AdminOverview({ stats, onTabChange }: AdminOverviewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">{t('admin.quickActions')}</CardTitle>
          <CardDescription>{t('admin.quickActionsAdminDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onTabChange?.('verifications')}
            >
              <UserCheck className="h-6 w-6" />
              <span>{t('admin.reviewVerifications')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onTabChange?.('users')}
            >
              <UserPlus className="h-6 w-6" />
              <span>{t('admin.manageUsers')}</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Settings className="h-6 w-6" />
              <span>{t('admin.systemSettings')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">{t('admin.recentActivity')}</CardTitle>
          <CardDescription>{t('admin.recentActivityAdminDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('admin.activityUserVerified')}</p>
                <p className="text-xs text-gray-500">{t('admin.activityUserVerifiedHint', { name: 'Carlos Rodríguez' })}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {t('admin.approved')}
              </Badge>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('admin.activityLawyerRegistered')}</p>
                <p className="text-xs text-gray-500">{t('admin.activityLawyerRegisteredHint', { name: 'Dra. Ana López' })}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {t('admin.pending')}
              </Badge>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('admin.activityPropertyListed')}</p>
                <p className="text-xs text-gray-500">{t('admin.activityPropertyListedHint')}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {t('admin.approved')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
