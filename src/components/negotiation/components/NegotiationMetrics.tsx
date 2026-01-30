import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  DollarSign,
  Target,
  Users,
  Calendar
} from 'lucide-react';
import { Property } from '../../../types/database';
import { Offer } from '../../../lib/db/repositories/offers.repo';

interface NegotiationMetricsProps {
  offers: Offer[];
  property: Property;
  stats?: {
    totalOffers: number;
    acceptedOffers: number;
    averageOffer: number;
    highestOffer: number;
    lowestOffer: number;
    negotiationProgress: number;
  };
}

export const NegotiationMetrics: React.FC<NegotiationMetricsProps> = ({
  offers,
  property,
  stats
}) => {
  // Calculate metrics if not provided
  const totalOffers = stats?.totalOffers || offers.length;
  const acceptedOffers = stats?.acceptedOffers || offers.filter(o => o.status === 'accepted').length;
  const averageOffer = stats?.averageOffer || (offers.length > 0 
    ? offers.reduce((sum, offer) => sum + offer.offer_price, 0) / offers.length 
    : 0);
  const highestOffer = stats?.highestOffer || (offers.length > 0 
    ? Math.max(...offers.map(o => o.offer_price)) 
    : 0);
  const lowestOffer = stats?.lowestOffer || (offers.length > 0 
    ? Math.min(...offers.map(o => o.offer_price)) 
    : 0);
  const negotiationProgress = stats?.negotiationProgress || (totalOffers > 0 
    ? Math.min((acceptedOffers / totalOffers) * 100, 100)
    : 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const priceDifference = highestOffer - lowestOffer;
  const priceRange = highestOffer > 0 ? (priceDifference / highestOffer) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Negotiation Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Progreso de Negociación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ofertas Aceptadas</span>
              <span>{acceptedOffers} / {totalOffers}</span>
            </div>
            <Progress value={negotiationProgress} className="h-2" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(negotiationProgress)}% completado
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{acceptedOffers}</div>
              <div className="text-sm text-muted-foreground">Aceptadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {offers.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Análisis de Precios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Oferta Promedio</span>
              <span className="font-bold">{formatCurrency(averageOffer)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Oferta Más Alta</span>
              <span className="font-bold text-green-600">{formatCurrency(highestOffer)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Oferta Más Baja</span>
              <span className="font-bold text-red-600">{formatCurrency(lowestOffer)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Rango de Precios</span>
              <span className="font-bold">{formatCurrency(priceDifference)}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Variabilidad de Precios</span>
                <span>{Math.round(priceRange)}%</span>
              </div>
              <Progress value={priceRange} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {priceRange < 10 ? 'Precios muy consistentes' :
                 priceRange < 25 ? 'Precios moderadamente variables' :
                 'Precios muy variables'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Análisis Temporal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Primera Oferta</span>
              <span className="text-sm">
                {offers.length > 0 
                  ? new Date(Math.min(...offers.map(o => new Date(o.created_at).getTime())))
                      .toLocaleDateString('es-CO')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Última Oferta</span>
              <span className="text-sm">
                {offers.length > 0 
                  ? new Date(Math.max(...offers.map(o => new Date(o.created_at).getTime())))
                      .toLocaleDateString('es-CO')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Duración</span>
              <span className="text-sm">
                {offers.length > 1 
                  ? `${Math.ceil((Math.max(...offers.map(o => new Date(o.created_at).getTime())) - 
                     Math.min(...offers.map(o => new Date(o.created_at).getTime()))) / (1000 * 60 * 60 * 24))} días`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Métodos de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['cash', 'financing', 'crypto', 'mixed'].map((method) => {
              const count = offers.filter(o => o.payment_method === method).length;
              const percentage = totalOffers > 0 ? (count / totalOffers) * 100 : 0;
              const methodLabels = {
                cash: 'Efectivo',
                financing: 'Financiación',
                crypto: 'Criptomonedas',
                mixed: 'Mixto'
              };
              
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{methodLabels[method as keyof typeof methodLabels]}</span>
                    <span>{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};