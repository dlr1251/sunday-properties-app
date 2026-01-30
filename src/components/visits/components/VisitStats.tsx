import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RotateCcw 
} from 'lucide-react';

interface VisitStatsProps {
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

export const VisitStats: React.FC<VisitStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Confirmadas',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completadas',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Canceladas',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-700">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
