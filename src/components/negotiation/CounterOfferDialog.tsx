import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Offer } from '../../types/database';

interface CounterOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  onSubmit: (counterOffer: CounterOfferData) => void;
  loading?: boolean;
}

interface CounterOfferData {
  offerPrice: number;
  paymentMethod: string;
  closingDate: string;
  conditions: string[];
  reason: string;
  changes: {
    priceChanged: boolean;
    paymentChanged: boolean;
    dateChanged: boolean;
    conditionsChanged: boolean;
  };
}

export const CounterOfferDialog: React.FC<CounterOfferDialogProps> = ({
  isOpen,
  onClose,
  offer,
  onSubmit,
  loading = false
}) => {
  // Calculate improved NPV values when dialog opens
  const getImprovedValues = () => {
    if (!offer) return null;
    
    const originalPrice = offer.offer_price;
    const originalClosingDate = new Date(offer.closing_date);
    const today = new Date();
    const daysUntilClosing = Math.ceil((originalClosingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Improve NPV by:
    // 1. Increase price by 2-5% (use 3% as default)
    const improvedPrice = Math.round(originalPrice * 1.03);
    
    // 2. Reduce closing date by 10-15% if possible (minimum 30 days)
    const improvedDaysUntilClosing = Math.max(30, Math.floor(daysUntilClosing * 0.85));
    const improvedClosingDate = new Date(today);
    improvedClosingDate.setDate(improvedClosingDate.getDate() + improvedDaysUntilClosing);
    
    // 3. Prefer cash payment if current is financing (better NPV)
    const improvedPaymentMethod = offer.payment_method === 'financing' ? 'cash' : offer.payment_method;
    
    return {
      price: improvedPrice,
      closingDate: improvedClosingDate.toISOString().split('T')[0],
      paymentMethod: improvedPaymentMethod
    };
  };

  const improvedValues = getImprovedValues();
  
  const [counterOffer, setCounterOffer] = useState<CounterOfferData>({
    offerPrice: improvedValues?.price || offer?.offer_price || 0,
    paymentMethod: improvedValues?.paymentMethod || offer?.payment_method || 'cash',
    closingDate: improvedValues?.closingDate || offer?.closing_date || '',
    conditions: offer?.conditions || [],
    reason: '',
    changes: {
      priceChanged: false,
      paymentChanged: false,
      dateChanged: false,
      conditionsChanged: false
    }
  });

  const [selectedConditions, setSelectedConditions] = useState<string[]>(offer?.conditions || []);

  // Reset form when offer changes or dialog opens
  React.useEffect(() => {
    if (isOpen && offer) {
      const improved = getImprovedValues();
      const improvedPrice = improved?.price || offer.offer_price || 0;
      const improvedPaymentMethod = improved?.paymentMethod || offer.payment_method || 'cash';
      const improvedClosingDate = improved?.closingDate || offer.closing_date || '';
      
      setCounterOffer({
        offerPrice: improvedPrice,
        paymentMethod: improvedPaymentMethod,
        closingDate: improvedClosingDate,
        conditions: offer.conditions || [],
        reason: '',
        changes: {
          priceChanged: improvedPrice !== offer.offer_price,
          paymentChanged: improvedPaymentMethod !== offer.payment_method,
          dateChanged: improvedClosingDate !== offer.closing_date,
          conditionsChanged: false
        }
      });
      setSelectedConditions(offer.conditions || []);
    }
  }, [isOpen, offer]);

  const handlePriceChange = (value: string) => {
    const newPrice = parseInt(value) || 0;
    setCounterOffer(prev => ({
      ...prev,
      offerPrice: newPrice,
      changes: {
        ...prev.changes,
        priceChanged: newPrice !== (offer?.offer_price || 0)
      }
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setCounterOffer(prev => ({
      ...prev,
      paymentMethod: value,
      changes: {
        ...prev.changes,
        paymentChanged: value !== (offer?.payment_method || 'cash')
      }
    }));
  };

  const handleClosingDateChange = (value: string) => {
    setCounterOffer(prev => ({
      ...prev,
      closingDate: value,
      changes: {
        ...prev.changes,
        dateChanged: value !== (offer?.closing_date || '')
      }
    }));
  };

  const handleConditionToggle = (condition: string, checked: boolean) => {
    const newConditions = checked 
      ? [...selectedConditions, condition]
      : selectedConditions.filter(c => c !== condition);
    
    setSelectedConditions(newConditions);
    setCounterOffer(prev => ({
      ...prev,
      conditions: newConditions,
      changes: {
        ...prev.changes,
        conditionsChanged: JSON.stringify(newConditions.sort()) !== JSON.stringify((offer?.conditions || []).sort())
      }
    }));
  };

  const getPriceChangeIcon = () => {
    if (!offer) return <Minus className="h-4 w-4 text-gray-500" />;
    
    const change = counterOffer.offerPrice - offer.offer_price;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPriceChangeColor = () => {
    if (!offer) return 'text-gray-500';
    
    const change = counterOffer.offerPrice - offer.offer_price;
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasChanges = Object.values(counterOffer.changes).some(Boolean);

  const handleSubmit = () => {
    if (!hasChanges) return;
    
    onSubmit({
      ...counterOffer,
      conditions: selectedConditions
    });
  };

  const availableConditions = [
    'Incluye muebles y electrodomésticos',
    'Venta condicionada a estudio de títulos satisfactorio',
    'Entrega tras remodelación menor',
    'Pago condicionado a aprobación de crédito',
    'Incluye gastos notariales',
    'Entrega inmediata',
    'Permuta aceptada',
    'Financiación directa del vendedor'
  ];

  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto z-[70]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <ArrowRight className="h-6 w-6 text-blue-600" />
            <span className="text-gray-900">Crear Contraoferta</span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-700">
            Modifica los términos de la oferta original y envía una contraoferta al comprador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Offer Summary */}
          <Card className="p-5 bg-gray-50 border-2 border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Oferta Original</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-base">
              <div>
                <span className="text-sm font-semibold text-gray-700 block mb-1">Precio:</span>
                <div className="text-lg font-bold text-gray-900">{formatPrice(offer.offer_price)}</div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700 block mb-1">Pago:</span>
                <div className="text-lg font-bold text-gray-900 capitalize">{offer.payment_method}</div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700 block mb-1">Cierre:</span>
                <div className="text-lg font-bold text-gray-900">
                  {new Date(offer.closing_date).toLocaleDateString('es-CO')}
                </div>
              </div>
            </div>
          </Card>

          {/* NPV Improvement Info */}
          {improvedValues && (
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Mejoras sugeridas para optimizar el Valor Presente Neto (NPV)</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {improvedValues.price !== offer.offer_price && (
                      <li>• Precio sugerido: <strong>{formatPrice(improvedValues.price)}</strong> (+{Math.round(((improvedValues.price - offer.offer_price) / offer.offer_price) * 100)}%)</li>
                    )}
                    {improvedValues.paymentMethod !== offer.payment_method && (
                      <li>• Método de pago sugerido: <strong className="capitalize">{improvedValues.paymentMethod}</strong> (mejor flujo de caja)</li>
                    )}
                    {improvedValues.closingDate !== offer.closing_date && (
                      <li>• Fecha de cierre sugerida: <strong>{new Date(improvedValues.closingDate).toLocaleDateString('es-CO')}</strong> (recepción más rápida del pago)</li>
                    )}
                  </ul>
                  <p className="text-xs text-blue-700 mt-2 italic">
                    Los valores sugeridos están pre-cargados en el formulario. Puedes modificarlos según tus necesidades.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Counter Offer Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="counter-price" className="text-base font-semibold text-gray-900">Precio de Contraoferta</Label>
              <div className="relative">
                <Input
                  id="counter-price"
                  type="number"
                  value={counterOffer.offerPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="pr-10 text-base"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getPriceChangeIcon()}
                </div>
              </div>
              {offer && (
                <div className={`text-base font-semibold ${getPriceChangeColor()}`}>
                  {counterOffer.offerPrice > offer.offer_price ? '+' : ''}
                  {formatPrice(counterOffer.offerPrice - offer.offer_price)} 
                  ({counterOffer.offerPrice > offer.offer_price ? '+' : ''}
                  {Math.round(((counterOffer.offerPrice - offer.offer_price) / offer.offer_price) * 100)}%)
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="counter-payment" className="text-base font-semibold text-gray-900">Método de Pago</Label>
              <Select
                value={counterOffer.paymentMethod}
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Contado</SelectItem>
                  <SelectItem value="financing">Financiación</SelectItem>
                  <SelectItem value="crypto">Criptomonedas</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Closing Date */}
            <div className="space-y-2">
              <Label htmlFor="counter-date" className="text-base font-semibold text-gray-900">Fecha de Cierre</Label>
              <Input
                id="counter-date"
                type="date"
                value={counterOffer.closingDate}
                onChange={(e) => handleClosingDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="text-base"
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="counter-reason" className="text-base font-semibold text-gray-900">Razón de la Contraoferta</Label>
              <Textarea
                id="counter-reason"
                value={counterOffer.reason}
                onChange={(e) => setCounterOffer(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explica por qué estás modificando los términos..."
                rows={4}
                className="text-base"
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-900">Condiciones Especiales</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableConditions.map((condition) => (
                <div key={condition} className="flex items-center space-x-3">
                  <Checkbox
                    id={condition}
                    checked={selectedConditions.includes(condition)}
                    onCheckedChange={(checked) => handleConditionToggle(condition, !!checked)}
                  />
                  <Label htmlFor={condition} className="text-base text-gray-900 cursor-pointer">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <Card className="p-5 border-2 border-blue-300 bg-blue-50">
              <h3 className="text-lg font-bold mb-4 flex items-center text-blue-900">
                <AlertTriangle className="h-5 w-5 mr-2 text-blue-700" />
                Resumen de Cambios
              </h3>
              <div className="space-y-3">
                {counterOffer.changes.priceChanged && (
                  <div className="flex items-center space-x-3 text-base">
                    <DollarSign className="h-5 w-5 text-blue-700 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">Precio modificado: <span className="text-blue-700">{formatPrice(counterOffer.offerPrice)}</span></span>
                  </div>
                )}
                {counterOffer.changes.paymentChanged && (
                  <div className="flex items-center space-x-3 text-base">
                    <CreditCard className="h-5 w-5 text-blue-700 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">Método de pago: <span className="text-blue-700 capitalize">{counterOffer.paymentMethod}</span></span>
                  </div>
                )}
                {counterOffer.changes.dateChanged && (
                  <div className="flex items-center space-x-3 text-base">
                    <Calendar className="h-5 w-5 text-blue-700 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">Fecha de cierre: <span className="text-blue-700">{new Date(counterOffer.closingDate).toLocaleDateString('es-CO')}</span></span>
                  </div>
                )}
                {counterOffer.changes.conditionsChanged && (
                  <div className="flex items-center space-x-3 text-base">
                    <CheckCircle className="h-5 w-5 text-blue-700 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">Condiciones: <span className="text-blue-700">{selectedConditions.length} seleccionadas</span></span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Warning if no changes */}
          {!hasChanges && (
            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <div className="flex items-center space-x-2 text-yellow-800">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">
                  No has realizado ningún cambio. Modifica al menos un término para crear una contraoferta.
                </span>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-base font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 min-w-[120px]"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!hasChanges || loading}
            className="min-w-[160px] text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Enviando...' : 'Enviar Contraoferta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
