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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPriceChange = () => {
    if (!originalOffer?.offer_price || !counterOffer.price) return 0;
    return ((counterOffer.price - originalOffer.offer_price) / originalOffer.offer_price) * 100;
  };

  const handleSubmit = async () => {
    if (!user || !originalOffer) return;

    if (!counterOffer.price || counterOffer.price <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }

    if (!counterOffer.closingDate) {
      toast.error('Selecciona una fecha de cierre');
      return;
    }

    if (!counterOffer.message.trim()) {
      toast.error('Agrega un mensaje explicando los cambios');
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
          title: 'Contraoferta recibida',
          message: `${user.name || 'El vendedor'} ha enviado una contraoferta de ${formatCurrency(counterOffer.price)}`,
          data: { offer_id: data.id, original_offer_id: originalOffer.id }
        });

      if (notifError) {
        console.error('Notification error:', notifError);
      }

      toast.success('Contraoferta enviada exitosamente');
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
      toast.error(error.message || 'Error al enviar la contraoferta');
    } finally {
      setLoading(false);
    }
  };

  const priceChange = getPriceChange();
  const priceChangeColor = priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Enviar Contraoferta
          </DialogTitle>
          <p className="text-gray-600">
            Responde a la oferta de {formatCurrency(originalOffer?.offer_price || 0)}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Original Offer Summary */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Oferta Original</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-700 font-medium">Precio:</span>
                  <p className="font-semibold text-gray-900">{formatCurrency(originalOffer?.offer_price || 0)}</p>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Método de pago:</span>
                  <p className="font-semibold text-gray-900 capitalize">{originalOffer?.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Fecha de cierre:</span>
                  <p className="font-semibold text-gray-900">
                    {originalOffer?.closing_date ? new Date(originalOffer.closing_date).toLocaleDateString('es-CO') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Condiciones:</span>
                  <p className="font-semibold text-xs text-gray-900">
                    {originalOffer?.conditions || 'Sin condiciones especiales'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Counter Offer Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tu Contraoferta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
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
                    {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}% vs oferta original
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Método de pago</Label>
                <select
                  value={counterOffer.paymentMethod}
                  onChange={(e) => setCounterOffer(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="cash">Efectivo</option>
                  <option value="bank_transfer">Transferencia bancaria</option>
                  <option value="financing">Financiación</option>
                  <option value="crypto">Criptomonedas</option>
                  <option value="installments">Cuotas</option>
                  <option value="mixed">Mixto</option>
                </select>
              </div>

              {/* Closing Date */}
              <div className="space-y-2">
                <Label htmlFor="closingDate">Fecha de cierre *</Label>
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
                  <Label htmlFor="downPayment">Pago inicial</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
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
                <Label htmlFor="conditions">Condiciones adicionales</Label>
                <Textarea
                  id="conditions"
                  value={counterOffer.conditions}
                  onChange={(e) => setCounterOffer(prev => ({ ...prev, conditions: e.target.value }))}
                  placeholder="Ej: Incluir gastos notariales, entrega inmediata..."
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
                Mensaje para el comprador *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Explica los cambios en tu contraoferta</Label>
                <Textarea
                  value={counterOffer.message}
                  onChange={(e) => setCounterOffer(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Ej: Estoy dispuesto a bajar el precio si aceptas una fecha de cierre más próxima..."
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
                El precio está por debajo del mínimo establecido ({formatCurrency(negotiationRules.minPrice)})
              </AlertDescription>
            </Alert>
          )}

          {negotiationRules?.maxClosingDays && counterOffer.closingDate && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Fecha máxima permitida: {new Date(Date.now() + negotiationRules.maxClosingDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !counterOffer.price || !counterOffer.closingDate || !counterOffer.message.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Enviando...' : 'Enviar Contraoferta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CounterOfferForm;
