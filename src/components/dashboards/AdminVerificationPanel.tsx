import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  MessageSquare,
  User,
  Calendar,
  AlertCircle,
  Send,
  Clock,
  Download,
  Image as ImageIcon,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  data: any;
  selfie_path?: string;
  id_doc_path?: string;
  poa_doc_path?: string;
  is_owner: boolean;
  has_poa: boolean;
  notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  user_profile: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

interface AdminVerificationPanelProps {
  isDarkMode?: boolean;
}

export const AdminVerificationPanel: React.FC<AdminVerificationPanelProps> = ({
  isDarkMode = true
}) => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : '';

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles!verification_requests_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verification requests:', error);
        toast.error('Error al cargar solicitudes de verificación');
        return;
      }

      const formattedRequests = data?.map(req => ({
        ...req,
        user_profile: req.profiles || {}
      })) || [];

      setRequests(formattedRequests);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error inesperado al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = !searchTerm ||
      req.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="dark:bg-yellow-900 dark:text-yellow-100">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="success" className="dark:bg-green-900 dark:text-green-100">Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="dark:bg-red-900 dark:text-red-100">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error approving request:', error);
        toast.error('Error al aprobar la solicitud');
        return;
      }

      // Update user verification status
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase
          .from('profiles')
          .update({ verification_status: 'verified' })
          .eq('id', request.user_id);
      }

      toast.success('Solicitud aprobada exitosamente');
      setShowDetailsDialog(false);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error inesperado al aprobar');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!reviewNotes.trim()) {
      toast.error('Debe proporcionar una razón para el rechazo');
      return;
    }

    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
        toast.error('Error al rechazar la solicitud');
        return;
      }

      // Update user verification status
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase
          .from('profiles')
          .update({ verification_status: 'rejected' })
          .eq('id', request.user_id);
      }

      toast.success('Solicitud rechazada');
      setShowDetailsDialog(false);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error inesperado al rechazar');
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <Card className={cardClasses}>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className={`text-center mt-4 ${textPrimary}`}>Cargando solicitudes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle className={textPrimary}>Panel de Verificación de Administrador</CardTitle>
          <p className={textSecondary}>Gestiona las solicitudes de verificación de usuarios</p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Total</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.total}</p>
              </div>
              <FileText className={`h-8 w-8 ${textSecondary}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Pendientes</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Aprobadas</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Rechazadas</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className={cardClasses}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${inputClasses}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className={`h-4 w-4 ${textSecondary}`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={`px-3 py-2 rounded-md border ${inputClasses}`}
              >
                <option value="all">Todas</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
              </select>

              <Button
                onClick={fetchVerificationRequests}
                variant="outline"
                className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card className={cardClasses}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className={`font-semibold ${textPrimary}`}>
                          {request.user_profile?.full_name || 'Usuario sin nombre'}
                        </h3>
                        <p className={`text-sm ${textSecondary}`}>{request.user_profile?.email}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className={`text-sm ${textSecondary} mt-2`}>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(request.created_at).toLocaleDateString('es-CO')}
                        </span>
                        {request.is_owner && (
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            Propietario
                          </span>
                        )}
                        {request.has_poa && (
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            Poder
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsDialog(true);
                      }}
                      className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Revisar
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <FileText className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
                <p className={textPrimary}>No hay solicitudes que coincidan con los filtros</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedRequest && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <DialogHeader>
              <DialogTitle className={textPrimary}>
                Revisar Solicitud de Verificación
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* User Info */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-2 ${textPrimary}`}>Información del Usuario</h3>
                <div className="space-y-1 text-sm">
                  <p><span className={textSecondary}>Nombre:</span> {selectedRequest.user_profile?.full_name || 'N/A'}</p>
                  <p><span className={textSecondary}>Email:</span> {selectedRequest.user_profile?.email || 'N/A'}</p>
                  <p><span className={textSecondary}>Teléfono:</span> {selectedRequest.user_profile?.phone || 'N/A'}</p>
                  <p><span className={textSecondary}>Fecha de solicitud:</span> {new Date(selectedRequest.created_at).toLocaleString('es-CO')}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className={`font-semibold mb-3 ${textPrimary}`}>Documentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedRequest.selfie_path && (
                    <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <div className="flex items-center">
                        <ImageIcon className={`w-5 h-5 mr-2 ${textSecondary}`} />
                        <span className={`text-sm ${textPrimary}`}>Selfie</span>
                      </div>
                      <Button size="sm" variant="outline" className="mt-2 w-full">
                        <Download className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}

                  {selectedRequest.id_doc_path && (
                    <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <div className="flex items-center">
                        <FileText className={`w-5 h-5 mr-2 ${textSecondary}`} />
                        <span className={`text-sm ${textPrimary}`}>Documento ID</span>
                      </div>
                      <Button size="sm" variant="outline" className="mt-2 w-full">
                        <Download className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}

                  {selectedRequest.poa_doc_path && (
                    <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <div className="flex items-center">
                        <FileText className={`w-5 h-5 mr-2 ${textSecondary}`} />
                        <span className={`text-sm ${textPrimary}`}>Poder Notarial</span>
                      </div>
                      <Button size="sm" variant="outline" className="mt-2 w-full">
                        <Download className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Actions */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <h3 className={`font-semibold mb-3 ${textPrimary}`}>Revisar Solicitud</h3>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                        Notas de revisión (obligatorio para rechazos)
                      </label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Comentarios sobre la revisión..."
                        className={inputClasses}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(selectedRequest.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprobar
                      </Button>

                      <Button
                        onClick={() => handleReject(selectedRequest.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${textPrimary}`}>Estado de la Revisión</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(selectedRequest.status)}
                    {selectedRequest.reviewed_at && (
                      <span className={`text-sm ${textSecondary}`}>
                        Revisado el {new Date(selectedRequest.reviewed_at).toLocaleString('es-CO')}
                      </span>
                    )}
                  </div>
                  {selectedRequest.notes && (
                    <div>
                      <p className={`text-sm font-medium mb-1 ${textPrimary}`}>Notas:</p>
                      <p className={`text-sm ${textSecondary}`}>{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminVerificationPanel;
