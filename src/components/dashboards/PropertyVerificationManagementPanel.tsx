import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle, RefreshCw, MessageSquare, FileText, Home } from 'lucide-react';
import { usePropertyVerifications } from '../../hooks/properties/usePropertyVerifications';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPropertyApprovalConversation } from '../../utils/createPropertyApprovalConversation';

export const PropertyVerificationManagementPanel: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  // Fetch all verifications (no userId filter for admin)
  const { verifications, loading, error, refetch } = usePropertyVerifications();

  const filteredVerifications = verifications.filter(v => 
    filterStatus === 'all' || v.status === filterStatus
  );

  const handleApprove = async () => {
    if (!selectedVerification) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update verification status
      const { error: updateError } = await supabase
        .from('property_verifications')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          changes_requested: reviewNotes || null
        })
        .eq('id', selectedVerification.id);

      if (updateError) throw updateError;

      // Update property status to published
      const { error: propError } = await supabase
        .from('properties')
        .update({
          status: 'published',
          verified: true
        })
        .eq('id', selectedVerification.property_id);

      if (propError) throw propError;

      // Create conversation for approved property
      const propertyTitle = selectedVerification.property?.title || 'Propiedad sin título';
      const conversationId = await createPropertyApprovalConversation({
        propertyId: selectedVerification.property_id,
        ownerId: selectedVerification.user_id,
        adminId: user.id,
        propertyTitle
      });

      if (conversationId) {
        console.log('Approval conversation created:', conversationId);
      }

      toast.success('Propiedad aprobada exitosamente');
      setShowDetailsDialog(false);
      setSelectedVerification(null);
      setReviewNotes('');
      refetch();
    } catch (err: any) {
      console.error('Error approving verification:', err);
      toast.error('Error al aprobar la propiedad');
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !reviewReason) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('property_verifications')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reviewReason,
          changes_requested: reviewNotes || null
        })
        .eq('id', selectedVerification.id);

      if (updateError) throw updateError;

      // Update property status to rejected
      const { error: propError } = await supabase
        .from('properties')
        .update({ status: 'rejected' })
        .eq('id', selectedVerification.property_id);

      if (propError) throw propError;

      toast.success('Propiedad rechazada');
      setShowDetailsDialog(false);
      setSelectedVerification(null);
      setReviewReason('');
      setReviewNotes('');
      refetch();
    } catch (err: any) {
      console.error('Error rejecting verification:', err);
      toast.error('Error al rechazar la propiedad');
    }
  };

  const openDetailsDialog = (verification: any, action: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setReviewAction(action);
    setReviewNotes('');
    setReviewReason('');
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Total Envíos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.length}</div>
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
            <div className="text-2xl font-bold text-yellow-600">
              {verifications.filter(v => v.status === 'pending').length}
            </div>
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
              {verifications.filter(v => v.status === 'approved').length}
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
              {verifications.filter(v => v.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            size="sm"
          >
            {status === 'all' ? 'Todas' : status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobadas' : 'Rechazadas'}
          </Button>
        ))}
      </div>

      {/* Verifications List */}
      <div className="space-y-3">
        {filteredVerifications.map((verification) => {
          const getStatusBadge = () => {
            switch (verification.status) {
              case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
              case 'approved':
                return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>;
              case 'rejected':
                return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>;
              default:
                return <Badge>Desconocido</Badge>;
            }
          };

          return (
            <Card key={verification.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Home className="h-5 w-5 text-gray-600" />
                      <h4 className="font-medium">{verification.property?.title || 'Sin título'}</h4>
                      {getStatusBadge()}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{verification.property?.address}</p>
                    <p className="text-xs text-gray-500">
                      Enviado: {format(new Date(verification.submitted_at), 'PPp', { locale: es })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {verification.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailsDialog(verification, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => openDetailsDialog(verification, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Review Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Aprobar Propiedad' : 'Rechazar Propiedad'}
            </DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{selectedVerification.property?.title}</h4>
                <p className="text-sm text-gray-600">{selectedVerification.property?.address}</p>
              </div>

              {reviewAction === 'reject' && (
                <div>
                  <label className="text-sm font-medium">Razón de rechazo *</label>
                  <Textarea
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    placeholder="Explica por qué rechazas esta propiedad..."
                    rows={3}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Notas adicionales (opcional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Añade notas sobre esta revisión..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Cancelar
                </Button>
                {reviewAction === 'approve' ? (
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                    Aprobar Propiedad
                  </Button>
                ) : (
                  <Button 
                    onClick={handleReject} 
                    disabled={!reviewReason}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Rechazar Propiedad
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

