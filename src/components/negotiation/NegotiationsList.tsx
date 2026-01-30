import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  DollarSign,
  Calendar,
  User,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Negotiation {
  id: string;
  title: string;
  status: string;
  buyer_id: string;
  seller_id: string;
  participants: string[];
  property_id: string;
  current_price: number;
  original_price: number;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    price: number;
    neighborhood: string;
    city: string;
  };
  buyer?: {
    full_name: string;
    email: string;
  };
  seller?: {
    full_name: string;
    email: string;
  };
}

export const NegotiationsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNegotiations();
  }, [user]);

  const fetchNegotiations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('negotiations')
        .select(`
          *,
          property:properties(title, price, neighborhood, city),
          buyer:profiles!negotiations_buyer_id_fkey(full_name, email),
          seller:profiles!negotiations_seller_id_fkey(full_name, email)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id},lawyer_id.eq.${user.id},agent_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setNegotiations(data || []);
    } catch (err) {
      console.error('Error fetching negotiations:', err);
      setError('Error al cargar las negociaciones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activa', variant: 'default' as const, icon: Clock },
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: AlertCircle },
      completed: { label: 'Completada', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: XCircle },
      pending_lawyer: { label: 'Pendiente Abogado', variant: 'outline' as const, icon: AlertCircle },
      pending_documents: { label: 'Pendiente Documentos', variant: 'outline' as const, icon: AlertCircle }
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando negociaciones...</h1>
          <p className="text-gray-600 mt-2">Estamos obteniendo tus negociaciones activas</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Negociaciones</h1>
        <p className="text-gray-700 text-lg">
          Gestiona todas tus negociaciones inmobiliarias activas e históricas.
        </p>
      </div>

      {negotiations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes negociaciones</h3>
            <p className="text-gray-700 mb-4">
              Aún no has iniciado ninguna negociación. Explora propiedades disponibles para comenzar.
            </p>
            <Button onClick={() => navigate('/properties')}>
              Explorar Propiedades
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {negotiations.map((negotiation) => (
            <Card key={negotiation.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/negotiations/${negotiation.id}`)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1 font-semibold text-gray-900">{negotiation.title}</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      {negotiation.property?.title} • {negotiation.property?.neighborhood}, {negotiation.property?.city}
                    </CardDescription>
                  </div>
                  {getStatusBadge(negotiation.status)}
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-700" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Precio Actual</p>
                      <p className="font-bold text-gray-900">{formatCurrency(negotiation.current_price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-700" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {negotiation.buyer_id === user?.id ? 'Vendedor' : 'Comprador'}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {negotiation.buyer_id === user?.id
                          ? negotiation.seller?.full_name || negotiation.seller?.email
                          : negotiation.buyer?.full_name || negotiation.buyer?.email
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-700" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Última actualización</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(negotiation.updated_at), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Creada {format(new Date(negotiation.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                  </div>
                  <Button variant="outline" size="sm" className="font-medium">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
