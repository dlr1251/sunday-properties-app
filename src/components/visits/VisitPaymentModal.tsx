import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { getStripe, VISIT_PAYMENT_AMOUNT, VISIT_PAYMENT_CURRENCY, createVisitPaymentIntent, PAYMENT_TEST_MODE, simulateTestPayment } from '../../services/stripe';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface VisitPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitData: {
    id?: string;
    propertyTitle: string;
    scheduledDate: string;
    scheduledTime: string;
  };
  onPaymentSuccess?: (paymentData: any) => void;
}

// Payment Form Component (must be inside Elements provider)
const PaymentForm: React.FC<{
  visitData: VisitPaymentModalProps['visitData'];
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
}> = ({ visitData, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);
    setCardError('');

    try {
      // Create PaymentIntent on server (Edge Function)
      const intent = await createVisitPaymentIntent(visitData.id as string, VISIT_PAYMENT_AMOUNT);
      const clientSecret = intent.clientSecret;

      // Confirm card payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (confirmError) {
        setCardError(confirmError.message || 'Error procesando el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Pago procesado exitosamente');
        onSuccess({
          success: true,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        });
      } else {
        setCardError('No se pudo confirmar el pago');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setCardError('Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Inter, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Valor de la visita:</span>
            <span className="text-2xl font-bold">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              }).format(VISIT_PAYMENT_AMOUNT)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-element" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Información de la tarjeta
          </Label>
          <div className="p-3 border rounded-md bg-background">
            <CardElement
              id="card-element"
              options={cardElementOptions}
              onChange={(event) => {
                setCardError(event.error ? event.error.message : '');
              }}
            />
          </div>
          {cardError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {cardError}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Pago seguro procesado por Stripe</span>
        </div>
      </div>

      <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pagar y Confirmar Visita
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Main Modal Component
export const VisitPaymentModal: React.FC<VisitPaymentModalProps> = ({
  open,
  onOpenChange,
  visitData,
  onPaymentSuccess,
}) => {
  const stripePromise = getStripe();

  const handlePaymentSuccess = (paymentData: any) => {
    onPaymentSuccess?.(paymentData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Test Mode Payment Form Component
  const TestPaymentForm: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleTestPayment = async () => {
      if (!visitData.id) {
        toast.error('No se pudo identificar la visita');
        return;
      }

      setLoading(true);
      try {
        const paymentData = await simulateTestPayment(visitData.id, VISIT_PAYMENT_AMOUNT);
        toast.success('🧪 Pago de prueba procesado exitosamente');
        handlePaymentSuccess(paymentData);
      } catch (error: any) {
        console.error('Test payment error:', error);
        toast.error(error.message || 'Error procesando el pago de prueba');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Valor de la visita:</span>
              <span className="text-2xl font-bold">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                }).format(VISIT_PAYMENT_AMOUNT)}
              </span>
            </div>
          </div>

          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TestTube className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-orange-900">Modo de Prueba Activado</p>
                  <p className="text-sm text-orange-700">
                    Los pagos se simularán sin procesar transacciones reales. 
                    La visita se confirmará automáticamente sin necesidad de tarjeta de crédito.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleTestPayment}
            disabled={loading}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Confirmar Visita (Modo Prueba)
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    );
  };

  // Check if Stripe is properly configured (only if not in test mode)
  if (!PAYMENT_TEST_MODE && !stripePromise) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Configuración de Pago Requerida
            </DialogTitle>
            <DialogDescription>
              Stripe no está configurado correctamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Para habilitar los pagos, necesitas:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Crear una cuenta en <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe</a></li>
                    <li>Obtener tu clave pública de Stripe</li>
                    <li>Agregar <code className="bg-muted px-1 rounded">VITE_STRIPE_PUBLIC_KEY</code> a tu archivo <code className="bg-muted px-1 rounded">.env</code></li>
                    <li>Configurar <code className="bg-muted px-1 rounded">STRIPE_SECRET_KEY</code> en Supabase Edge Functions secrets</li>
                    <li className="text-primary font-medium">O habilitar modo prueba agregando <code className="bg-muted px-1 rounded">VITE_PAYMENT_TEST_MODE=true</code> a tu archivo <code className="bg-muted px-1 rounded">.env</code></li>
                  </ol>
                </div>
              </CardContent>
            </Card>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {PAYMENT_TEST_MODE ? (
              <>
                <TestTube className="h-5 w-5 text-orange-600" />
                Confirmar Visita (Modo Prueba)
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Confirmar Visita
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {PAYMENT_TEST_MODE 
              ? 'Simula el pago para confirmar tu visita (no se procesará ningún cargo real)'
              : 'Completa el pago para confirmar tu visita a la propiedad'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Detalles de la Visita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Propiedad:</span>
                <span className="text-sm font-medium">{visitData.propertyTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha:</span>
                <span className="text-sm font-medium">
                  {new Date(visitData.scheduledDate).toLocaleDateString('es-CO')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hora:</span>
                <span className="text-sm font-medium">{visitData.scheduledTime}</span>
              </div>
            </CardContent>
          </Card>

          {PAYMENT_TEST_MODE ? (
            <TestPaymentForm />
          ) : (
            <Elements stripe={stripePromise}>
              <PaymentForm
                visitData={visitData}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
