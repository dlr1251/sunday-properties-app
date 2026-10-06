import React, { useEffect, useState } from 'react';
import { useSuperAdminDashboard } from '../../../hooks/admin/useAdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Users,
  Home,
  Handshake,
  FileText,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Crown,
  Scale,
  Briefcase,
  Activity,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber } from '../../../utils/format';

export function SuperAdminOverview() {
  const { t } = useTranslation();
  const { stats, recentActivity, loading, error, refetch } = useSuperAdminDashboard();
  const navigate = useNavigate();
  const [quickStats, setQuickStats] = useState({
    pendingVerifications: 0,
    pendingProperties: 0,
    activeNegotiations: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    // Fetch additional quick stats
    const fetchQuickStats = async () => {
      // This would be implemented with actual API calls
      // For now, using the stats from the hook
      setQuickStats({
        pendingVerifications: stats?.pendingVerifications || 0,
        pendingProperties: stats?.pendingProperties || 0,
        activeNegotiations: stats?.activeNegotiations || 0,
        unreadMessages: 0 // Would need to fetch from chats
      });
    };
    fetchQuickStats();
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 text-lg mb-4">{t('admin.loadDashboardError')}</p>
          <Button onClick={refetch} variant="outline">
            {t('common.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.verifiedUsersCount', { count: formatNumber(stats?.verifiedUsers || 0) })}
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <Badge variant="outline">{t('admin.lawyersCount', { count: stats?.lawyerUsers || 0 })}</Badge>
              <Badge variant="outline">{t('admin.adminsCount', { count: stats?.adminUsers || 0 })}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.properties')}</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.activeProperties || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.pendingCount', { count: formatNumber(stats?.pendingProperties || 0) })}
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <Badge variant="outline">{t('admin.soldCount', { count: formatNumber(stats?.soldProperties || 0) })}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('negotiations.title')}</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.activeNegotiations || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.completedCount', { count: formatNumber(stats?.completedNegotiations || 0) })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              {t('admin.revenueThisMonth')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.quickActions')}</CardTitle>
          <CardDescription>{t('admin.quickActionsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/dashboard?tab=users')}
            >
              <Users className="h-5 w-5 mb-2" />
              <span>{t('admin.createUser')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/dashboard?tab=properties')}
            >
              <Home className="h-5 w-5 mb-2" />
              <span>{t('admin.managePropertiesTitle')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/dashboard?tab=negotiations')}
            >
              <Handshake className="h-5 w-5 mb-2" />
              <span>{t('admin.viewNegotiations')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/dashboard?tab=verifications')}
            >
              <Shield className="h-5 w-5 mb-2" />
              <span>{t('admin.verifications')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              {t('admin.requiresAttention')}
            </CardTitle>
            <CardDescription>{t('admin.pendingReviewItems')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickStats.pendingVerifications > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">{t('admin.pendingVerifications')}</span>
                </div>
                <Badge variant="destructive">{quickStats.pendingVerifications}</Badge>
              </div>
            )}
            {quickStats.pendingProperties > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{t('admin.pendingProperties')}</span>
                </div>
                <Badge variant="default">{quickStats.pendingProperties}</Badge>
              </div>
            )}
            {quickStats.activeNegotiations > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{t('admin.activeNegotiations')}</span>
                </div>
                <Badge variant="outline">{quickStats.activeNegotiations}</Badge>
              </div>
            )}
            {quickStats.pendingVerifications === 0 && quickStats.pendingProperties === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('admin.noPendingItems')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              {t('admin.recentActivity')}
            </CardTitle>
            <CardDescription>{t('admin.recentActivityDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="mt-1">
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.status === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{activity.message || t('admin.systemActivity')}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp || t('admin.now')}</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('profile.noRecentActivity')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
              {t('admin.systemHealth')}
            </CardTitle>
            <CardDescription>{t('admin.systemHealthDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">{t('admin.uptime')}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">1.2s</div>
              <div className="text-sm text-gray-600">{t('admin.avgResponseTime')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {formatNumber(stats?.totalUsers || 0)}
              </div>
              <div className="text-sm text-gray-600">{t('admin.activeUsers')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

