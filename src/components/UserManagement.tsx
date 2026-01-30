import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Profile } from "../types/database";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

export function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "user" as const,
    phone: "",
    status: "active" as const,
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Error al cargar perfiles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (profile?: Profile) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        role: profile.role,
        phone: profile.phone || "",
        status: profile.status,
      });
    } else {
      setEditingProfile(null);
      setFormData({
        full_name: "",
        email: "",
        role: "user",
        phone: "",
        status: "active",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProfile(null);
    setFormData({
      full_name: "",
      email: "",
      role: "user",
      phone: "",
      status: "active",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProfile.id);

        if (error) throw error;
        toast.success('Perfil actualizado correctamente');
      } else {
        // Create new profile (this would typically be done through auth signup)
        toast.error('Los perfiles se crean automáticamente al registrarse');
        return;
      }

      await fetchProfiles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar perfil');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este perfil?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Perfil eliminado correctamente');
      await fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Error al eliminar perfil');
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'lawyer': return 'secondary';
      case 'agent': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los perfiles de usuario del sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Último Acceso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  {profile.full_name || 'Sin nombre'}
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(profile.role)}>
                    {profile.role === 'super_admin' ? 'Super Admin' :
                     profile.role === 'admin' ? 'Admin' :
                     profile.role === 'lawyer' ? 'Abogado' :
                     profile.role === 'agent' ? 'Agente' : 'Usuario'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(profile.status)}>
                    {profile.status === 'active' ? 'Activo' :
                     profile.status === 'inactive' ? 'Inactivo' :
                     profile.status === 'suspended' ? 'Suspendido' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>{profile.phone || 'No especificado'}</TableCell>
                <TableCell>
                  {profile.last_login_at 
                    ? new Date(profile.last_login_at).toLocaleDateString('es-ES')
                    : 'Nunca'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(profile)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? 'Editar Perfil' : 'Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full p-2 border rounded-md"
              >
                <option value="user">Usuario</option>
                <option value="agent">Agente</option>
                <option value="lawyer">Abogado</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border rounded-md"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProfile ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}