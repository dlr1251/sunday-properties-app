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
  Home,
  User,
  Handshake,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
  Users,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { Skeleton } from '../../ui/skeleton';

interface NegotiationDetailViewProps {
  negotiationId: string | null;
  onUpdate?: () => void;
}

export function NegotiationDetailView({ negotiationId, onUpdate }: NegotiationDetailViewProps) {
  const { data, loading, error, update, refresh } = useResourceDetail({
    resourceType: 'negotiation',
    resourceId: negotiationId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [legalDocs, setLegalDocs] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    if (data) {
      setFormData({
        status: data.status || 'active',
        negotiation_progress: data.negotiation_progress || 0,
        metadata: data.metadata || {},
      });
    }
  }, [data]);

  useEffect(() => {
    if (negotiationId) {
      fetchRelatedData();
    }
  }, [negotiationId]);

  const fetchRelatedData = async () => {
    if (!negotiationId) return;

    try {
      setLoadingRelated(true);

      // Fetch legal documents
      const { data: docs } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('negotiation_id', negotiationId)
        .order('created_at', { ascending: false });

      setLegalDocs(docs || []);

      // Fetch offers
      const { data: offersData } = await supabase
        .from('offers')
        .select('*')
        .eq('negotiation_id', negotiationId)
        .order('created_at', { ascending: false });

      setOffers(offersData || []);

      // Fetch actions
      const { data: actionsData } = await supabase
        .from('negotiation_actions')
        .select('*')
        .eq('negotiation_id', negotiationId)
        .order('created_at', { ascending: false });

      setActions(actionsData || []);
    } catch (err: any) {
      console.error('Error fetching related data:', err);
      toast.error('Error al cargar datos relacionados');
    } finally {
      setLoadingRelated(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = async () => {
    const success = await update(formData);
    if (success) {
      setIsEditing(false);
      onUpdate?.();
      await fetchRelatedData();
    }
  };

  const handleCancel = () => {
    if (data) {
      setFormData({
        status: data.status || 'active',
        negotiation_progress: data.negotiation_progress || 0,
        metadata: data.metadata || {},
      });
    }
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { label: 'Activa', variant: 'default' as const },
      pending_lawyer: { label: 'Pendiente Abogado', variant: 'secondary' as const },
      pending_documents: { label: 'Pendiente Documentos', variant: 'secondary' as const },
      completed: { label: 'Completada', variant: 'default' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const },
      expired: { label: 'Expirada', variant: 'outline' as const },
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
        <p className="text-destructive">{error || 'Negociación no encontrada'}</p>
      </div>
    );
  }

  const negotiation = data as any;
  const property = negotiation.property;
  const participants = negotiation.participants || [];

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detalles de la Negociación</h3>
          <p className="text-sm text-muted-foreground">
            Propiedad: {property?.title || 'N/A'}
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
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
          <TabsTrigger value="participants">Participantes ({participants.length})</TabsTrigger>
          <TabsTrigger value="offers">Ofertas ({offers.length})</TabsTrigger>
          <TabsTrigger value="documents">Documentos ({legalDocs.length})</TabsTrigger>
          <TabsTrigger value="actions">Acciones ({actions.length})</TabsTrigger>
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
                  <Label>Estado</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Activa</option>
                      <option value="pending_lawyer">Pendiente Abogado</option>
                      <option value="pending_documents">Pendiente Documentos</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="expired">Expirada</option>
                    </select>
                  ) : (
                    <div>{getStatusBadge(negotiation.status)}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Progreso de Negociación</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.negotiation_progress}
                      onChange={(e) => setFormData({ ...formData, negotiation_progress: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${negotiation.negotiation_progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{negotiation.negotiation_progress || 0}%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Propiedad</Label>
                  {property ? (
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{property.title}</p>
                        <p className="text-xs text-muted-foreground">{property.address}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No asignada</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Precio Original</Label>
                  <p className="text-sm font-medium">{formatCurrency(negotiation.original_price || 0)}</p>
                </div>

                <div className="space-y-2">
                  <Label>Precio Actual</Label>
                  <p className="text-sm font-medium">{formatCurrency(negotiation.current_price || 0)}</p>
                </div>

                <div className="space-y-2">
                  <Label>Diferencia de Precio</Label>
                  <p className={`text-sm font-medium ${negotiation.price_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {negotiation.price_difference ? formatCurrency(negotiation.price_difference) : '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cambio de Precio (%)</Label>
                  <p className={`text-sm font-medium ${negotiation.price_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {negotiation.price_change_percentage !== null && negotiation.price_change_percentage !== undefined
                      ? `${negotiation.price_change_percentage.toFixed(2)}%`
                      : '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Número de Ofertas</Label>
                  <p className="text-sm font-medium">{negotiation.offer_count || 0}</p>
                </div>

                <div className="space-y-2">
                  <Label>Contraofertas</Label>
                  <p className="text-sm font-medium">{negotiation.counter_offer_count || 0}</p>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Creación</Label>
                  <p className="text-sm font-medium">
                    {negotiation.created_at
                      ? format(new Date(negotiation.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
                      : '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Última Actualización</Label>
                  <p className="text-sm font-medium">
                    {negotiation.updated_at
                      ? format(new Date(negotiation.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })
                      : '-'}
                  </p>
                </div>

                {negotiation.completed_at && (
                  <div className="space-y-2">
                    <Label>Fecha de Finalización</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(negotiation.completed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                )}

                {negotiation.expires_at && (
                  <div className="space-y-2">
                    <Label>Fecha de Expiración</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(negotiation.expires_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                )}
              </div>

              {negotiation.milestones_completed && Object.keys(negotiation.milestones_completed).length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Hitos Completados</Label>
                  <div className="space-y-1">
                    {Object.entries(negotiation.milestones_completed).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{key}</Badge>
                        <span className="text-muted-foreground">
                          {value.completed_at ? format(new Date(value.completed_at), 'dd/MM/yyyy', { locale: es }) : 'Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participantes */}
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRelated ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay participantes registrados</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant: any) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{participant.user?.full_name || '-'}</p>
                          <p className="text-sm text-muted-foreground">{participant.user?.email}</p>
                          <Badge variant="outline" className="mt-1">{participant.role}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.can_sign_documents && (
                          <Badge variant="secondary">Puede Firmar</Badge>
                        )}
                        {participant.can_view_financials && (
                          <Badge variant="secondary">Ver Financiero</Badge>
                        )}
                        <Badge variant={participant.is_active ? 'default' : 'outline'}>
                          {participant.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ofertas */}
        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ofertas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRelated ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : offers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay ofertas registradas</p>
              ) : (
                <div className="space-y-2">
                  {offers.map((offer: any) => (
                    <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{formatCurrency(offer.offer_price || 0)}</p>
                          <p className="text-sm text-muted-foreground">
                            {offer.created_at ? format(new Date(offer.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : '-'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{offer.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Legales</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRelated ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : legalDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay documentos asociados</p>
              ) : (
                <div className="space-y-2">
                  {legalDocs.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.document_type || 'Documento'}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.created_at ? format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={doc.status === 'signed' ? 'default' : 'outline'}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Acciones */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acciones y Actuaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRelated ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay acciones registradas</p>
              ) : (
                <div className="space-y-2">
                  {actions.map((action: any) => (
                    <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{action.title}</p>
                          <p className="text-sm text-muted-foreground">{action.description || '-'}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.created_at ? format(new Date(action.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : '-'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{action.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



