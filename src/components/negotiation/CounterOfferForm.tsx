import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  TrendingUp,
  MessageSquare,
  Calculator,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../../utils/format';

interface CounterOfferFormProps {
  originalOffer: any;
  property: any;
  negotiationRules: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (counterOffer: any) => void;
  onCancel?: () => void;
}

export function CounterOfferForm({
  originalOffer,
  property,
  negotiationRules,
  isOpen,
  onOpenChange,
  onSubmit,
  onCancel
}: CounterOfferFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [counterOffer, setCounterOffer] = useState({
    price: originalOffer?.offer_price || 0,
    paymentMethod: originalOffer?.payment_method || 'cash',
    closingDate: originalOffer?.closing_date || '',
    conditions: originalOffer?.conditions || '',
    message: '',
    downPayment: originalOffer?.down_payment || 0
  });

  // Initialize form with original offer data
  useEffect(() => {
    if (originalOffer && isOpen) {
      setCounterOffer({
        price: originalOffer.offer_price,
        paymentMethod: originalOffer.payment_method,
        closingDate: originalOffer.closing_date,
        conditions: originalOffer.conditions || '',
        message: '',
        downPayment: originalOffer.down_payment || 0
      });
    }
  }, [originalOffer, isOpen]);

  const getPriceChange = () => {
    if (!originalOffer?.offer_price || !counterOffer.price) return 0;
    return ((counterOffer.price - originalOffer.offer_price) / originalOffer.offer_price) * 100;
  };

  const handleSubmit = async () => {
    if (!user || !originalOffer) return;

    if (!counterOffer.price || counterOffer.price <= 0) {
      toast.error(t('negotiations.counter.invalidPrice'));
      return;
    }

    if (!counterOffer.closingDate) {
      toast.error(t('negotiations.counter.selectClosing'));
      return;
    }

    if (!counterOffer.message.trim()) {
      toast.error(t('negotiations.counter.addMessage'));
      return;
    }

    setLoading(true);
    try {
      const counterOfferData = {
        property_id: originalOffer.property_id,
        buyer_id: originalOffer.buyer_id,
        offer_price: counterOffer.price,
        payment_method: counterOffer.paymentMethod,
        closing_date: counterOffer.closingDate,
        conditions: counterOffer.conditions,
        down_payment: counterOffer.downPayment || null,
        parent_offer_id: originalOffer.id,
        counter_message: counterOffer.message,
        status: 'countered'
      };

      const { data, error } = await supabase
        .from('offers')
        .insert(counterOfferData)
        .select()
        .single();

      if (error) throw error;

      // Update original offer status to 'countered'
      const { error: updateError } = await supabase
        .from('offers')
        .update({ status: 'countered' })
        .eq('id', originalOffer.id);

      if (updateError) {
        console.error('Error updating original offer:', updateError);
      }

      // Create notification for buyer
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: originalOffer.buyer_id,
          type: 'counter_offer',
          title: t('negotiations.counter.notificationTitle'),
          message: t('negotiations.counter.notificationMessage', {
            name: user.name || t('negotiations.counter.sellerFallback'),
            price: formatCurrency(counterOffer.price)
          }),
          data: { offer_id: data.id, original_offer_id: originalOffer.id }
        });

      if (notifError) {
        console.error('Notification error:', notifError);
      }

      toast.success(t('negotiations.counter.sent'));
      onSubmit?.(data);
      onOpenChange(false);

      // Reset form
      setCounterOffer({
        price: 0,
        paymentMethod: 'cash',
        closingDate: '',
        conditions: '',
        message: '',
        downPayment: 0
      });

    } catch (error: any) {
      console.error('Error submitting counter-offer:', error);
      toast.error(error.message || t('negotiations.counter.sendError'));
    } finally {
      setLoading(false);
    }
  };

  const priceChange = getPriceChange();
  const priceChangeColor = priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-muted-foreground';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t('negotiations.counter.title')}
          </DialogTitle>
          <p className="text-muted-foreground">
            {t('negotiations.counter.respondTo', { price: formatCurrency(originalOffer?.offer_price || 0) })}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Original Offer Summary */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">{t('negotiations.counter.originalOffer')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">{t('properties.price')}:</span>
                  <p className="font-semibold text-foreground">{formatCurrency(originalOffer?.offer_price || 0)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">{t('negotiations.paymentMethod')}:</span>
                  <p className="font-semibold text-foreground capitalize">{t(`negotiations.paymentMethods.${originalOffer?.payment_method || 'cash'}`, { defaultValue: originalOffer?.payment_method || 'N/A' })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">{t('negotiations.details.closingDate')}:</span>
                  <p className="font-semibold text-foreground">
                    {originalOffer?.closing_date ? formatDate(originalOffer.closing_date) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">{t('negotiations.offer.conditions')}:</span>
                  <p className="font-semibold text-xs text-foreground">
                    {originalOffer?.conditions || t('negotiations.counter.noSpecialConditions')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Counter Offer Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('negotiations.counter.yourCounter')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">{t('negotiations.counter.price')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    value={counterOffer.price}
                    onChange={(e) => setCounterOffer(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="pl-8"
                  />
                </div>
                {priceChange !== 0 && (
                  <p className={`text-sm ${priceChangeColor}`}>
                    {t('negotiations.counter.vsOriginalPct', {
                      signed: priceChange > 0 ? '+' : '',
                      pct: priceChange.toFixed(1)
                    })}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>{t('negotiations.paymentMethod')}</Label>
                <select
                  value={counterOffer.paymentMethod}
                  onChange={(e) => setCounterOffer(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="cash">{t('negotiations.paymentMethods.cash')}</option>
                  <option value="bank_transfer">{t('negotiations.paymentMethods.bank_transfer')}</option>
                  <option value="financing">{t('negotiations.paymentMethods.financing')}</option>
                  <option value="crypto">{t('negotiations.paymentMethods.crypto')}</option>
                  <option value="installments">{t('negotiations.paymentMethods.installments')}</option>
                  <option value="mixed">{t('negotiations.paymentMethods.mixed')}</option>
                </select>
              </div>

              {/* Closing Date */}
              <div className="space-y-2">
                <Label htmlFor="closingDate">{t('negotiations.counter.closingDateRequired')}</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={counterOffer.closingDate}
                  onChange={(e) => setCounterOffer(prev => ({ ...prev, closingDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Down Payment (if financing) */}
              {counterOffer.paymentMethod === 'financing' && (
                <div className="space-y-2">
                  <Label htmlFor="downPayment">{t('negotiations.counter.downPayment')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="downPayment"
                      type="number"
                      value={counterOffer.downPayment}
                      onChange={(e) => setCounterOffer(prev => ({ ...prev, downPayment: Number(e.target.value) }))}
                      className="pl-8"
                    />
                  </div>
                </div>
              )}

              {/* Conditions */}
              <div className="space-y-2">
                <Label htmlFor="conditions">{t('negotiations.counter.extraConditions')}</Label>
                <Textarea
                  id="conditions"
                  value={counterOffer.conditions}
                  onChange={(e) => setCounterOffer(prev => ({ ...prev, conditions: e.target.value }))}
                  placeholder={t('negotiations.counter.conditionsPlaceholder')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('negotiations.counter.messageToBuyer')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>{t('negotiations.counter.explainChanges')}</Label>
                <Textarea
                  value={counterOffer.message}
                  onChange={(e) => setCounterOffer(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={t('negotiations.counter.messagePlaceholder')}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Validation Warnings */}
          {negotiationRules?.minPrice && counterOffer.price < negotiationRules.minPrice && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('negotiations.counter.belowMin', { price: formatCurrency(negotiationRules.minPrice) })}
              </AlertDescription>
            </Alert>
          )}

          {negotiationRules?.maxClosingDays && counterOffer.closingDate && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t('negotiations.counter.maxAllowedDate', { date: formatDate(new Date(Date.now() + negotiationRules.maxClosingDays * 24 * 60 * 60 * 1000)) })}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !counterOffer.price || !counterOffer.closingDate || !counterOffer.message.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? t('negotiations.counter.sending') : t('negotiations.counter.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CounterOfferForm;
