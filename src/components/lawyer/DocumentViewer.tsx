import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  FileText, 
  Download, 
  Edit, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Eye,
  Share2,
  Printer,
  Send,
  Calendar,
  User
} from 'lucide-react';

interface Document {
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
  content?: string;
  version: number;
  last_modified: string;
  modified_by: string;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  onEdit?: (document: Document) => void;
  onSign?: (document: Document) => void;
  onShare?: (document: Document) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onClose,
  onEdit,
  onSign,
  onShare
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getStatusColor = (status: string) => {
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
      case 'promesa': return <FileText className="h-5 w-5" />;
      case 'otrosi': return <Edit className="h-5 w-5" />;
      case 'oferta': return <CheckCircle className="h-5 w-5" />;
      case 'escritura': return <FileText className="h-5 w-5" />;
      case 'legal': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Mock document content - in real app this would come from Supabase
  const mockDocumentContent = `
    PROMESA DE COMPRAVENTA
    
    En Medellín, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-CO', { month: 'long' })} de ${new Date().getFullYear()}, entre:
    
    COMPRADOR: ${document.signed_by || 'Por definir'}
    Cédula de Ciudadanía: ${document.signed_by ? 'CC. 12345678' : 'Por definir'}
    
    VENDEDOR: ${document.signed_by || 'Por definir'}
    Cédula de Ciudadanía: ${document.signed_by ? 'CC. 87654321' : 'Por definir'}
    
    Se ha convenido celebrar la siguiente PROMESA DE COMPRAVENTA:
    
    PRIMERO: El VENDEDOR se compromete a vender y el COMPRADOR a comprar el inmueble ubicado en:
    ${document.description}
    
    SEGUNDO: El precio de venta es de ${formatPrice(520000000)} (quinientos veinte millones de pesos colombianos).
    
    TERCERO: El COMPRADOR pagará el precio de la siguiente manera:
    - 30% al momento de la firma de escritura pública
    - 70% mediante financiación bancaria
    
    CUARTO: Las partes se comprometen a celebrar la escritura pública dentro de los próximos 30 días hábiles.
    
    QUINTO: El incumplimiento de cualquiera de las partes generará las sanciones establecidas en la ley.
    
    En fe de lo anterior, se firma en la ciudad de Medellín.
    
    COMPRADOR: _________________    VENDEDOR: _________________
    
    Fecha: ${formatDate(document.created_at)}
  `;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isFullscreen ? 'p-0' : ''}`}>
      <Card className={`w-full max-w-6xl max-h-[90vh] ${isFullscreen ? 'h-screen max-h-none' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            {getDocumentTypeIcon(document.document_type)}
            <div>
              <CardTitle className="text-lg">{document.title}</CardTitle>
              <CardDescription>{document.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="actions">Acciones</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <div className="border rounded-lg p-6 bg-white h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {mockDocumentContent}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Información del Documento</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span className="font-mono">{document.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <Badge variant="outline">{document.document_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Versión:</span>
                        <span>{document.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Creado:</span>
                        <span>{formatDate(document.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Última modificación:</span>
                        <span>{formatDate(document.last_modified)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Estado de Firma</h4>
                    <div className="space-y-2 text-sm">
                      {document.signed_by ? (
                        <>
                          <div className="flex justify-between">
                            <span>Firmado por:</span>
                            <span>{document.signed_by}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fecha de firma:</span>
                            <span>{formatDate(document.signed_at!)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Documento pendiente de firma</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Documento creado</h4>
                      <span className="text-xs text-muted-foreground">{formatDate(document.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Versión inicial del documento</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Edit className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Documento modificado</h4>
                      <span className="text-xs text-muted-foreground">{formatDate(document.last_modified)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Modificado por {document.modified_by}</p>
                  </div>
                </div>
                
                {document.signed_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Documento firmado</h4>
                        <span className="text-xs text-muted-foreground">{formatDate(document.signed_at)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Firmado por {document.signed_by}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Acciones Disponibles</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                    {document.status === 'draft' && onEdit && (
                      <Button className="w-full justify-start" onClick={() => onEdit(document)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Documento
                      </Button>
                    )}
                    {document.status === 'pending_signature' && onSign && (
                      <Button className="w-full justify-start" onClick={() => onSign(document)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Firmar Documento
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Envío</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar por Email
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Programar Envío
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
