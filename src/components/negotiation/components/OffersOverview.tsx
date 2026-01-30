import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Users,
  Target
} from 'lucide-react';
import { Property } from '../../../types/database';
import { Offer } from '../../../lib/db/repositories/offers.repo';

interface OffersOverviewProps {
  offers: Offer[];
  property: Property;
  onAcceptOffer: (offerId: string) => void;
  onRejectOffer: (offerId: string, reason?: string) => void;
  onCounterOffer: (offer: Offer) => void;
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500', icon: Clock },
  accepted: { label: 'Aceptada', color: 'bg-green-500', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'bg-red-500', icon: XCircle },
  countered: { label: 'Contraoferta', color: 'bg-blue-500', icon: TrendingUp },
  expired: { label: 'Expirada', color: 'bg-gray-500', icon: AlertTriangle },
};

export const OffersOverview: React.FC<OffersOverviewProps> = ({
  offers,
  property,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer
}) => {
  const totalOffers = offers.length;
  const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
  const pendingOffers = offers.filter(o => o.status === 'pending').length;
  const rejectedOffers = offers.filter(o => o.status === 'rejected').length;
  
  const averageOffer = totalOffers > 0 
    ? offers.reduce((sum, offer) => sum + offer.offer_price, 0) / totalOffers 
    : 0;
  
  const highestOffer = totalOffers > 0 
    ? Math.max(...offers.map(o => o.offer_price)) 
    : 0;
  
  const lowestOffer = totalOffers > 0 
    ? Math.min(...offers.map(o => o.offer_price)) 
    : 0;

  const negotiationProgress = totalOffers > 0 
    ? Math.min((acceptedOffers / totalOffers) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ofertas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOffers}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOffers} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oferta Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageOffer.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Rango: ${lowestOffer.toLocaleString()} - ${highestOffer.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acceptedOffers}</div>
            <p className="text-xs text-muted-foreground">
              {totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(negotiationProgress)}%</div>
            <Progress value={negotiationProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Ofertas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ofertas para esta propiedad</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.slice(0, 5).map((offer) => {
                const StatusIcon = statusConfig[offer.status].icon;
                return (
                  <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-4 w-4" />
                        <Badge className={statusConfig[offer.status].color}>
                          {statusConfig[offer.status].label}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">${offer.offer_price.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {offer.buyer?.name || 'Comprador anónimo'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {offer.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onAcceptOffer(offer.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCounterOffer(offer)}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Contraoferta
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onRejectOffer(offer.id, 'Rechazada por el vendedor')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      {offer.status === 'countered' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCounterOffer(offer)}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Ver Contraoferta
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};