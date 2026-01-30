import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  User,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scale,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { CounterOfferForm } from './CounterOfferForm';
import { OfferComparison } from './OfferComparison';
import { useNavigate } from 'react-router-dom';

interface Negotiation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  lawyer_id: string | null;
  agent_id: string | null;
  status: string;
  current_price: number;
  original_price: number;
  price_difference: number;
  price_change_percentage: number;
  negotiation_progress: number;
  offer_count: number;
  counter_offer_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
  };
  buyer: {
    id: string;
    full_name: string;
    email: string;
  };
  seller: {
    id: string;
    full_name: string;
    email: string;
  };
  lawyer: {
    id: string;
    full_name: string;
  } | null;
  offers: Offer[];
}

interface Offer {
  id: string;
  offer_price: number;
  original_price: number;
  payment_method: string;
  closing_date: string;
  status: string;
  conditions: string[];
  created_at: string;
  buyer_id: string;
  seller_id: string;
}

export const NegotiationsView: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchNegotiations();
    }
  }, [user?.id]);

  const fetchNegotiations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch negotiations where user is buyer, seller, lawyer, or agent
      const { data, error } = await supabase
        .from('negotiations')
        .select(`
          *,
          property:properties(id, title, address, price),
          buyer:profiles!negotiations_buyer_id_fkey(id, full_name, email),
          seller:profiles!negotiations_seller_id_fkey(id, full_name, email),
          lawyer:profiles!negotiations_lawyer_id_fkey(id, full_name),
          offers:offers(
            id,
            offer_price,
            original_price,
            payment_method,
            closing_date,
            status,
            conditions,
            created_at,
            buyer_id,
            seller_id
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id},lawyer_id.eq.${user.id},agent_id.eq.${user.id}`)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Activa', variant: 'default' },
      pending_lawyer: { label: 'Pendiente Abogado', variant: 'secondary' },
      pending_documents: { label: 'Pendiente Documentos', variant: 'secondary' },
      completed: { label: 'Completada', variant: 'default' },
      cancelled: { label: 'Cancelada', variant: 'destructive' },
      expired: { label: 'Expirada', variant: 'outline' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUserRole = (negotiation: Negotiation): 'buyer' | 'seller' | 'lawyer' | 'agent' => {
    if (negotiation.buyer_id === user?.id) return 'buyer';
    if (negotiation.seller_id === user?.id) return 'seller';
    if (negotiation.lawyer_id === user?.id) return 'lawyer';
    if (negotiation.agent_id === user?.id) return 'agent';
    return 'buyer';
  };

  const filteredNegotiations = negotiations.filter(neg => {
    if (activeTab === 'all') return true;
    return neg.status === activeTab;
  });

  const handleCounterOffer = (negotiation: Negotiation) => {
    setSelectedNegotiation(negotiation);
    setShowCounterOffer(true);
  };

  const handleViewNegotiation = (negotiation: Negotiation) => {
    navigate(`/negotiations/${negotiation.id}`);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mis Negociaciones
          </CardTitle>
          <CardDescription>
            Gestiona todas tus negociaciones activas y pasadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="active">Activas</TabsTrigger>
              <TabsTrigger value="pending_lawyer">Pendiente Abogado</TabsTrigger>
              <TabsTrigger value="pending_documents">Pendiente Docs</TabsTrigger>
              <TabsTrigger value="completed">Completadas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {filteredNegotiations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay negociaciones en esta categoría</p>
                </div>
              ) : (
                filteredNegotiations.map((negotiation) => {
                  const userRole = getUserRole(negotiation);
                  const isBuyer = userRole === 'buyer';
                  const isSeller = userRole === 'seller';
                  const latestOffer = negotiation.offers?.[negotiation.offers.length - 1];
                  const priceTrend = negotiation.price_difference > 0 ? 'up' : negotiation.price_difference < 0 ? 'down' : 'neutral';

                  return (
                    <Card key={negotiation.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 className="w-5 h-5 text-gray-400" />
                              <CardTitle className="text-lg">{negotiation.property?.title}</CardTitle>
                              {getStatusBadge(negotiation.status)}
                            </div>
                            <CardDescription className="flex items-center gap-4 mt-2">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {isBuyer ? 'Vendedor' : 'Comprador'}: {isBuyer ? negotiation.seller?.full_name : negotiation.buyer?.full_name}
                              </span>
                              {negotiation.lawyer && (
                                <span className="flex items-center gap-1">
                                  <Scale className="w-4 h-4" />
                                  Abogado: {negotiation.lawyer.full_name}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Financial Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Precio Actual</p>
                            <p className="text-xl font-bold">{formatCurrency(negotiation.current_price)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Precio Original</p>
                            <p className="text-lg">{formatCurrency(negotiation.original_price)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Diferencia</p>
                            <div className="flex items-center gap-2">
                              {priceTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                              {priceTrend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                              <p className={`text-lg font-semibold ${priceTrend === 'up' ? 'text-green-600' : priceTrend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                                {priceTrend === 'up' ? '+' : ''}{formatCurrency(Math.abs(negotiation.price_difference))}
                              </p>
                              <span className={`text-sm ${priceTrend === 'up' ? 'text-green-600' : priceTrend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                                ({negotiation.price_change_percentage > 0 ? '+' : ''}{negotiation.price_change_percentage.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Negotiation Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-600">Ofertas</p>
                            <p className="text-lg font-semibold">{negotiation.offer_count}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Contraofertas</p>
                            <p className="text-lg font-semibold">{negotiation.counter_offer_count}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Progreso</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${negotiation.negotiation_progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{negotiation.negotiation_progress}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Última Actualización</p>
                            <p className="text-sm">
                              {format(new Date(negotiation.updated_at), "d MMM yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>

                        {/* Latest Offer Info */}
                        {latestOffer && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-2">Última Oferta</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{formatCurrency(latestOffer.offer_price)}</p>
                                <p className="text-sm text-gray-500">
                                  Cierre: {format(new Date(latestOffer.closing_date), "d MMM yyyy", { locale: es })}
                                </p>
                              </div>
                              <Badge variant={latestOffer.status === 'pending' ? 'secondary' : 'default'}>
                                {latestOffer.status}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewNegotiation(negotiation)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                          {isSeller && negotiation.status === 'active' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCounterOffer(negotiation)}
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Hacer Contraoferta
                            </Button>
                          )}
                          {isBuyer && negotiation.status === 'active' && latestOffer?.status === 'countered' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCounterOffer(negotiation)}
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Responder Contraoferta
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Counter Offer Dialog */}
      {selectedNegotiation && showCounterOffer && (
        <CounterOfferForm
          originalOffer={selectedNegotiation.offers?.[selectedNegotiation.offers.length - 1]}
          property={selectedNegotiation.property}
          negotiationRules={{}}
          isOpen={showCounterOffer}
          onOpenChange={setShowCounterOffer}
          onSubmit={async (counterOffer) => {
            await fetchNegotiations();
            setShowCounterOffer(false);
            setSelectedNegotiation(null);
          }}
        />
      )}
    </div>
  );
};

