import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Star,
  Award,
  Calendar,
  CreditCard,
  AlertTriangle,
  Lightbulb,
  Download,
  Share2
} from 'lucide-react';
import { Offer, User } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { OfferRadarChart } from './OfferRadarChart';

interface OfferComparisonPanelProps {
  propertyId: string;
  offers: Offer[];
  onOfferSelected?: (offer: Offer) => void;
  onCounterOffer?: (offer: Offer) => void;
}

interface ComparisonMetrics {
  offerId: string;
  price: number;
  pricePerSqm: number;
  closingDays: number;
  competitiveness: number;
  riskScore: number;
  netValue: number;
  paymentReliability: number;
}

export const OfferComparisonPanel: React.FC<OfferComparisonPanelProps> = ({
  propertyId,
  offers,
  onOfferSelected,
  onCounterOffer
}) => {
  const [comparisonData, setComparisonData] = useState<ComparisonMetrics[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'competitiveness' | 'closingDays'>('competitiveness');

  // Calculate comparison metrics
  useEffect(() => {
    const calculateMetrics = async () => {
      setLoading(true);
      
      try {
        const metrics: ComparisonMetrics[] = await Promise.all(
          offers.map(async (offer) => {
            // Calculate days until closing
            const closingDate = new Date(offer.closingDate);
            const today = new Date();
            const closingDays = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate competitiveness score (0-100)
            const avgPrice = offers.reduce((sum, o) => sum + o.offerPrice, 0) / offers.length;
            const competitiveness = Math.min(100, Math.max(0, (offer.offerPrice / avgPrice) * 100));

            // Calculate risk score based on payment method and conditions
            let riskScore = 0;
            if (offer.paymentMethod === 'cash') riskScore = 10;
            else if (offer.paymentMethod === 'financing') riskScore = 30;
            else if (offer.paymentMethod === 'crypto') riskScore = 50;
            else riskScore = 40;

            // Add risk for special conditions
            if (offer.conditions && offer.conditions.length > 0) {
              riskScore += offer.conditions.length * 5;
            }

            // Payment reliability based on method
            const paymentReliability = offer.paymentMethod === 'cash' ? 95 : 
                                     offer.paymentMethod === 'financing' ? 80 : 
                                     offer.paymentMethod === 'crypto' ? 70 : 75;

            return {
              offerId: offer.id,
              price: offer.offerPrice,
              pricePerSqm: offer.offerPrice / (offer.property?.area || 1),
              closingDays,
              competitiveness,
              riskScore: Math.min(100, riskScore),
              netValue: offer.offerPrice * 0.95, // Assuming 5% transaction costs
              paymentReliability
            };
          })
        );

        setComparisonData(metrics);
      } catch (error) {
        console.error('Error calculating metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (offers.length > 0) {
      calculateMetrics();
    }
  }, [offers]);

  const sortedOffers = [...offers].sort((a, b) => {
    const aMetrics = comparisonData.find(m => m.offerId === a.id);
    const bMetrics = comparisonData.find(m => m.offerId === b.id);
    
    if (!aMetrics || !bMetrics) return 0;

    switch (sortBy) {
      case 'price':
        return bMetrics.price - aMetrics.price;
      case 'competitiveness':
        return bMetrics.competitiveness - aMetrics.competitiveness;
      case 'closingDays':
        return aMetrics.closingDays - bMetrics.closingDays;
      default:
        return 0;
    }
  });

  const toggleOfferSelection = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const getCompetitivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-100';
    if (score <= 40) return 'text-yellow-600 bg-yellow-100';
    if (score <= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'financing':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'crypto':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (offers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No hay ofertas para comparar
        </h3>
        <p className="text-muted-foreground">
          Las ofertas recibidas aparecerán aquí para su comparación
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Comparación de Ofertas</h2>
            <p className="text-muted-foreground">{offers.length} ofertas recibidas</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Sort Controls */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Ordenar por:</span>
          <div className="flex space-x-2">
            {[
              { value: 'competitiveness', label: 'Competitividad', icon: TrendingUp },
              { value: 'price', label: 'Precio', icon: DollarSign },
              { value: 'closingDays', label: 'Tiempo de cierre', icon: Clock }
            ].map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.value as any)}
              >
                <option.icon className="h-4 w-4 mr-1" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Radar Chart */}
      <OfferRadarChart
        offers={comparisonData.map(metric => ({
          id: metric.offerId,
          buyerName: offers.find(o => o.id === metric.offerId)?.buyer?.name || 'Comprador',
          offerPrice: metric.price,
          paymentMethod: offers.find(o => o.id === metric.offerId)?.payment_method || 'cash',
          closingDays: metric.closingDays,
          competitiveness: metric.competitiveness,
          riskScore: metric.riskScore,
          conditions: offers.find(o => o.id === metric.offerId)?.conditions || []
        }))}
        onOfferSelected={(offerId) => {
          const offer = offers.find(o => o.id === offerId);
          if (offer) onOfferSelected?.(offer);
        }}
      />

      {/* Comparison Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Seleccionar
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Oferta
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Precio
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Pago
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Cierre
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Competitividad
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Riesgo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOffers.map((offer) => {
                const metrics = comparisonData.find(m => m.offerId === offer.id);
                if (!metrics) return null;

                return (
                  <tr key={offer.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOffers.includes(offer.id)}
                        onChange={() => toggleOfferSelection(offer.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {offer.buyer?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{offer.buyer?.name || 'Comprador'}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(offer.createdAt).toLocaleDateString('es-CO')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{formatPrice(metrics.price)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(metrics.pricePerSqm)}/m²
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(offer.paymentMethod)}
                        <span className="text-sm capitalize">{offer.paymentMethod}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metrics.paymentReliability}% confiable
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{metrics.closingDays} días</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getCompetitivenessColor(metrics.competitiveness)}>
                        {Math.round(metrics.competitiveness)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getRiskColor(metrics.riskScore)}>
                        {Math.round(metrics.riskScore)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOfferSelected?.(offer)}
                        >
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCounterOffer?.(offer)}
                        >
                          Contraoferta
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary for Selected Offers */}
      {selectedOffers.length > 0 && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Resumen de Ofertas Seleccionadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {selectedOffers.length}
              </div>
              <div className="text-sm text-muted-foreground">Ofertas seleccionadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(
                  selectedOffers.reduce((sum, id) => {
                    const metrics = comparisonData.find(m => m.offerId === id);
                    return sum + (metrics?.price || 0);
                  }, 0) / selectedOffers.length
                )}
              </div>
              <div className="text-sm text-muted-foreground">Precio promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(
                  selectedOffers.reduce((sum, id) => {
                    const metrics = comparisonData.find(m => m.offerId === id);
                    return sum + (metrics?.competitiveness || 0);
                  }, 0) / selectedOffers.length
                )}%
              </div>
              <div className="text-sm text-muted-foreground">Competitividad promedio</div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Recomendaciones</h3>
        </div>
        
        <div className="space-y-3">
          {(() => {
            const bestOffer = sortedOffers[0];
            const bestMetrics = comparisonData.find(m => m.offerId === bestOffer.id);
            
            if (!bestOffer || !bestMetrics) return null;

            return (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Oferta Recomendada</span>
                </div>
                <p className="text-sm text-green-700">
                  La oferta de <strong>{bestOffer.buyer?.name}</strong> por {formatPrice(bestMetrics.price)} 
                  tiene la mejor combinación de precio competitivo ({Math.round(bestMetrics.competitiveness)}%) 
                  y bajo riesgo ({Math.round(bestMetrics.riskScore)}%).
                </p>
              </div>
            );
          })()}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Consideraciones</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Revisa las condiciones especiales de cada oferta</li>
              <li>• Considera el tiempo de cierre según tus necesidades</li>
              <li>• Evalúa la confiabilidad del método de pago</li>
              <li>• Puedes negociar contraofertas para mejorar los términos</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
