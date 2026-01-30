import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { UserCheck, UserPlus, Settings, Building2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onTabChange?.('verifications')}
            >
              <UserCheck className="h-6 w-6" />
              <span>Review Verifications</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onTabChange?.('users')}
            >
              <UserPlus className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Settings className="h-6 w-6" />
              <span>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">User verification approved</p>
                <p className="text-xs text-gray-500">Carlos Rodríguez was verified 2 hours ago</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Approved
              </Badge>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New lawyer registered</p>
                <p className="text-xs text-gray-500">Dra. Ana López submitted verification 4 hours ago</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Pending
              </Badge>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New property listed</p>
                <p className="text-xs text-gray-500">Apartment in Zona G was approved 6 hours ago</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Approved
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

