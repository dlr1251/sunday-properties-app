import { getIntlLocale } from '../../../i18n';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Clock,
  AlertTriangle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Offer } from '../../../lib/db/repositories/offers.repo';

interface OffersListProps {
  offers: Offer[];
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

export const OffersList: React.FC<OffersListProps> = ({
  offers,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(getIntlLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Lista de Ofertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay ofertas para mostrar</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Fecha de Cierre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => {
                  const StatusIcon = statusConfig[offer.status].icon;
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {offer.buyer?.name || 'Comprador anónimo'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {offer.buyer?.email || 'Email no disponible'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(offer.offer_price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          vs. {formatCurrency(offer.original_price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {offer.payment_method === 'cash' ? 'Efectivo' :
                           offer.payment_method === 'financing' ? 'Financiación' :
                           offer.payment_method === 'crypto' ? 'Criptomonedas' :
                           offer.payment_method === 'mixed' ? 'Mixto' : offer.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(offer.closing_date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusConfig[offer.status].color}>
                            {statusConfig[offer.status].label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(offer.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* View details */}}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};