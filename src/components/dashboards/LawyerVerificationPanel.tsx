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
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useVerificationFlow } from '../../hooks/verification/useVerificationFlow';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatDate, formatDateTime } from '../../utils/format';

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

export const LawyerVerificationPanel: React.FC = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string>('');
  const [idDocUrl, setIdDocUrl] = useState<string>('');
  const [poaDocUrl, setPoaDocUrl] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const { getSignedUrl } = useVerificationFlow();

  // Document handling functions
  const downloadDocument = async (path: string, filename: string) => {
    try {
      const url = await getSignedUrl(path);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error(t('admin.downloadDocumentError'));
      console.error(error);
    }
  };

  const previewDocument = async (path: string) => {
    try {
      const url = await getSignedUrl(path);
      window.open(url, '_blank');
    } catch (error) {
      toast.error(t('admin.openDocumentError'));
      console.error(error);
    }
  };

  const isImageFile = (path: string) => {
    return path.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          user_profile:profiles!verification_requests_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error(t('admin.loadRequestsErrorMessage', { message: error.message }));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('verification_messages')
        .select(`
          *,
          sender:profiles!verification_messages_sender_id_fkey (
            full_name,
            email
          )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const loadDocumentUrls = async (request: VerificationRequest) => {
    try {
      if (request.selfie_path) {
        const url = await getSignedUrl(request.selfie_path);
        setSelfieUrl(url);
      }
      if (request.id_doc_path) {
        const url = await getSignedUrl(request.id_doc_path);
        setIdDocUrl(url);
      }
      if (request.poa_doc_path) {
        const url = await getSignedUrl(request.poa_doc_path);
        setPoaDocUrl(url);
      }
    } catch (error) {
      console.error('Error cargando URLs de documentos:', error);
    }
  };

  const handleViewRequest = async (request: VerificationRequest) => {
    setSelectedRequest(request);
    setReviewNotes('');
    setRejectReason('');
    setMessages([]);
    setSelfieUrl('');
    setIdDocUrl('');
    setPoaDocUrl('');

    await loadDocumentUrls(request);
    await fetchMessages(request.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('verification_messages')
        .insert({
          request_id: selectedRequest.id,
          sender_id: userData.user.id,
          body: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(selectedRequest.id);
      toast.success(t('admin.messageSent'));
    } catch (error: any) {
      toast.error(t('admin.sendMessageError', { message: error.message }));
    }
  };

  const approveRequest = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Update verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userData.user.id,
          notes: reviewNotes || null
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Update user profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.user_id);

      if (profileError) throw profileError;

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.user_id,
          type: 'verification_approved',
          title: 'Verificación Aprobada',
          message: 'Tu solicitud de verificación ha sido aprobada. Ya puedes subir propiedades y agendar visitas.',
          data: {
            verification_request_id: selectedRequest.id
          },
          read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast.success(t('admin.requestApprovedOk'));
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error: any) {
      toast.error(t('admin.approveRequestErrorMessage', { message: error.message }));
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectRequest = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast.error(t('admin.rejectReasonRequired'));
      return;
    }

    setIsProcessing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Update verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userData.user.id,
          notes: rejectReason
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.user_id,
          type: 'verification_rejected',
          title: 'Verificación Rechazada',
          message: `Tu solicitud de verificación ha sido rechazada. Razón: ${rejectReason}`,
          data: {
            verification_request_id: selectedRequest.id,
            reason: rejectReason
          },
          read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast.success(t('admin.requestRejectedOk'));
      setSelectedRequest(null);
      setShowRejectDialog(false);
      setRejectReason('');
      await fetchRequests();
    } catch (error: any) {
      toast.error(t('admin.rejectRequestErrorMessage', { message: error.message }));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            {t('admin.loadingRequests')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('admin.pendingVerificationRequests')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('admin.noPendingVerificationRequests')}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">
                            {request.user_profile?.full_name || t('common.unnamed')}
                          </h4>
                          <Badge variant="outline">
                            {request.is_owner ? 'Dueño' : 'Intermediario'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.user_profile?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('admin.submitted', { date: formatDate(request.created_at) })}
                        </p>
                      </div>

                      <Dialog open={selectedRequest?.id === request.id} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Revisar
                        </Button>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{t('admin.reviewRequest')}</DialogTitle>
                          </DialogHeader>

                          {selectedRequest && (
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="details">{t('lawyer.details')}</TabsTrigger>
                                <TabsTrigger value="documents">{t('lawyer.documents')}</TabsTrigger>
                                <TabsTrigger value="messages">{t('admin.messagesTab')}</TabsTrigger>
                                <TabsTrigger value="actions">{t('lawyer.actions')}</TabsTrigger>
                              </TabsList>

                              <TabsContent value="details" className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">{t('admin.userInfo')}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">{t('admin.name')}:</span> {selectedRequest.user_profile?.full_name}
                                      </div>
                                      <div>
                                        <span className="font-medium">Email:</span> {selectedRequest.user_profile?.email}
                                      </div>
                                      <div>
                                        <span className="font-medium">{t('admin.phone')}:</span> {selectedRequest.data?.phone || t('common.notSpecified')}
                                      </div>
                                      <div>
                                        <span className="font-medium">{t('lawyer.type')}</span> {selectedRequest.is_owner ? t('admin.directOwner') : t('admin.intermediary')}
                                      </div>
                                      <div>
                                        <span className="font-medium">{t('admin.locationSection')}:</span> {selectedRequest.data?.location}
                                      </div>
                                      <div>
                                        <span className="font-medium">{t('admin.nationality')}:</span> {selectedRequest.data?.nationality}
                                      </div>
                                    </div>
                                    {selectedRequest.data?.bio && (
                                      <div className="mt-4">
                                        <span className="font-medium">{t('admin.bio')}:</span>
                                        <p className="text-sm text-muted-foreground mt-1">{selectedRequest.data.bio}</p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value="documents" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {selfieUrl && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">{t('verification.dashboard.facePhoto')}</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <img
                                          src={selfieUrl}
                                          alt={t('verification.dashboard.facePhoto')}
                                          className="w-full h-48 object-cover rounded"
                                        />
                                        <div className="flex gap-2 mt-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => previewDocument(selectedRequest.selfie_path!)}
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {t('properties.viewDetails')}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => downloadDocument(selectedRequest.selfie_path!, 'selfie.jpg')}
                                          >
                                            <Download className="h-4 w-4 mr-2" />
                                            {t('common.download')}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {idDocUrl && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">{t('admin.idDocument')}</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        {isImageFile(selectedRequest.id_doc_path!) ? (
                                          <img
                                            src={idDocUrl}
                                            alt={t('admin.idDocument')}
                                            className="w-full h-48 object-cover rounded"
                                          />
                                        ) : (
                                          <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
                                            <FileText className="h-12 w-12 text-gray-400" />
                                          </div>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => previewDocument(selectedRequest.id_doc_path!)}
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {t('admin.viewDocuments')}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => downloadDocument(selectedRequest.id_doc_path!, 'cedula.pdf')}
                                          >
                                            <Download className="h-4 w-4 mr-2" />
                                            {t('common.download')}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {poaDocUrl && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">{t('admin.powerOfAttorney')}</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        {isImageFile(selectedRequest.poa_doc_path!) ? (
                                          <img
                                            src={poaDocUrl}
                                            alt={t('admin.powerOfAttorney')}
                                            className="w-full h-48 object-cover rounded"
                                          />
                                        ) : (
                                          <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
                                            <FileText className="h-12 w-12 text-gray-400" />
                                          </div>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => previewDocument(selectedRequest.poa_doc_path!)}
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {t('admin.viewDocuments')}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => downloadDocument(selectedRequest.poa_doc_path!, 'poder_notarial.pdf')}
                                          >
                                            <Download className="h-4 w-4 mr-2" />
                                            {t('common.download')}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </TabsContent>

                              <TabsContent value="messages" className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">{t('admin.messagesTab')}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                                      {messages.length === 0 ? (
                                        <p className="text-muted-foreground text-center">{t('admin.noMessages')}</p>
                                      ) : (
                                        messages.map((msg: any) => (
                                          <div key={msg.id} className="border rounded p-3">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="font-medium">
                                                {msg.sender?.full_name || msg.sender?.email}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {formatDateTime(msg.created_at)}
                                              </span>
                                            </div>
                                            <p className="text-sm">{msg.body}</p>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    <div className="flex gap-2">
                                      <Textarea
                                        placeholder={t('admin.writeMessagePlaceholder')}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        rows={2}
                                      />
                                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value="actions" className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">{t('admin.reviewNotesTitle')}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Textarea
                                      placeholder={t('admin.internalReviewNotes')}
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      rows={3}
                                    />
                                  </CardContent>
                                </Card>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={approveRequest}
                                    disabled={isProcessing}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {t('admin.approveVerification')}
                                  </Button>

                                  <Button
                                    variant="destructive"
                                    disabled={isProcessing}
                                    className="flex-1"
                                    onClick={() => setShowRejectDialog(true)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {t('common.reject')}
                                  </Button>

                                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>{t('admin.rejectRequest')}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Textarea
                                          placeholder={t('admin.rejectReasonPlaceholder')}
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                          rows={4}
                                        />
                                        <Button
                                          onClick={rejectRequest}
                                          disabled={!rejectReason.trim() || isProcessing}
                                          variant="destructive"
                                          className="w-full"
                                        >
                                          Confirmar Rechazo
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
