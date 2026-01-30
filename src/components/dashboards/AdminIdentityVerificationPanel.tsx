import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { useAdminVerifications } from '../../hooks/admin/useAdminVerifications';
import { VerificationStatus } from '../../types/database';

interface VerificationRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  status: VerificationStatus;
  phone: string;
  location: string;
  date_of_birth: string;
  nationality: string;
  is_owner: boolean;
  has_poa: boolean;
  selfie_path?: string;
  id_doc_path?: string;
  poa_doc_path?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const AdminIdentityVerificationPanel: React.FC = () => {
  const {
    requests,
    loading,
    approveRequest,
    rejectRequest,
    refetch
  } = useAdminVerifications();

  console.log('AdminIdentityVerificationPanel - requests:', requests);
  console.log('AdminIdentityVerificationPanel - loading:', loading);

  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveRequest(requestId, reviewNotes);
      } else {
        await rejectRequest(requestId, 'Rechazada por administrador', reviewNotes);
      }
      setReviewDialogOpen(false);
      setReviewNotes('');
      setSelectedRequest(null);
      refetch();
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const openReviewDialog = (request: VerificationRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: VerificationStatus) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredVerifications = requests.filter(request => {
    const userName = request.user?.full_name || 'Usuario';
    const userEmail = request.user?.email || '';
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (request.data?.phone || '').includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(v => v.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              Total Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(v => v.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Rechazadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(v => v.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="status">Estado</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="approved">Aprobadas</SelectItem>
              <SelectItem value="rejected">Rechazadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Verification Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Solicitudes de Verificación de Identidad
          </CardTitle>
          <CardDescription>
            Revisa y aprueba las solicitudes de verificación de identidad de los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Usuario</th>
                  <th className="text-left p-4 font-medium">Información</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Fecha</th>
                  <th className="text-left p-4 font-medium">Documentos</th>
                  <th className="text-left p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVerifications.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{request.user?.full_name || 'Usuario'}</div>
                        <div className="text-sm text-muted-foreground">{request.user?.email || ''}</div>
                        <div className="text-sm text-muted-foreground">{request.data?.phone || ''}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{request.data?.location || ''}, {request.data?.nationality || ''}</div>
                        <div className="text-muted-foreground">
                          {request.data?.is_owner ? 'Propietario' : 'No propietario'}
                          {request.data?.has_poa && ', Con poder'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusBadgeVariant(request.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <FileText className="h-4 w-4" />
                        <span>
                          {[
                            request.selfie_path && 'Selfie',
                            request.id_doc_path && 'ID',
                            request.poa_doc_path && 'Poder'
                          ].filter(Boolean).join(', ') || 'Sin documentos'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => openReviewDialog(request, 'approve')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openReviewDialog(request, 'reject')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVerifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron solicitudes de verificación
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Aprobar Verificación' : 'Rechazar Verificación'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? 'Confirma que deseas aprobar esta solicitud de verificación.'
                : 'Indica el motivo del rechazo de esta solicitud.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-medium">{selectedRequest.user?.full_name || 'Usuario'}</div>
                <div className="text-sm text-muted-foreground">{selectedRequest.user?.email || ''}</div>
              </div>

              {reviewAction === 'reject' && (
                <div>
                  <Label htmlFor="notes">Motivo del rechazo</Label>
                  <Textarea
                    id="notes"
                    placeholder="Explica por qué se rechaza esta solicitud..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {reviewAction === 'approve' && (
                <div>
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Comentarios sobre la aprobación..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleReview(selectedRequest.id, reviewAction)}
                  variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                >
                  {reviewAction === 'approve' ? 'Aprobar' : 'Rechazar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!selectedRequest && !reviewDialogOpen} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Verificación</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de verificación
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Nombre</Label>
                  <p className="text-sm">{selectedRequest.user?.full_name || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p className="text-sm">{selectedRequest.user?.email || ''}</p>
                </div>
                <div>
                  <Label className="font-medium">Teléfono</Label>
                  <p className="text-sm">{selectedRequest.data?.phone || ''}</p>
                </div>
                <div>
                  <Label className="font-medium">Fecha de Nacimiento</Label>
                  <p className="text-sm">{selectedRequest.data?.date_of_birth || ''}</p>
                </div>
                <div>
                  <Label className="font-medium">Ubicación</Label>
                  <p className="text-sm">{selectedRequest.data?.location || ''}</p>
                </div>
                <div>
                  <Label className="font-medium">Nacionalidad</Label>
                  <p className="text-sm">{selectedRequest.data?.nationality || ''}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRequest.data?.is_owner || false}
                    readOnly
                    className="rounded"
                  />
                  <Label>Es propietario</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRequest.data?.has_poa || false}
                    readOnly
                    className="rounded"
                  />
                  <Label>Tiene poder</Label>
                </div>
              </div>

              <div>
                <Label className="font-medium">Documentos Adjuntos</Label>
                <div className="mt-2 space-y-2">
                  {selectedRequest.selfie_path && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>Foto de rostro: Disponible</span>
                    </div>
                  )}
                  {selectedRequest.id_doc_path && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>Documento de identidad: Disponible</span>
                    </div>
                  )}
                  {selectedRequest.poa_doc_path && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>Poder notarial: Disponible</span>
                    </div>
                  )}
                  {!selectedRequest.selfie_path && !selectedRequest.id_doc_path && !selectedRequest.poa_doc_path && (
                    <p className="text-sm text-muted-foreground">No hay documentos adjuntos</p>
                  )}
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <Label className="font-medium">Notas</Label>
                  <p className="text-sm mt-1">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
