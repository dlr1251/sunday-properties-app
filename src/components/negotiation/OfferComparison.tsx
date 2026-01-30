import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  BarChart3,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Offer {
  id: string;
  buyer_name: string;
  offer_price: number;
  payment_method: string;
  closing_date: string;
  conditions: string;
  down_payment?: number;
  created_at: string;
  status: string;
  negotiation_progress?: number;
}

interface OfferComparisonProps {
  offers: Offer[];
  propertyPrice: number;
  onOfferSelect?: (offerId: string) => void;
  onOfferAccept?: (offerId: string) => void;
  onOfferReject?: (offerId: string) => void;
  selectedOfferIds?: string[];
}

export function OfferComparison({
  offers,
  propertyPrice,
  onOfferSelect,
  onOfferAccept,
  onOfferReject,
  selectedOfferIds = []
}: OfferComparisonProps) {
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'progress'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priorityOfferId, setPriorityOfferId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      bank_transfer: 'Transferencia',
      financing: 'Financiación',
      crypto: 'Cripto',
      installments: 'Cuotas',
      mixed: 'Mixto'
    };
    return labels[method] || method;
  };

  const getPriceVsProperty = (offerPrice: number) => {
    const percentage = ((offerPrice / propertyPrice) * 100).toFixed(1);
    return `${percentage}%`;
  };

  const getOfferScore = (offer: Offer) => {
    let score = 0;

    // Price score (40 points max)
    const priceRatio = offer.offer_price / propertyPrice;
    if (priceRatio >= 0.95) score += 40;
    else if (priceRatio >= 0.90) score += 30;
    else if (priceRatio >= 0.85) score += 20;
    else if (priceRatio >= 0.80) score += 10;

    // Payment method score (20 points max)
    const preferredMethods = ['cash', 'bank_transfer'];
    if (preferredMethods.includes(offer.payment_method)) score += 20;
    else if (offer.payment_method === 'financing') score += 15;
    else if (offer.payment_method === 'mixed') score += 10;

    // Closing date score (20 points max)
    const closingDate = new Date(offer.closing_date);
    const today = new Date();
    const daysToClose = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysToClose <= 30) score += 20;
    else if (daysToClose <= 60) score += 15;
    else if (daysToClose <= 90) score += 10;

    // Conditions score (20 points max)
    if (!offer.conditions || offer.conditions.trim().length === 0) score += 20;
    else if (offer.conditions.length < 100) score += 15;
    else score += 10;

    return score;
  };

  const sortedOffers = [...offers].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'price':
        aValue = a.offer_price;
        bValue = b.offer_price;
        break;
      case 'date':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'progress':
        aValue = a.negotiation_progress || 0;
        bValue = b.negotiation_progress || 0;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleExportComparison = () => {
    // In a real implementation, this would generate a PDF or Excel file
    toast.info('Función de exportación próximamente disponible');
  };

  const handleBulkReject = () => {
    const offersToReject = offers.filter(offer =>
      selectedOfferIds.includes(offer.id) && offer.id !== priorityOfferId
    );

    if (offersToReject.length === 0) {
      toast.error('Selecciona ofertas para rechazar');
      return;
    }

    // In a real implementation, this would call an API to reject multiple offers
    toast.success(`${offersToReject.length} ofertas rechazadas`);
  };

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay ofertas para comparar</h3>
          <p className="text-muted-foreground text-center">
            Espera a que los compradores envíen sus ofertas para poder compararlas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Comparación de Ofertas</h3>
          <p className="text-muted-foreground">
            Comparando {offers.length} oferta{offers.length !== 1 ? 's' : ''} • Precio de lista: {formatCurrency(propertyPrice)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportComparison}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {selectedOfferIds.length > 1 && (
            <Button variant="outline" onClick={handleBulkReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar Seleccionadas
            </Button>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <Label>Ordenar por:</Label>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as any);
            setSortOrder(order as any);
          }}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="price-desc">Precio (mayor primero)</option>
          <option value="price-asc">Precio (menor primero)</option>
          <option value="date-desc">Fecha (más reciente)</option>
          <option value="date-asc">Fecha (más antigua)</option>
          <option value="progress-desc">Progreso (mayor primero)</option>
          <option value="progress-asc">Progreso (menor primero)</option>
        </select>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOfferIds.length === offers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onOfferSelect?.(offers.map(o => o.id).join(','));
                      } else {
                        onOfferSelect?.('');
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead className="text-right">Precio Ofertado</TableHead>
                <TableHead className="text-center">% vs Lista</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Fecha de Cierre</TableHead>
                <TableHead className="text-center">Puntuación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Prioridad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOffers.map((offer) => {
                const score = getOfferScore(offer);
                const isPriority = priorityOfferId === offer.id;

                return (
                  <TableRow key={offer.id} className={isPriority ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOfferIds.includes(offer.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onOfferSelect?.([...selectedOfferIds, offer.id].join(','));
                          } else {
                            onOfferSelect?.(selectedOfferIds.filter(id => id !== offer.id).join(','));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{offer.buyer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(offer.created_at)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(offer.offer_price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={parseFloat(getPriceVsProperty(offer.offer_price)) >= 90 ? "default" : "secondary"}>
                        {getPriceVsProperty(offer.offer_price)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodLabel(offer.payment_method)}
                    </TableCell>
                    <TableCell>
                      {formatDate(offer.closing_date)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-semibold">{score}/100</span>
                        {score >= 80 && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          offer.status === 'pending' ? 'secondary' :
                          offer.status === 'accepted' ? 'default' :
                          'destructive'
                        }
                      >
                        {offer.status === 'pending' ? 'Pendiente' :
                         offer.status === 'accepted' ? 'Aceptada' :
                         offer.status === 'rejected' ? 'Rechazada' :
                         'Otro'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant={isPriority ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPriorityOfferId(isPriority ? null : offer.id)}
                      >
                        {isPriority ? <Crown className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {offer.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOfferAccept?.(offer.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOfferReject?.(offer.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Precio Promedio</p>
              <p className="text-2xl font-bold">
                {formatCurrency(offers.reduce((sum, o) => sum + o.offer_price, 0) / offers.length)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Mejor Oferta</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.max(...offers.map(o => o.offer_price)))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Puntuación Promedio</p>
              <p className="text-2xl font-bold">
                {Math.round(offers.reduce((sum, o) => sum + getOfferScore(o), 0) / offers.length)}/100
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Oferta Prioritaria</p>
              <p className="text-2xl font-bold text-blue-600">
                {priorityOfferId ? 'Seleccionada' : 'Ninguna'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OfferComparison;
