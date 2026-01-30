import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Scale,
  User,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface Negotiation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  lawyer_id: string | null;
  status: string;
  current_price: number;
  created_at: string;
  property: {
    title: string;
    address: string;
  };
  buyer: {
    full_name: string;
  };
  seller: {
    full_name: string;
  };
  lawyer: {
    full_name: string;
  } | null;
}

interface Lawyer {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface AdminNegotiationAssignmentProps {
  onAssignmentComplete?: () => void;
}

export const AdminNegotiationAssignment: React.FC<AdminNegotiationAssignmentProps> = ({
  onAssignmentComplete
}) => {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNegotiations();
    fetchLawyers();
  }, []);

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('negotiations')
        .select(`
          *,
          property:properties(id, title, address),
          buyer:profiles!negotiations_buyer_id_fkey(id, full_name),
          seller:profiles!negotiations_seller_id_fkey(id, full_name),
          lawyer:profiles!negotiations_lawyer_id_fkey(id, full_name)
        `)
        .in('status', ['active', 'pending_lawyer'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNegotiations(data || []);
    } catch (error: any) {
      console.error('Error fetching negotiations:', error);
      toast.error('Error al cargar las negociaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'lawyer')
        .order('full_name');

      if (error) throw error;
      setLawyers(data || []);
    } catch (error: any) {
      console.error('Error fetching lawyers:', error);
      toast.error('Error al cargar los abogados');
    }
  };

  const handleAssignLawyer = async (negotiationId: string, lawyerId: string) => {
    setAssigning(negotiationId);
    try {
      const { error } = await supabase
        .from('negotiations')
        .update({
          lawyer_id: lawyerId,
          status: 'pending_documents',
          updated_at: new Date().toISOString()
        })
        .eq('id', negotiationId);

      if (error) throw error;

      // Create notification for lawyer
      const negotiation = negotiations.find(n => n.id === negotiationId);
      if (negotiation) {
        await supabase
          .from('notifications')
          .insert({
            user_id: lawyerId,
            type: 'lawyer_assigned',
            title: 'Has sido asignado a una negociación',
            message: `Has sido asignado como abogado para la negociación de ${negotiation.property.title}`,
            related_id: negotiationId,
            related_type: 'offer',
            related_negotiation_id: negotiationId
          });

        // Notify buyer and seller
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: negotiation.buyer_id,
              type: 'lawyer_assigned',
              title: 'Abogado asignado',
              message: `Un abogado ha sido asignado a tu negociación`,
              related_id: negotiationId,
              related_type: 'offer',
              related_negotiation_id: negotiationId
            },
            {
              user_id: negotiation.seller_id,
              type: 'lawyer_assigned',
              title: 'Abogado asignado',
              message: `Un abogado ha sido asignado a tu negociación`,
              related_id: negotiationId,
              related_type: 'offer',
              related_negotiation_id: negotiationId
            }
          ]);
      }

      toast.success('Abogado asignado exitosamente');
      await fetchNegotiations();
      onAssignmentComplete?.();
    } catch (error: any) {
      console.error('Error assigning lawyer:', error);
      toast.error('Error al asignar el abogado');
    } finally {
      setAssigning(null);
    }
  };

  const filteredNegotiations = negotiations.filter(neg => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      neg.property?.title?.toLowerCase().includes(search) ||
      neg.buyer?.full_name?.toLowerCase().includes(search) ||
      neg.seller?.full_name?.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando negociaciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Asignación de Abogados
        </CardTitle>
        <CardDescription>
          Asigna abogados a negociaciones pendientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por propiedad, comprador o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propiedad</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Precio Actual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Abogado Actual</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNegotiations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay negociaciones pendientes de asignación
                  </TableCell>
                </TableRow>
              ) : (
                filteredNegotiations.map((negotiation) => (
                  <TableRow key={negotiation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{negotiation.property?.title}</p>
                          <p className="text-sm text-gray-500">{negotiation.property?.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {negotiation.buyer?.full_name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {negotiation.seller?.full_name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{formatCurrency(negotiation.current_price)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={negotiation.status === 'pending_lawyer' ? 'secondary' : 'default'}>
                        {negotiation.status === 'pending_lawyer' ? 'Pendiente Abogado' : 'Activa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {negotiation.lawyer ? (
                        <span className="text-sm">{negotiation.lawyer.full_name}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={negotiation.lawyer_id || ''}
                        onValueChange={(lawyerId) => handleAssignLawyer(negotiation.id, lawyerId)}
                        disabled={assigning === negotiation.id}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Seleccionar abogado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin asignar</SelectItem>
                          {lawyers.map((lawyer) => (
                            <SelectItem key={lawyer.id} value={lawyer.id}>
                              {lawyer.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

