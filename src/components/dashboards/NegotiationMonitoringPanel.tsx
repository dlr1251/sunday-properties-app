import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAdminNegotiations } from '../../hooks/admin/useAdminNegotiations';
import { toast } from 'sonner';

interface NegotiationMonitoringPanelProps {
  onViewNegotiation?: (negotiationId: string) => void;
}

export function NegotiationMonitoringPanel({ onViewNegotiation }: NegotiationMonitoringPanelProps) {
  const {
    negotiations,
    loading,
    error,
    totalCount,
    fetchNegotiations,
    interveneNegotiation,
    getStats,
    exportNegotiations
  } = useAdminNegotiations();

  const [filters, setFilters] = useState({
    status: 'all',
    property_type: 'all',
    search: ''
  });
  const [showInterveneDialog, setShowInterveneDialog] = useState(false);
  const [interventionAction, setInterventionAction] = useState<'accept' | 'reject' | null>(null);
  const [interventionReason, setInterventionReason] = useState('');
  const [selectedNegotiationId, setSelectedNegotiationId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchNegotiations(filters);
  }, [filters]);

  const handleIntervention = async () => {
    if (!selectedNegotiationId || !interventionAction || !interventionReason.trim()) return;

    setActionLoading(selectedNegotiationId);
    const result = await interveneNegotiation(selectedNegotiationId, interventionAction, interventionReason);
    if (result.success) {
      setShowInterveneDialog(false);
      setInterventionReason('');
      setSelectedNegotiationId(null);
      setInterventionAction(null);
    } else {
      toast.error(result.error || 'Error en la intervención');
    }
    setActionLoading(null);
  };

  const getStatusBadgeColor = (status: string, isExpiringSoon?: boolean) => {
    if (isExpiringSoon) {
      return 'bg-orange-100 text-orange-800';
    }

    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      counter_offered: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string, isExpiringSoon?: boolean) => {
    if (isExpiringSoon) return 'Expirando Pronto';

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      expired: 'Expirada',
      counter_offered: 'Contraoferta'
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getNegotiationDiscount = (offerAmount: number, propertyPrice: number) => {
    if (!propertyPrice) return 0;
    return ((propertyPrice - offerAmount) / propertyPrice) * 100;
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoreo de Negociaciones</h2>
          <p className="text-muted-foreground">
            Supervisar y intervenir en negociaciones activas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchNegotiations(filters)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={exportNegotiations}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Negociaciones Activas</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Aceptadas</p>
              <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="mx-auto h-8 w-8 text-orange-500 mb-2" />
              <p className="text-sm text-muted-foreground">Expirando Pronto</p>
              <p className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="mx-auto h-8 w-8 text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">Valor Promedio</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.avgOffer)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {stats.expiringSoon > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">
                  {stats.expiringSoon} negociación{stats.expiringSoon !== 1 ? 'es' : ''} expirando en menos de 24 horas
                </h3>
                <p className="text-sm text-orange-700">
                  Revisa estas negociaciones antes de que expiren automáticamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Propiedad, comprador, vendedor..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="accepted">Aceptadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="counter_offered">Contraofertas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Propiedad</Label>
              <Select value={filters.property_type} onValueChange={(value) => setFilters(prev => ({ ...prev, property_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="office">Oficina</SelectItem>
                  <SelectItem value="land">Terreno</SelectItem>
                  <SelectItem value="commercial">Local Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    status: 'all',
                    property_type: 'all',
                    search: ''
                  });
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Negotiations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Negociaciones ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : negotiations.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron negociaciones</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propiedad</TableHead>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {negotiations.map((negotiation) => {
                  const discount = getNegotiationDiscount(negotiation.amount, negotiation.property_price || 0);

                  return (
                    <TableRow key={negotiation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-xs">{negotiation.property_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(negotiation.property_price || 0)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(negotiation.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {discount > 0 ? `${discount.toFixed(1)}% descuento` : 'Sin descuento'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{negotiation.buyer_name}</p>
                          <p className="text-sm text-muted-foreground">{negotiation.buyer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{negotiation.seller_name}</p>
                          <p className="text-sm text-muted-foreground">{negotiation.seller_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadgeColor(negotiation.status, negotiation.is_expiring_soon)}>
                            {getStatusLabel(negotiation.status, negotiation.is_expiring_soon)}
                          </Badge>
                          {negotiation.attachments_count && negotiation.attachments_count > 0 && (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <p>{new Date(negotiation.created_at).toLocaleDateString('es-CO')}</p>
                        <p className="text-muted-foreground">
                          {negotiation.days_since_offer} día{negotiation.days_since_offer !== 1 ? 's' : ''} atrás
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewNegotiation?.(negotiation.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {negotiation.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedNegotiationId(negotiation.id);
                                  setInterventionAction('accept');
                                  setShowInterveneDialog(true);
                                }}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedNegotiationId(negotiation.id);
                                  setInterventionAction('reject');
                                  setShowInterveneDialog(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Intervention Dialog */}
      <Dialog open={showInterveneDialog} onOpenChange={setShowInterveneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {interventionAction === 'accept' ? 'Aceptar Negociación' : 'Rechazar Negociación'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="intervention-reason">Razón de la intervención *</Label>
              <Textarea
                id="intervention-reason"
                placeholder="Explica por qué intervienes en esta negociación..."
                value={interventionReason}
                onChange={(e) => setInterventionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className={`bg-${interventionAction === 'accept' ? 'green' : 'red'}-50 border border-${interventionAction === 'accept' ? 'green' : 'red'}-200 rounded p-3`}>
              <p className={`text-sm text-${interventionAction === 'accept' ? 'green' : 'red'}-800`}>
                Esta acción {interventionAction === 'accept' ? 'cerrará la negociación y marcará la propiedad como vendida' : 'rechazará la oferta permanentemente'}.
                Los usuarios involucrados serán notificados.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterveneDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant={interventionAction === 'accept' ? 'default' : 'destructive'}
              onClick={handleIntervention}
              disabled={!interventionReason.trim() || actionLoading === selectedNegotiationId}
            >
              {actionLoading === selectedNegotiationId ? 'Procesando...' : 
               interventionAction === 'accept' ? 'Aceptar Negociación' : 'Rechazar Negociación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NegotiationMonitoringPanel;
