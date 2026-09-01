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
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../../utils/format';

interface Offer {
  id: string;
  buyer_name: string;
  transaction_type?: 'sale' | 'rental';
  offer_price?: number;
  monthly_rent?: number;
  payment_method: string;
  closing_date?: string;
  lease_start_date?: string;
  lease_term_months?: number;
  deposit?: number;
  admin_fee?: number;
  utilities_included?: string[];
  pets_policy?: string;
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
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'progress'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priorityOfferId, setPriorityOfferId] = useState<string | null>(null);

  const getPaymentMethodLabel = (method: string) => {
    return t(`negotiations.paymentMethods.${method}`, { defaultValue: method });
  };

  const getPriceVsProperty = (offerPrice: number) => {
    const percentage = ((offerPrice / propertyPrice) * 100).toFixed(1);
    return `${percentage}%`;
  };

  const getOfferAmount = (offer: Offer) => {
    if (offer.transaction_type === 'rental') return Number(offer.monthly_rent ?? 0);
    return Number(offer.offer_price ?? 0);
  };

  const getOfferScore = (offer: Offer) => {
    let score = 0;

    // Price score (40 points max)
    const offerAmount = getOfferAmount(offer);
    const priceRatio = offerAmount / propertyPrice;
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
    if (offer.transaction_type !== 'rental' && offer.closing_date) {
      const closingDate = new Date(offer.closing_date);
      const today = new Date();
      const daysToClose = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysToClose <= 30) score += 20;
      else if (daysToClose <= 60) score += 15;
      else if (daysToClose <= 90) score += 10;
    }

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
        aValue = getOfferAmount(a);
        bValue = getOfferAmount(b);
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
    toast.info(t('negotiations.compare.exportSoon'));
  };

  const handleBulkReject = () => {
    const offersToReject = offers.filter(offer =>
      selectedOfferIds.includes(offer.id) && offer.id !== priorityOfferId
    );

    if (offersToReject.length === 0) {
      toast.error(t('negotiations.compare.selectToReject'));
      return;
    }

    // In a real implementation, this would call an API to reject multiple offers
    toast.success(t('negotiations.compare.rejectedCount', { count: offersToReject.length }));
  };

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('negotiations.compare.emptyTitle')}</h3>
          <p className="text-muted-foreground text-center">
            {t('negotiations.compare.emptyHint')}
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
          <h3 className="text-xl font-semibold">{t('negotiations.comparisonTitle')}</h3>
          <p className="text-muted-foreground">
            {t('negotiations.compare.comparing', { count: offers.length, price: formatCurrency(propertyPrice) })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportComparison}>
            <Download className="h-4 w-4 mr-2" />
            {t('negotiations.compare.export')}
          </Button>
          {selectedOfferIds.length > 1 && (
            <Button variant="outline" onClick={handleBulkReject}>
              <XCircle className="h-4 w-4 mr-2" />
              {t('negotiations.compare.rejectSelected')}
            </Button>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <Label>{t('negotiations.compare.sortBy')}</Label>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as any);
            setSortOrder(order as any);
          }}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="price-desc">{t('negotiations.compare.sortPriceDesc')}</option>
          <option value="price-asc">{t('negotiations.compare.sortPriceAsc')}</option>
          <option value="date-desc">{t('negotiations.compare.sortDateDesc')}</option>
          <option value="date-asc">{t('negotiations.compare.sortDateAsc')}</option>
          <option value="progress-desc">{t('negotiations.compare.sortProgressDesc')}</option>
          <option value="progress-asc">{t('negotiations.compare.sortProgressAsc')}</option>
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
                <TableHead>{t('negotiations.compare.buyer')}</TableHead>
                <TableHead className="text-right">{t('negotiations.compare.offeredPrice')}</TableHead>
                <TableHead className="text-center">{t('negotiations.compare.vsList')}</TableHead>
                <TableHead>{t('negotiations.paymentMethod')}</TableHead>
                <TableHead>{t('negotiations.details.closingDate')}</TableHead>
                <TableHead className="text-center">{t('negotiations.compare.score')}</TableHead>
                <TableHead>{t('negotiations.compare.status')}</TableHead>
                <TableHead className="text-center">{t('negotiations.compare.priority')}</TableHead>
                <TableHead className="text-right">{t('negotiations.compare.actions')}</TableHead>
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
                        {offer.status === 'pending' ? t('negotiations.status.pending') :
                         offer.status === 'accepted' ? t('negotiations.status.accepted') :
                         offer.status === 'rejected' ? t('negotiations.status.rejected') :
                         t('common.other')}
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
              <p className="text-sm text-muted-foreground">{t('negotiations.compare.avgPrice')}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(offers.reduce((sum, o) => sum + o.offer_price, 0) / offers.length)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('negotiations.compare.bestOffer')}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.max(...offers.map(o => o.offer_price)))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('negotiations.compare.avgScore')}</p>
              <p className="text-2xl font-bold">
                {Math.round(offers.reduce((sum, o) => sum + getOfferScore(o), 0) / offers.length)}/100
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('negotiations.compare.priorityOffer')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {priorityOfferId ? t('negotiations.compare.selected') : t('negotiations.compare.none')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OfferComparison;
