import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types/database';
import { User, Mail, Phone, MapPin, Globe, FileText, Settings, Shield, Bell } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error al cargar el perfil');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Error al actualizar el perfil');
        return;
      }

      setProfile({ ...profile, ...updates });
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Profile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handlePreferenceChange = (key: string, value: any) => {
    if (!profile) return;
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Perfil</h1>
          <p className="text-muted-foreground mt-2">Gestiona tu información personal y preferencias</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {profile.role === 'admin' ? 'Administrador' :
           profile.role === 'lawyer' ? 'Abogado' :
           profile.role === 'agent' ? 'Agente' :
           profile.role === 'super_admin' ? 'Super Admin' : 'Usuario'}
        </Badge>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal básica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ciudad, País"
                />
              </div>

              <Button 
                onClick={() => updateProfile(profile)} 
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
              <CardDescription>
                Mantén tu información de contacto actualizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+57 300 123 4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://tu-sitio.com"
                />
              </div>

              <Button 
                onClick={() => updateProfile(profile)} 
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferencias
              </CardTitle>
              <CardDescription>
                Configura tus preferencias de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tema</Label>
                    <p className="text-sm text-muted-foreground">Elige tu tema preferido</p>
                  </div>
                  <Select
                    value={profile.preferences?.theme || 'light'}
                    onValueChange={(value) => handlePreferenceChange('theme', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Idioma</Label>
                    <p className="text-sm text-muted-foreground">Idioma de la interfaz</p>
                  </div>
                  <Select
                    value={profile.preferences?.language || 'es'}
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones</Label>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones</p>
                  </div>
                  <Switch
                    checked={profile.preferences?.notifications ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">Recibir actualizaciones por correo</p>
                  </div>
                  <Switch
                    checked={profile.preferences?.emailUpdates ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('emailUpdates', checked)}
                  />
                </div>
              </div>

              <Button 
                onClick={() => updateProfile(profile)} 
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Guardando...' : 'Guardar Preferencias'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad y Privacidad
              </CardTitle>
              <CardDescription>
                Gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Estado de la Cuenta</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                    {profile.status === 'active' ? 'Activa' : 
                     profile.status === 'inactive' ? 'Inactiva' :
                     profile.status === 'suspended' ? 'Suspendida' : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Último Acceso</Label>
                <p className="text-sm text-muted-foreground">
                  {profile.last_login_at 
                    ? new Date(profile.last_login_at).toLocaleString('es-ES')
                    : 'Nunca'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>Miembro desde</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Cambiar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
