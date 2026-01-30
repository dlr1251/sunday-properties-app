import React, { useState, useEffect } from 'react';
import { useResourceDetail } from '../../../hooks/superadmin/useResourceDetail';
import { UserEventTimeline } from '../components/UserEventTimeline';
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
  Home,
  User,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { Skeleton } from '../../ui/skeleton';

interface UserDetailViewProps {
  userId: string | null;
  onUpdate?: () => void;
}

export function UserDetailView({ userId, onUpdate }: UserDetailViewProps) {
  const { data, loading, error, update, refresh } = useResourceDetail({
    resourceType: 'user',
    resourceId: userId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [verificationDocs, setVerificationDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    if (data) {
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'user',
        status: data.status || 'active',
        verification_status: data.verification_status || 'unverified',
      });
    }
  }, [data]);

  useEffect(() => {
    if (userId) {
      fetchVerificationDocuments();
    }
  }, [userId]);

  const fetchVerificationDocuments = async () => {
    if (!userId) return;

    try {
      setLoadingDocs(true);
      const { data: docs, error: docsError } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setVerificationDocs(docs || []);
    } catch (err: any) {
      console.error('Error fetching verification documents:', err);
      toast.error('Error al cargar documentos de verificación');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleViewDocument = async (path: string) => {
    try {
      // Try to get signed URL from storage
      const { data: urlData, error: urlError } = await supabase.storage
        .from('profile-docs')
        .createSignedUrl(path, 3600);

      if (urlError) throw urlError;
      if (urlData?.signedUrl) {
        window.open(urlData.signedUrl, '_blank');
      }
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
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'user',
        status: data.status || 'active',
        verification_status: data.verification_status || 'unverified',
      });
    }
    setIsEditing(false);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      super_admin: { label: 'Super Admin', variant: 'destructive' },
      admin: { label: 'Admin', variant: 'default' },
      lawyer: { label: 'Abogado', variant: 'secondary' },
      agent: { label: 'Agente', variant: 'outline' },
      user: { label: 'Usuario', variant: 'outline' },
    };
    const config = variants[role] || { label: role, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'verified') {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Verificado
        </Badge>
      );
    }
    return <Badge variant="outline">Pendiente</Badge>;
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
        <p className="text-destructive">{error || 'Usuario no encontrado'}</p>
      </div>
    );
  }

  const propertiesOwned = (data as any).properties_owned || [];
  const propertiesAgent = (data as any).properties_agent || [];

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detalles del Usuario</h3>
          <p className="text-sm text-muted-foreground">{data.email}</p>
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
          <TabsTrigger value="properties">Propiedades ({propertiesOwned.length + propertiesAgent.length})</TabsTrigger>
          <TabsTrigger value="documents">Documentos ({verificationDocs.length})</TabsTrigger>
          <TabsTrigger value="events">Historial</TabsTrigger>
        </TabsList>

        {/* Información Básica */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  {isEditing ? (
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{data.full_name || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{data.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{data.phone || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="user">Usuario</option>
                      <option value="agent">Agente</option>
                      <option value="lawyer">Abogado</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  ) : (
                    <div>{getRoleBadge(data.role)}</div>
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
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="suspended">Suspendido</option>
                      <option value="pending">Pendiente</option>
                    </select>
                  ) : (
                    <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
                      {data.status || 'active'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estado de Verificación</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.verification_status}
                      onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })}
                    >
                      <option value="unverified">No Verificado</option>
                      <option value="pending">Pendiente</option>
                      <option value="verified">Verificado</option>
                      <option value="rejected">Rechazado</option>
                    </select>
                  ) : (
                    <div>{getStatusBadge(data.verification_status || 'unverified')}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Registro</Label>
                  <p className="text-sm font-medium">
                    {data.created_at
                      ? format(new Date(data.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
                      : '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Última Actualización</Label>
                  <p className="text-sm font-medium">
                    {data.updated_at
                      ? format(new Date(data.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Propiedades Relacionadas */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Propiedades como Propietario ({propertiesOwned.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {propertiesOwned.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tiene propiedades como propietario</p>
              ) : (
                <div className="space-y-2">
                  {propertiesOwned.map((prop: any) => (
                    <div key={prop.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Home className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{prop.title}</p>
                          <p className="text-sm text-muted-foreground">{prop.address}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{prop.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propiedades como Agente ({propertiesAgent.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {propertiesAgent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tiene propiedades como agente</p>
              ) : (
                <div className="space-y-2">
                  {propertiesAgent.map((prop: any) => (
                    <div key={prop.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Home className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{prop.title}</p>
                          <p className="text-sm text-muted-foreground">{prop.address}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{prop.status}</Badge>
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
              <CardTitle>Documentos de Verificación</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDocs ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : verificationDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay documentos de verificación</p>
              ) : (
                <div className="space-y-2">
                  {verificationDocs.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.document_type || 'Documento'}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.created_at
                              ? format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: es })
                              : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === 'approved' ? 'default' : 'outline'}>
                          {doc.status}
                        </Badge>
                        {doc.document_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(doc.document_url)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historial de Eventos */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Eventos</CardTitle>
              <CardDescription>Registro, verificación y acciones importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <UserEventTimeline userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

