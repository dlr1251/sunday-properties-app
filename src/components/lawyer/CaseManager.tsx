import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  FileText, 
  Users, 
  Calendar,
  Download,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Home,
  DollarSign,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../hooks/useCases';
import { Case, CaseDocument } from '../../lib/db/repositories/cases.repo';
import { ChatWindow } from '../chat/ChatWindow';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateTime } from '../../utils/format';

export const CaseManager: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cases, loading, error, getCaseDocuments } = useCases();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseDocuments, setCaseDocuments] = useState<CaseDocument[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [caseConversationId, setCaseConversationId] = useState<string | null>(null);

  // Fetch documents when a case is selected
  React.useEffect(() => {
    if (selectedCase) {
      setLoadingDocuments(true);
      getCaseDocuments(selectedCase.id).then((docs) => {
        setCaseDocuments(docs);
        setLoadingDocuments(false);
      });
    }
  }, [selectedCase, getCaseDocuments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'pending_signature': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'promesa': return <FileText className="h-4 w-4" />;
      case 'otrosi': return <Edit className="h-4 w-4" />;
      case 'oferta': return <DollarSign className="h-4 w-4" />;
      case 'escritura': return <CheckCircle className="h-4 w-4" />;
      case 'legal': return <Briefcase className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('lawyer.caseManagement')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('lawyer.caseManagementSubtitle')}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {t('lawyer.activeCasesCount', { count: cases.length })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>{t('lawyer.assignedCases')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center p-4">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t('lawyer.loadingCases')}</p>
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center p-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t('lawyer.noAssignedCases')}</p>
                </div>
              ) : (
                cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedCase?.id === caseItem.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedCase(caseItem)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{caseItem.property?.title || 'Propiedad sin título'}</h3>
                    <Badge className={getStatusColor(caseItem.status)}>
                      {caseItem.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{caseItem.buyer?.full_name || 'Comprador'} → {caseItem.seller?.full_name || 'Vendedor'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{caseItem.property?.address || 'Dirección no disponible'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{caseItem.property?.price ? formatCurrency(caseItem.property.price) : t('lawyer.priceUnavailable')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateTime(caseItem.created_at)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {caseDocuments.filter(doc => doc.case_id === caseItem.id).length} documentos
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {caseDocuments.filter(doc => doc.case_id === caseItem.id && doc.status === 'pending_signature').length} pendientes
                    </Badge>
                  </div>
                </div>
              ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Case Details */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Home className="h-5 w-5" />
                      <span>{selectedCase.property?.title || 'Propiedad sin título'}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedCase.property?.address || 'Dirección no disponible'}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(selectedCase.status)}>
                    {selectedCase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">{t('lawyer.overview')}</TabsTrigger>
                    <TabsTrigger value="documents">{t('lawyer.documents')}</TabsTrigger>
                    <TabsTrigger value="timeline">{t('lawyer.timeline')}</TabsTrigger>
                    <TabsTrigger value="parties">{t('lawyer.parties')}</TabsTrigger>
                    <TabsTrigger value="chat">{t('lawyer.chat')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">{t('lawyer.caseInfo')}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t('lawyer.caseId')}</span>
                            <span className="font-mono">{selectedCase.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('lawyer.price')}</span>
                            <span className="font-semibold">{selectedCase.property?.price ? formatCurrency(selectedCase.property.price) : t('common.notAvailable')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('lawyer.created')}</span>
                            <span>{formatDateTime(selectedCase.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('lawyer.lastUpdated')}</span>
                            <span>{formatDateTime(selectedCase.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">{t('lawyer.stats')}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t('lawyer.totalDocuments')}</span>
                            <span>{caseDocuments.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('lawyer.signed')}</span>
                            <span className="text-green-600">
                              {caseDocuments.filter(doc => doc.status === 'signed').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('lawyer.pending')}</span>
                            <span className="text-yellow-600">
                              {caseDocuments.filter(doc => doc.status === 'pending_signature').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('lawyer.drafts')}</span>
                            <span className="text-blue-600">
                              {caseDocuments.filter(doc => doc.status === 'draft').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <div className="space-y-3">
                      {loadingDocuments ? (
                        <div className="text-center p-4">
                          <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{t('lawyer.loadingDocuments')}</p>
                        </div>
                      ) : caseDocuments.length === 0 ? (
                        <div className="text-center p-4">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{t('lawyer.noDocuments')}</p>
                        </div>
                      ) : (
                        caseDocuments.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getDocumentTypeIcon(document.document_type)}
                            <div>
                              <h4 className="font-semibold text-sm">{document.title}</h4>
                              <p className="text-xs text-muted-foreground">{document.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getDocumentStatusColor(document.status)}>
                                  {document.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(document.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                            {document.status === 'draft' && (
                              <Button size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            )}
                            {document.status === 'pending_signature' && (
                              <Button size="sm" variant="default">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Firmar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <div className="space-y-4">
                      {caseDocuments.map((document, index) => (
                        <div key={document.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {getDocumentTypeIcon(document.document_type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">{document.title}</h4>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(document.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getDocumentStatusColor(document.status)}>
                                {document.status}
                              </Badge>
                              {document.signed_at && (
                                <span className="text-xs text-muted-foreground">
                                  {t('lawyer.signedOn', { date: formatDateTime(document.signed_at) })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="parties" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">{t('lawyer.buyer')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="font-semibold">{selectedCase.buyer?.full_name || 'Comprador'}</div>
                            <div className="text-sm text-muted-foreground">Email: {selectedCase.buyer?.email || 'N/A'}</div>
                            {selectedCase.buyer?.phone && (
                              <div className="text-sm text-muted-foreground">Tel: {selectedCase.buyer.phone}</div>
                            )}
                            <Badge variant="outline" className="text-xs">{t('lawyer.buyer')}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">{t('lawyer.seller')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="font-semibold">{selectedCase.seller?.full_name || 'Vendedor'}</div>
                            <div className="text-sm text-muted-foreground">Email: {selectedCase.seller?.email || 'N/A'}</div>
                            {selectedCase.seller?.phone && (
                              <div className="text-sm text-muted-foreground">Tel: {selectedCase.seller.phone}</div>
                            )}
                            <Badge variant="outline" className="text-xs">{t('lawyer.seller')}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="chat" className="space-y-4">
                    <div className="h-[500px]">
                      <Button
                        onClick={() => navigate(`/messages?caseId=${selectedCase.id}`)}
                        className="w-full mb-4"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Abrir Chat del Caso
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">
                        El chat del caso permite la comunicación entre el abogado, comprador y vendedor.
                        Haz clic en el botón de arriba para abrir la ventana de chat completa.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Selecciona un caso
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Elige un caso de la lista para ver los detalles y documentos
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
