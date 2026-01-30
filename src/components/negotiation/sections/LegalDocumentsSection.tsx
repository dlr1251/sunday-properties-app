import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Download,
  FileSignature
} from 'lucide-react';

interface LegalDocument {
  id: string;
  type: 'contrato_opcion' | 'promesa_compraventa' | 'escrituras';
  title: string;
  description: string;
  required: boolean;
  signingDate: string;
  paymentDate?: string; // Fecha en que se realiza el pago relacionado
  conditions: string[];
  status: 'pending' | 'draft' | 'signed' | 'completed';
  assignedLawyer?: string;
  notes?: string;
}

interface LegalDocumentsSectionProps {
  documents: LegalDocument[];
  onDocumentsChange: (documents: LegalDocument[]) => void;
  propertyPrice: number;
  offerValidityDays: number;
  className?: string;
}

export function LegalDocumentsSection({
  documents,
  onDocumentsChange,
  propertyPrice,
  offerValidityDays,
  className = ''
}: LegalDocumentsSectionProps) {

  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Documentos por defecto si no hay ninguno
  const defaultDocuments: LegalDocument[] = [
    {
      id: 'contrato_opcion',
      type: 'contrato_opcion',
      title: 'Contrato de Opción',
      description: 'Documento que otorga derecho preferente de compra durante un período determinado',
      required: true,
      signingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días
      conditions: [
        'Derecho de preferencia de compra durante 30 días',
        'Pago de arras equivalente al 10% del valor',
        'Opción revocable por el vendedor'
      ],
      status: 'pending'
    },
    {
      id: 'promesa_compraventa',
      type: 'promesa_compraventa',
      title: 'Promesa de Compraventa',
      description: 'Compromiso formal de compraventa con condiciones específicas',
      required: true,
      signingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 días
      paymentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 días
      conditions: [
        'Pago del precio acordado según cronograma establecido',
        'Entrega de la propiedad libre de gravámenes',
        'Cumplimiento de inspecciones y avalúos',
        'Pago de impuestos y gastos notariales'
      ],
      status: 'pending'
    },
    {
      id: 'escrituras',
      type: 'escrituras',
      title: 'Escrituras Públicas',
      description: 'Documento notarial que formaliza la transferencia de propiedad',
      required: true,
      signingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 días
      paymentDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 días
      conditions: [
        'Pago del saldo restante del precio',
        'Cancelación de hipotecas anteriores',
        'Registro en oficinas de instrumentos públicos',
        'Pago de impuesto predial proporcional'
      ],
      status: 'pending'
    }
  ];

  // Inicializar con documentos por defecto si no hay ninguno
  React.useEffect(() => {
    if (documents.length === 0) {
      onDocumentsChange(defaultDocuments);
    }
  }, [documents.length, onDocumentsChange]);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'contrato_opcion': return FileText;
      case 'promesa_compraventa': return FileSignature;
      case 'escrituras': return FileText;
      default: return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
      signed: { label: 'Firmado', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completado', color: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const addDocument = (type: LegalDocument['type']) => {
    const newDocument: LegalDocument = {
      id: `${type}_${Date.now()}`,
      type,
      title: `Nuevo ${type.replace('_', ' ')}`,
      description: '',
      required: false,
      signingDate: new Date().toISOString().split('T')[0],
      conditions: [],
      status: 'draft'
    };

    onDocumentsChange([...documents, newDocument]);
    setSelectedDocument(newDocument);
    setShowDocumentModal(true);
  };

  const updateDocument = (updatedDocument: LegalDocument) => {
    onDocumentsChange(documents.map(doc =>
      doc.id === updatedDocument.id ? updatedDocument : doc
    ));
  };

  const deleteDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };

  const getNextDocumentDate = (currentIndex: number) => {
    if (currentIndex === 0) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días para primera

    const prevDocument = documents[currentIndex - 1];
    if (!prevDocument) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const prevDate = new Date(prevDocument.signingDate);
    return new Date(prevDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días después
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Documentos Legales Requeridos
          </div>
          <Button
            size="sm"
            onClick={() => addDocument('contrato_opcion')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Documento
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configura los documentos legales, fechas de firma y condiciones específicas
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline de documentos */}
        <div className="space-y-4">
          {documents.map((document, index) => {
            const IconComponent = getDocumentIcon(document.type);
            const isOverdue = new Date(document.signingDate) < new Date() && document.status === 'pending';

            return (
              <div key={document.id} className="relative">
                {/* Línea de conexión */}
                {index < documents.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300"></div>
                )}

                <div className={`flex gap-4 p-4 border-2 rounded-lg transition-colors ${
                  isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  {/* Icono del documento */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    document.required ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      document.required ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>

                  {/* Contenido del documento */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{document.title}</h3>
                          {document.required && (
                            <Badge variant="outline" className="text-xs">Requerido</Badge>
                          )}
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">Vencido</Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{document.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-gray-500">Fecha de firma</Label>
                            <p className="font-medium">{formatDate(document.signingDate)}</p>
                          </div>

                          {document.paymentDate && (
                            <div>
                              <Label className="text-xs text-gray-500">Fecha de pago</Label>
                              <p className="font-medium">{formatDate(document.paymentDate)}</p>
                            </div>
                          )}

                          <div>
                            <Label className="text-xs text-gray-500">Estado</Label>
                            <div className="mt-1">{getStatusBadge(document.status)}</div>
                          </div>
                        </div>

                        {document.conditions.length > 0 && (
                          <div className="mt-3">
                            <Label className="text-xs text-gray-500">Condiciones principales</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {document.conditions.slice(0, 3).map((condition, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {condition.length > 30 ? `${condition.substring(0, 30)}...` : condition}
                                </Badge>
                              ))}
                              {document.conditions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{document.conditions.length - 3} más
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(document);
                            setShowDocumentModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* Ver documento */}}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!document.required && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteDocument(document.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alertas importantes */}
        <div className="space-y-3">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Las fechas de los documentos deben respetar el tiempo de validez
              de la oferta ({offerValidityDays} días). Asegúrate de que todas las firmas ocurran dentro de este período.
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Los documentos marcados como "Requeridos" son obligatorios para completar la transacción
              inmobiliaria según la legislación colombiana.
            </AlertDescription>
          </Alert>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
            <p className="text-sm text-gray-600">Total documentos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.required).length}
            </p>
            <p className="text-sm text-gray-600">Requeridos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => d.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {documents.filter(d => new Date(d.signingDate) < new Date() && d.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Vencidos</p>
          </div>
        </div>

        {/* Modal de edición de documento */}
        {showDocumentModal && selectedDocument && (
          <DocumentEditModal
            document={selectedDocument}
            onSave={(updatedDoc) => {
              updateDocument(updatedDoc);
              setShowDocumentModal(false);
              setSelectedDocument(null);
            }}
            onClose={() => {
              setShowDocumentModal(false);
              setSelectedDocument(null);
            }}
            nextAvailableDate={getNextDocumentDate(documents.indexOf(selectedDocument))}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Modal para editar documentos
interface DocumentEditModalProps {
  document: LegalDocument;
  onSave: (document: LegalDocument) => void;
  onClose: () => void;
  nextAvailableDate: Date;
}

function DocumentEditModal({ document, onSave, onClose, nextAvailableDate }: DocumentEditModalProps) {
  const [editedDocument, setEditedDocument] = useState<LegalDocument>({ ...document });
  const [newCondition, setNewCondition] = useState('');

  const handleSave = () => {
    onSave(editedDocument);
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setEditedDocument(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setEditedDocument(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Edit className="h-5 w-5 text-blue-600" />
          Editar Documento: {document.title}
        </h3>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del documento</Label>
              <Input
                id="title"
                value={editedDocument.title}
                onChange={(e) => setEditedDocument(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={editedDocument.status}
                onChange={(e) => setEditedDocument(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pendiente</option>
                <option value="draft">Borrador</option>
                <option value="signed">Firmado</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={editedDocument.description}
              onChange={(e) => setEditedDocument(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signingDate">Fecha de firma *</Label>
              <Input
                id="signingDate"
                type="date"
                value={editedDocument.signingDate}
                onChange={(e) => setEditedDocument(prev => ({ ...prev, signingDate: e.target.value }))}
                min={formatDate(nextAvailableDate)}
              />
            </div>

            {(editedDocument.type === 'promesa_compraventa' || editedDocument.type === 'escrituras') && (
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Fecha de pago relacionada</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={editedDocument.paymentDate || ''}
                  onChange={(e) => setEditedDocument(prev => ({ ...prev, paymentDate: e.target.value }))}
                  min={editedDocument.signingDate}
                />
              </div>
            )}
          </div>

          {/* Abogado asignado */}
          <div className="space-y-2">
            <Label htmlFor="lawyer">Abogado asignado (opcional)</Label>
            <Input
              id="lawyer"
              value={editedDocument.assignedLawyer || ''}
              onChange={(e) => setEditedDocument(prev => ({ ...prev, assignedLawyer: e.target.value }))}
              placeholder="Nombre del abogado responsable"
            />
          </div>

          {/* Condiciones */}
          <div className="space-y-3">
            <Label>Condiciones específicas</Label>

            {editedDocument.conditions.map((condition, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={condition}
                  onChange={(e) => {
                    const newConditions = [...editedDocument.conditions];
                    newConditions[index] = e.target.value;
                    setEditedDocument(prev => ({ ...prev, conditions: newConditions }));
                  }}
                  placeholder="Describe una condición específica..."
                  className="flex-1"
                  rows={2}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeCondition(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Nueva condición..."
                onKeyPress={(e) => e.key === 'Enter' && addCondition()}
              />
              <Button onClick={addCondition} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notas adicionales */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={editedDocument.notes || ''}
              onChange={(e) => setEditedDocument(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales sobre el documento..."
              rows={2}
            />
          </div>

          {/* Checkbox requerido */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="required"
              checked={editedDocument.required}
              onCheckedChange={(checked) => setEditedDocument(prev => ({ ...prev, required: !!checked }))}
            />
            <Label htmlFor="required">Este documento es obligatorio para la transacción</Label>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
