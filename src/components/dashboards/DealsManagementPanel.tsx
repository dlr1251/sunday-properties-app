import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Download, RefreshCw, Search, Filter, FileText, DollarSign, Calendar, Eye, Edit, Trash2, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useDeals } from '../../hooks/useDeals';

interface DealsManagementPanelProps {
  isDarkMode?: boolean;
}

export const DealsManagementPanel: React.FC<DealsManagementPanelProps> = ({ isDarkMode = false }) => {
  const {
    deals,
    loading,
    error,
    refetch,
    updateDeal,
    deleteDeal,
    stats
  } = useDeals();

  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as 'all' | 'draft' | 'active' | 'under_review' | 'completed' | 'cancelled',
    priority: 'all' as 'all' | 'low' | 'medium' | 'high' | 'urgent'
  });

  const filteredDeals = deals.filter(deal => {
    if (filters.search && !deal.property?.title?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !deal.buyer?.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !deal.seller?.name?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && deal.status !== filters.status) {
      return false;
    }
    if (filters.priority !== 'all' && deal.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'under_review': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const textClasses = isDarkMode ? "text-gray-300" : "text-gray-900";
  const subTextClasses = isDarkMode ? "text-gray-400" : "text-gray-500";
  const cardClasses = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${textClasses}`}>Gestión de Negociaciones</h2>
          <p className={subTextClasses}>Administra todas las ofertas y transacciones inmobiliarias</p>
        </div>

        <Button
          onClick={() => refetch()}
          disabled={loading}
          className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>Total Negociaciones</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>Activas</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.active || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>Completadas</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.completed || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>Valor Total</p>
                <p className={`text-2xl font-bold ${textClasses}`}>
                  {formatCurrency(stats?.total_value || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className={cardClasses}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${subTextClasses}`} />
                <Input
                  placeholder="Buscar por propiedad, comprador o vendedor..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value as any })}
              >
                <SelectTrigger className={`w-40 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="under_review">En revisión</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters({ ...filters, priority: value as any })}
              >
                <SelectTrigger className={`w-32 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className={cardClasses}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={`${getStatusColor(deal.status)} text-white`}>
                        {deal.status === 'completed' ? 'Completada' :
                         deal.status === 'active' ? 'Activa' :
                         deal.status === 'under_review' ? 'En Revisión' :
                         deal.status === 'cancelled' ? 'Cancelada' : 'Borrador'}
                      </Badge>
                      <Badge className={`${getPriorityColor(deal.priority)} text-white`}>
                        {deal.priority === 'urgent' ? 'Urgente' :
                         deal.priority === 'high' ? 'Alta' :
                         deal.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>

                    <h3 className={`font-semibold text-lg ${textClasses}`}>
                      {deal.property?.title || 'Propiedad sin título'}
                    </h3>
                    <p className={`text-sm ${subTextClasses}`}>
                      {deal.property?.address}, {deal.property?.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`text-2xl font-bold ${textClasses}`}>
                      {formatCurrency(deal.offer_price)}
                    </p>
                    <p className={`text-xs ${subTextClasses}`}>{deal.currency}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${textClasses}`}>Progreso</span>
                    <span className={`text-sm ${textClasses}`}>{deal.progress_percentage || 0}%</span>
                  </div>
                  <Progress value={deal.progress_percentage || 0} className="h-2" />
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${textClasses}`}>Comprador</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {deal.buyer?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`text-xs ${textClasses}`}>{deal.buyer?.name || 'Sin nombre'}</p>
                        <p className={`text-xs ${subTextClasses}`}>{deal.buyer?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className={`text-sm font-medium ${textClasses}`}>Vendedor</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {deal.seller?.name?.charAt(0) || 'V'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`text-xs ${textClasses}`}>{deal.seller?.name || 'Sin nombre'}</p>
                        <p className={`text-xs ${subTextClasses}`}>{deal.seller?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agents & Lawyers */}
                {(deal.agent || deal.lawyer) && (
                  <div className="flex space-x-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {deal.agent && (
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${textClasses}`}>Agente</p>
                        <p className={`text-xs ${subTextClasses}`}>{deal.agent.name}</p>
                      </div>
                    )}
                    {deal.lawyer && (
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${textClasses}`}>Abogado</p>
                        <p className={`text-xs ${subTextClasses}`}>{deal.lawyer.name}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500">
                    Creada {new Date(deal.created_at).toLocaleDateString('es-CO')}
                  </div>

                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDeal(deal.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && !loading && (
        <Card className={cardClasses}>
          <CardContent className="p-12 text-center">
            <FileText className={`h-12 w-12 ${subTextClasses} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium mb-2 ${textClasses}`}>No hay negociaciones</h3>
            <p className={subTextClasses}>Las negociaciones aparecerán aquí cuando se realicen ofertas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
