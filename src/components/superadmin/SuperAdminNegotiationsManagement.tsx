import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Handshake, Search, Eye, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ResourceDetailDialog } from './ResourceDetailDialog';

export function SuperAdminNegotiationsManagement() {
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'negotiations' | 'offers'>('negotiations');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedNegotiationId, setSelectedNegotiationId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (viewMode === 'negotiations') {
        const { data, error } = await supabase
          .from('negotiations')
          .select(`
            *,
            property:properties(id, title, address, price),
            buyer:profiles!negotiations_buyer_id_fkey(id, full_name, email),
            seller:profiles!negotiations_seller_id_fkey(id, full_name, email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNegotiations(data || []);
      } else {
        const { data, error } = await supabase
          .from('offers')
          .select(`
            *,
            property:properties!offers_property_id_fkey(id, title, address, price),
            buyer:profiles!offers_buyer_id_fkey(id, full_name, email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOffers(data || []);
      }
    } catch (error: any) {
      toast.error('Error al cargar datos: ' + error.message);
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
    const variants: Record<string, any> = {
      active: { label: 'Activa', variant: 'default' as const },
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      accepted: { label: 'Aceptada', variant: 'default' as const },
      rejected: { label: 'Rechazada', variant: 'destructive' as const },
      countered: { label: 'Contraoferta', variant: 'outline' as const },
      completed: { label: 'Completada', variant: 'default' as const }
    };
    const config = variants[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredNegotiations = negotiations.filter(n =>
    n.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.seller?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOffers = offers.filter(o =>
    o.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Negociaciones</h2>
          <p className="text-muted-foreground">
            Ver y gestionar todas las negociaciones y ofertas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'negotiations' ? 'default' : 'outline'}
            onClick={() => setViewMode('negotiations')}
          >
            Negociaciones
          </Button>
          <Button
            variant={viewMode === 'offers' ? 'default' : 'outline'}
            onClick={() => setViewMode('offers')}
          >
            Ofertas
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar negociaciones u ofertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {viewMode === 'negotiations' ? (
        <Card>
          <CardHeader>
            <CardTitle>Negociaciones ({filteredNegotiations.length})</CardTitle>
            <CardDescription>Todas las negociaciones activas y completadas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredNegotiations.length === 0 ? (
              <div className="text-center py-12">
                <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron negociaciones</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNegotiations.map((neg) => (
                  <div key={neg.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{neg.property?.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Comprador: {neg.buyer?.full_name} | Vendedor: {neg.seller?.full_name}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge>{formatCurrency(neg.current_price || 0)}</Badge>
                          {getStatusBadge(neg.status)}
                          <span className="text-sm text-muted-foreground">
                            {neg.offer_count || 0} ofertas
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedNegotiationId(neg.id);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ofertas ({filteredOffers.length})</CardTitle>
            <CardDescription>Todas las ofertas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron ofertas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Propiedad</th>
                      <th className="text-left p-4">Comprador</th>
                      <th className="text-left p-4">Precio Oferta</th>
                      <th className="text-left p-4">Estado</th>
                      <th className="text-left p-4">Fecha</th>
                      <th className="text-right p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{offer.property?.title}</div>
                          <div className="text-sm text-muted-foreground">{offer.property?.address}</div>
                        </td>
                        <td className="p-4">
                          <div>{offer.buyer?.full_name || '-'}</div>
                          <div className="text-sm text-muted-foreground">{offer.buyer?.email}</div>
                        </td>
                        <td className="p-4 font-medium">{formatCurrency(offer.offer_price || 0)}</td>
                        <td className="p-4">{getStatusBadge(offer.status)}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {offer.created_at ? format(new Date(offer.created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/offers/${offer.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Negotiation Details Dialog */}
      <ResourceDetailDialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open);
          if (!open) {
            setSelectedNegotiationId(null);
          }
        }}
        resourceType="negotiation"
        resourceId={selectedNegotiationId}
        onUpdate={() => {
          fetchData();
        }}
      />
    </div>
  );
}

