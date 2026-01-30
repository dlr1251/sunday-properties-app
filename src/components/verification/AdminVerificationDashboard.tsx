import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAdminVerifications } from '../../hooks/admin/useAdminVerifications';
import { storageService } from '../../services/storageService';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Aprobado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export const AdminVerificationDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'approved' | 'rejected',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkReason, setBulkReason] = useState('');

  const { requests, stats, loading, error, refetch, approveRequest, rejectRequest, bulkApprove, bulkReject, getSignedUrl } = useAdminVerifications(filters);

  const handleViewDocument = async (path: string, fileName: string) => {
    try {
      const signedUrl = await getSignedUrl(path);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error('No se pudo obtener acceso al documento');
      }
    } catch (error) {
      toast.error('Error accediendo al documento');
    }
  };

  const handleApprove = async (requestId: string, notes?: string) => {
    const result = await approveRequest(requestId, notes);
    if (result.ok) {
      toast.success('Solicitud aprobada exitosamente');
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    } else {
      toast.error(result.error.message);
    }
  };

  const handleReject = async (requestId: string, reason: string, notes?: string) => {
    const result = await rejectRequest(requestId, reason, notes);
    if (result.ok) {
      toast.success('Solicitud rechazada');
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    } else {
      toast.error(result.error.message);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRequests.length === 0) return;

    if (bulkAction === 'approve') {
      const result = await bulkApprove(selectedRequests, bulkNotes);
      if (result.ok) {
        toast.success(`${selectedRequests.length} solicitudes aprobadas`);
        setSelectedRequests([]);
        setBulkAction(null);
        setBulkNotes('');
      } else {
        toast.error(result.error.message);
      }
    } else if (bulkAction === 'reject') {
      if (!bulkReason.trim()) {
        toast.error('Debes especificar una razón para el rechazo');
        return;
      }
      const result = await bulkReject(selectedRequests, bulkReason, bulkNotes);
      if (result.ok) {
        toast.success(`${selectedRequests.length} solicitudes rechazadas`);
        setSelectedRequests([]);
        setBulkAction(null);
        setBulkReason('');
        setBulkNotes('');
      } else {
        toast.error(result.error.message);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSelectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map(r => r.id));
    }
  };

  const toggleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando solicitudes de verificación...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Verificaciones</h1>
          <p className="text-gray-700">Administra las solicitudes de verificación de usuarios</p>
        </div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Aprobadas</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Rechazadas</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Hoy</p>
                <p className="text-2xl font-bold">{stats.todaySubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
                <Input
                  placeholder="Buscar por email, nombre..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filters.status}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Desde"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full md:w-40"
            />

            <Input
              type="date"
              placeholder="Hasta"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full md:w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedRequests.length} solicitud(es) seleccionada(s)
              </span>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkAction('approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar Todas
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aprobar Solicitudes</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Notas adicionales (opcional)"
                        value={bulkNotes}
                        onChange={(e) => setBulkNotes(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setBulkAction(null);
                            setBulkNotes('');
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleBulkAction}>
                          Aprobar {selectedRequests.length} Solicitudes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkAction('reject')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar Todas
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rechazar Solicitudes</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Razón del rechazo"
                        value={bulkReason}
                        onChange={(e) => setBulkReason(e.target.value)}
                        required
                      />
                      <Textarea
                        placeholder="Notas adicionales (opcional)"
                        value={bulkNotes}
                        onChange={(e) => setBulkNotes(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setBulkAction(null);
                            setBulkReason('');
                            setBulkNotes('');
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleBulkAction}
                          disabled={!bulkReason.trim()}
                        >
                          Rechazar {selectedRequests.length} Solicitudes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Solicitudes de Verificación</CardTitle>
            <span className="text-sm text-gray-500">{requests.length} resultados</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">
                    <Checkbox
                      checked={selectedRequests.length === requests.length && requests.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4">Usuario</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-left p-4">Fecha</th>
                  <th className="text-left p-4">Documentos</th>
                  <th className="text-left p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={() => toggleSelectRequest(request.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{request.user?.full_name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-500">{request.user?.email}</p>
                        {request.user?.phone && (
                          <p className="text-sm text-gray-500">{request.user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[request.status].color}>
                        {statusConfig[request.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">{formatDate(request.created_at)}</p>
                        {request.reviewed_at && (
                          <p className="text-xs text-gray-500">
                            Revisado: {formatDate(request.reviewed_at)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {request.selfie_path && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(request.selfie_path!, 'Selfie')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        {request.id_doc_path && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(request.id_doc_path!, 'ID')}
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        )}
                        {request.poa_doc_path && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(request.poa_doc_path!, 'POA')}
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprobar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Aprobar Solicitud</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="Notas adicionales (opcional)"
                                    value={bulkNotes}
                                    onChange={(e) => setBulkNotes(e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setBulkNotes('')}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button onClick={() => handleApprove(request.id, bulkNotes)}>
                                      Aprobar Solicitud
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rechazar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rechazar Solicitud</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Razón del rechazo"
                                    value={bulkReason}
                                    onChange={(e) => setBulkReason(e.target.value)}
                                    required
                                  />
                                  <Textarea
                                    placeholder="Notas adicionales (opcional)"
                                    value={bulkNotes}
                                    onChange={(e) => setBulkNotes(e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setBulkReason('');
                                        setBulkNotes('');
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReject(request.id, bulkReason, bulkNotes)}
                                      disabled={!bulkReason.trim()}
                                    >
                                      Rechazar Solicitud
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}

                        {request.status !== 'pending' && request.notes && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Notas
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Notas de Revisión</DialogTitle>
                              </DialogHeader>
                              <div className="p-4">
                                <p className="whitespace-pre-wrap">{request.notes}</p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {requests.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
              <p className="text-gray-700">
                {filters.status !== 'all' || filters.search
                  ? 'No se encontraron solicitudes con los filtros aplicados'
                  : 'No hay solicitudes de verificación pendientes'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
