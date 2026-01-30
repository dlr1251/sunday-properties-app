import React, { useState, useEffect } from 'react';
import { useResourceDetail } from '../../../hooks/superadmin/useResourceDetail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Edit, 
  Save, 
  X, 
  FileText, 
  Eye, 
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Home,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { Skeleton } from '../../ui/skeleton';

interface DocumentDetailViewProps {
  documentId: string | null;
  documentType?: 'legal' | 'case' | 'verification';
  onUpdate?: () => void;
}

export function DocumentDetailView({ documentId, documentType, onUpdate }: DocumentDetailViewProps) {
  const { data, loading, error, update, refresh } = useResourceDetail({
    resourceType: 'document',
    resourceId: documentId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [relatedProperty, setRelatedProperty] = useState<any>(null);
  const [relatedOffer, setRelatedOffer] = useState<any>(null);
  const [relatedCase, setRelatedCase] = useState<any>(null);
  const [relatedUser, setRelatedUser] = useState<any>(null);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || data.document_name || '',
        description: data.description || '',
        status: data.status || 'draft',
        document_type: data.document_type || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (documentId && data) {
      fetchRelatedData();
    }
  }, [documentId, data]);

  const fetchRelatedData = async () => {
    if (!documentId || !data) return;

    try {
      setLoadingRelated(true);
      const doc = data as any;

      // Fetch related property if exists
      if (doc.property_id) {
        const { data: property } = await supabase
          .from('properties')
          .select('id, title, address')
          .eq('id', doc.property_id)
          .single();
        setRelatedProperty(property);
      }

      // Fetch related offer if exists
      if (doc.offer_id) {
        const { data: offer } = await supabase
          .from('offers')
          .select('id, offer_price')
          .eq('id', doc.offer_id)
          .single();
        setRelatedOffer(offer);
      }

      // Fetch related case if exists
      if (doc.case_id) {
        const { data: caseData } = await supabase
          .from('cases')
          .select('id, title')
          .eq('id', doc.case_id)
          .single();
        setRelatedCase(caseData);
      }

      // Fetch related user if exists (for verification documents)
      if (doc.user_id) {
        const { data: user } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', doc.user_id)
          .single();
        setRelatedUser(user);
      }

      // Fetch signed by user if exists
      if (doc.signed_by) {
        const { data: signer } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', doc.signed_by)
          .single();
        // This could be merged with relatedUser logic
      }
    } catch (err: any) {
      console.error('Error fetching related data:', err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleViewDocument = async (url: string) => {
    try {
      // If it's a storage path, try to get signed URL
      if (url.startsWith('profile-docs/') || url.startsWith('property-docs/')) {
        const bucket = url.startsWith('profile-docs/') ? 'profile-docs' : 'property-docs';
        const path = url.replace(`${bucket}/`, '');
        
        const { data: urlData, error: urlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600);

        if (urlError) throw urlError;
        if (urlData?.signedUrl) {
          window.open(urlData.signedUrl, '_blank');
          return;
        }
      }
      
      // Otherwise, open directly
      window.open(url, '_blank');
    } catch (err: any) {
      toast.error('Error al acceder al documento');
      console.error(err);
    }
  };

  const handleSave = async () => {
    const success = await update(formData);
    if (success) {
      setIsEditing(false);
      onUpdate?.();
    }
  };

  const handleCancel = () => {
    if (data) {
      setFormData({
        title: data.title || data.document_name || '',
        description: data.description || '',
        status: data.status || 'draft',
        document_type: data.document_type || '',
      });
    }
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      signed: { label: 'Firmado', variant: 'default' as const },
      draft: { label: 'Borrador', variant: 'outline' as const },
      pending_signature: { label: 'Pendiente Firma', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'default' as const },
      review: { label: 'En Revisión', variant: 'secondary' as const },
      finalized: { label: 'Finalizado', variant: 'default' as const },
      archived: { label: 'Archivado', variant: 'outline' as const },
      approved: { label: 'Aprobado', variant: 'default' as const },
      rejected: { label: 'Rechazado', variant: 'destructive' as const },
    };
    const config = variants[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error || 'Documento no encontrado'}</p>
      </div>
    );
  }

  const doc = data as any;
  const docUrl = doc.document_url || doc.selfie_url || doc.id_doc_path || doc.poa_doc_path;

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detalles del Documento</h3>
          <p className="text-sm text-muted-foreground">
            {doc.title || doc.document_name || 'Documento sin título'}
          </p>
        </div>
        {!isEditing ? (
          <div className="flex gap-2">
            {docUrl && (
              <Button variant="outline" size="sm" onClick={() => handleViewDocument(docUrl)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="metadata">Metadatos</TabsTrigger>
          <TabsTrigger value="relations">Relaciones</TabsTrigger>
        </TabsList>

        {/* Información General */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  {isEditing ? (
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{doc.title || doc.document_name || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.document_type}
                      onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    >
                      <option value="promesa">Promesa</option>
                      <option value="otrosi">Otrosí</option>
                      <option value="oferta">Oferta</option>
                      <option value="escritura">Escritura</option>
                      <option value="legal">Legal</option>
                      <option value="passport">Pasaporte</option>
                      <option value="cedula">Cédula</option>
                      <option value="cedula_extranjeria">Cédula Extranjería</option>
                      <option value="other">Otro</option>
                    </select>
                  ) : (
                    <Badge variant="outline">{doc.document_type || '-'}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">Borrador</option>
                      <option value="review">En Revisión</option>
                      <option value="pending_signature">Pendiente Firma</option>
                      <option value="signed">Firmado</option>
                      <option value="completed">Completado</option>
                      <option value="finalized">Finalizado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  ) : (
                    <div>{getStatusBadge(doc.status)}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Versión</Label>
                  <p className="text-sm font-medium">{doc.version || 1}</p>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Descripción</Label>
                  {isEditing ? (
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{doc.description || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Creación</Label>
                  <p className="text-sm font-medium">
                    {doc.created_at
                      ? format(new Date(doc.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
                      : '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Última Actualización</Label>
                  <p className="text-sm font-medium">
                    {doc.updated_at || doc.last_modified
                      ? format(new Date(doc.updated_at || doc.last_modified), 'dd/MM/yyyy HH:mm', { locale: es })
                      : '-'}
                  </p>
                </div>

                {doc.signed_at && (
                  <div className="space-y-2">
                    <Label>Fecha de Firma</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(doc.signed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                )}

                {doc.modified_by && (
                  <div className="space-y-2">
                    <Label>Modificado Por</Label>
                    <p className="text-sm font-medium">{doc.modified_by || '-'}</p>
                  </div>
                )}
              </div>

              {docUrl && (
                <div className="mt-4 pt-4 border-t">
                  <Label>Archivo</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(docUrl)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Documento
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = docUrl;
                        link.download = doc.title || doc.document_name || 'documento';
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadatos */}
        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadatos Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {doc.file_size && (
                  <div className="space-y-2">
                    <Label>Tamaño del Archivo</Label>
                    <p className="text-sm font-medium">
                      {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {doc.file_type && (
                  <div className="space-y-2">
                    <Label>Tipo de Archivo</Label>
                    <p className="text-sm font-medium">{doc.file_type}</p>
                  </div>
                )}

                {doc.signature_data && (
                  <div className="space-y-2 col-span-2">
                    <Label>Datos de Firma</Label>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(doc.signature_data, null, 2)}
                    </pre>
                  </div>
                )}

                {doc.document_content && (
                  <div className="space-y-2 col-span-2">
                    <Label>Contenido del Documento</Label>
                    <div className="bg-muted p-4 rounded max-h-96 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap">{doc.document_content}</pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relaciones */}
        <TabsContent value="relations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {relatedProperty && (
                  <div className="space-y-2">
                    <Label>Propiedad Relacionada</Label>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{relatedProperty.title}</p>
                        <p className="text-xs text-muted-foreground">{relatedProperty.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {relatedOffer && (
                  <div className="space-y-2">
                    <Label>Oferta Relacionada</Label>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                        }).format(relatedOffer.offer_price || 0)}
                      </p>
                    </div>
                  </div>
                )}

                {relatedCase && (
                  <div className="space-y-2">
                    <Label>Caso Relacionado</Label>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <p className="text-sm font-medium">{relatedCase.title || `Caso ${relatedCase.id}`}</p>
                    </div>
                  </div>
                )}

                {relatedUser && (
                  <div className="space-y-2">
                    <Label>Usuario Relacionado</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{relatedUser.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{relatedUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {doc.signed_by && (
                  <div className="space-y-2">
                    <Label>Firmado Por</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <p className="text-sm font-medium">{doc.signed_by || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



