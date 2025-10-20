import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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

interface Case {
  id: string;
  lawyer_id: string;
  buyer_id: string;
  seller_id: string;
  property_id: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  buyer_name: string;
  seller_name: string;
  property_title: string;
  property_address: string;
  property_price: number;
  documents: CaseDocument[];
}

interface CaseDocument {
  id: string;
  case_id: string;
  document_type: 'promesa' | 'otrosi' | 'oferta' | 'escritura' | 'legal';
  document_url: string;
  signed_by: string | null;
  signed_at: string | null;
  status: 'draft' | 'pending_signature' | 'signed' | 'completed';
  created_at: string;
  title: string;
  description: string;
}

export const CaseManager: React.FC = () => {
  const { user } = useAuth();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app this would come from Supabase
  const mockCases: Case[] = [
    {
      id: 'case-1',
      lawyer_id: user?.id || '',
      buyer_id: 'user-6',
      seller_id: 'user-5',
      property_id: 'prop-1',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      buyer_name: 'Laura Fernández',
      seller_name: 'Pedro Sánchez',
      property_title: 'Apartamento en El Poblado',
      property_address: 'Carrera 43A #5-15, El Poblado, Medellín',
      property_price: 380000000,
      documents: [
        {
          id: 'doc-1',
          case_id: 'case-1',
          document_type: 'promesa',
          document_url: '/documents/promesa-case-1.pdf',
          signed_by: 'user-5',
          signed_at: '2024-01-18T16:00:00Z',
          status: 'signed',
          created_at: '2024-01-16T09:00:00Z',
          title: 'Promesa de Compraventa - Apartamento El Poblado',
          description: 'Documento principal de la promesa de compraventa entre Laura Fernández y Pedro Sánchez'
        },
        {
          id: 'doc-2',
          case_id: 'case-1',
          document_type: 'otrosi',
          document_url: '/documents/otrosi-case-1.pdf',
          signed_by: null,
          signed_at: null,
          status: 'pending_signature',
          created_at: '2024-01-19T11:00:00Z',
          title: 'Otrosí - Modificación de Plazos',
          description: 'Modificación de los plazos de pago acordados en la promesa original'
        }
      ]
    },
    {
      id: 'case-2',
      lawyer_id: user?.id || '',
      buyer_id: 'user-4',
      seller_id: 'user-7',
      property_id: 'prop-2',
      status: 'active',
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-22T12:00:00Z',
      buyer_name: 'Ana Gómez',
      seller_name: 'Roberto Torres',
      property_title: 'Casa en Laureles',
      property_address: 'Calle 70 #45-23, Laureles, Medellín',
      property_price: 520000000,
      documents: [
        {
          id: 'doc-3',
          case_id: 'case-2',
          document_type: 'promesa',
          document_url: '/documents/promesa-case-2.pdf',
          signed_by: null,
          signed_at: null,
          status: 'draft',
          created_at: '2024-01-20T14:00:00Z',
          title: 'Promesa de Compraventa - Casa Laureles',
          description: 'Borrador de la promesa de compraventa entre Ana Gómez y Roberto Torres'
        },
        {
          id: 'doc-4',
          case_id: 'case-2',
          document_type: 'oferta',
          document_url: '/documents/oferta-case-2.pdf',
          signed_by: 'user-4',
          signed_at: '2024-01-15T10:30:00Z',
          status: 'signed',
          created_at: '2024-01-12T15:00:00Z',
          title: 'Oferta de Compra - Casa Laureles',
          description: 'Oferta inicial de compra presentada por Ana Gómez'
        }
      ]
    }
  ];

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Casos</h1>
          <p className="text-muted-foreground mt-2">
            Administra tus casos asignados y documentos legales
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {mockCases.length} casos activos
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Casos Asignados</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCases.map((caseItem) => (
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
                    <h3 className="font-semibold text-sm">{caseItem.property_title}</h3>
                    <Badge className={getStatusColor(caseItem.status)}>
                      {caseItem.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{caseItem.buyer_name} → {caseItem.seller_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{caseItem.property_address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatPrice(caseItem.property_price)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(caseItem.created_at)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {caseItem.documents.length} documentos
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {caseItem.documents.filter(doc => doc.status === 'pending_signature').length} pendientes
                    </Badge>
                  </div>
                </div>
              ))}
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
                      <span>{selectedCase.property_title}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedCase.property_address}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(selectedCase.status)}>
                    {selectedCase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="parties">Partes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Información del Caso</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>ID del Caso:</span>
                            <span className="font-mono">{selectedCase.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Precio:</span>
                            <span className="font-semibold">{formatPrice(selectedCase.property_price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Creado:</span>
                            <span>{formatDate(selectedCase.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Última actualización:</span>
                            <span>{formatDate(selectedCase.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Estadísticas</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total documentos:</span>
                            <span>{selectedCase.documents.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Firmados:</span>
                            <span className="text-green-600">
                              {selectedCase.documents.filter(doc => doc.status === 'signed').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pendientes:</span>
                            <span className="text-yellow-600">
                              {selectedCase.documents.filter(doc => doc.status === 'pending_signature').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Borradores:</span>
                            <span className="text-blue-600">
                              {selectedCase.documents.filter(doc => doc.status === 'draft').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <div className="space-y-3">
                      {selectedCase.documents.map((document) => (
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
                                  {formatDate(document.created_at)}
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
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <div className="space-y-4">
                      {selectedCase.documents.map((document, index) => (
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
                                {formatDate(document.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getDocumentStatusColor(document.status)}>
                                {document.status}
                              </Badge>
                              {document.signed_at && (
                                <span className="text-xs text-muted-foreground">
                                  Firmado el {formatDate(document.signed_at)}
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
                          <CardTitle className="text-sm">Comprador</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="font-semibold">{selectedCase.buyer_name}</div>
                            <div className="text-sm text-muted-foreground">ID: {selectedCase.buyer_id}</div>
                            <Badge variant="outline" className="text-xs">Comprador</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Vendedor</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="font-semibold">{selectedCase.seller_name}</div>
                            <div className="text-sm text-muted-foreground">ID: {selectedCase.seller_id}</div>
                            <Badge variant="outline" className="text-xs">Vendedor</Badge>
                          </div>
                        </CardContent>
                      </Card>
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
