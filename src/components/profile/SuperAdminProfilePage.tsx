import { getIntlLocale } from '../../i18n';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSuperAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProfileSection } from '../dashboards/ProfileSection';
import {
  Shield,
  Users,
  Home,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
  Plus,
  MessageSquare,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  Star,
  Award,
  Briefcase,
  Building2,
  UserCheck,
  UserX,
  Crown
} from 'lucide-react';

// Import management panels
import { UsersPanel } from '../../features/users';
import { LawyersManagementPanel } from './dashboards/LawyersManagementPanel';
import { AgentsManagementPanel } from './dashboards/AgentsManagementPanel';
import { DealsManagementPanel } from './dashboards/DealsManagementPanel';
import { ReportsPanel } from '../../features/reports';
import { PlatformConfigPanel } from './dashboards/PlatformConfigPanel';
import { AdminsManagementPanel } from './dashboards/AdminsManagementPanel';
import { AdminVerificationPanel } from './dashboards/AdminVerificationPanel';
import { PropertyApprovalPanel } from './dashboards/PropertyApprovalPanel';
import { PropertyVerificationManagementPanel } from './dashboards/PropertyVerificationManagementPanel';

export const SuperAdminProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const { stats, recentActivity, loading, error, refetch } = useSuperAdminDashboard();
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(getIntlLocale()).format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-foreground text-lg mb-4">Error loading dashboard</p>
          <Button onClick={refetch} variant="outline" className="border-border text-muted-foreground">
            <RefreshCw className="h-4 w-4 mr-2 hmr-rotate" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border p-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Crown className="h-8 w-8 text-yellow-600" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Super Admin Control Center</h1>
                  <p className="text-muted-foreground text-sm">Complete system management and oversight</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="destructive" className="bg-red-600">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.totalUsers || 0)}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 text-xs text-green-600">
                {formatNumber(stats?.verifiedUsers || 0)} verified
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Properties</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.activeProperties || 0)}</p>
                </div>
                <Home className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 text-xs text-green-600">
                {formatNumber(stats?.pendingProperties || 0)} pending
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Negotiations</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.activeNegotiations || 0)}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2 text-xs text-orange-600">
                {formatNumber(stats?.completedNegotiations || 0)} completed
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-2 text-xs text-green-600">
                +12.5% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-12 bg-card border border-border">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Users</TabsTrigger>
                <TabsTrigger value="admins" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Admins</TabsTrigger>
                <TabsTrigger value="verification" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Verification</TabsTrigger>
                <TabsTrigger value="property-verifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Prop. Verifications</TabsTrigger>
                <TabsTrigger value="properties" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Properties</TabsTrigger>
                <TabsTrigger value="lawyers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Lawyers</TabsTrigger>
                <TabsTrigger value="agents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Agents</TabsTrigger>
                <TabsTrigger value="deals" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Deals</TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Reports</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Settings</TabsTrigger>
                <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Profile</TabsTrigger>
              </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Latest system events and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity?.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        {getStatusIcon(activity.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-green-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create New User
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border text-muted-foreground hover:bg-muted/30">
                    <Shield className="h-4 w-4 mr-2" />
                    Review Verifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border text-muted-foreground hover:bg-muted/30">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border text-muted-foreground hover:bg-muted/30">
                    <Settings className="h-4 w-4 mr-2" />
                    System Configuration
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  System Health Overview
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Platform performance and key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">1.2s</div>
                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">45</div>
                    <div className="text-sm text-muted-foreground">Active Sessions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users">
            <UsersPanel />
          </TabsContent>

              {/* Admins Management Tab */}
              <TabsContent value="admins">
                <AdminsManagementPanel isDarkMode={false} />
              </TabsContent>

              {/* Verification Management Tab */}
              <TabsContent value="verification">
                <AdminVerificationPanel isDarkMode={false} />
              </TabsContent>

              {/* Property Verifications Management Tab */}
              <TabsContent value="property-verifications">
                <PropertyVerificationManagementPanel />
              </TabsContent>

              {/* Property Approval Tab */}
              <TabsContent value="properties">
                <PropertyApprovalPanel isDarkMode={false} />
              </TabsContent>

          {/* Lawyers Management Tab */}
          <TabsContent value="lawyers">
            <LawyersManagementPanel isDarkMode={false} />
          </TabsContent>

          {/* Agents Management Tab */}
          <TabsContent value="agents">
            <AgentsManagementPanel isDarkMode={false} />
          </TabsContent>

          {/* Deals Management Tab */}
          <TabsContent value="deals">
            <DealsManagementPanel isDarkMode={false} />
          </TabsContent>

          {/* Reports Management Tab */}
          <TabsContent value="reports">
            <ReportsPanel />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <PlatformConfigPanel />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileSection isDarkMode={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
