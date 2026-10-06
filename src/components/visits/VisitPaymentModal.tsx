import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../../utils/format';
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
  const { t } = useTranslation();
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
        setCardError(confirmError.message || t('visits.payment.processError'));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success(t('visits.payment.success'));
        onSuccess({
          success: true,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        });
      } else {
        setCardError(t('visits.payment.confirmFailed'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      setCardError(t('visits.payment.processError'));
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
            <span className="font-medium">{t('visits.payment.visitValue')}</span>
            <span className="text-2xl font-bold">
              {formatCurrency(VISIT_PAYMENT_AMOUNT)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-element" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t('visits.payment.cardInfo')}
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
          <span>{t('visits.payment.secureStripe')}</span>
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
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('visits.payment.processing')}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              {t('visits.payment.payAndConfirm')}
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
  const { t } = useTranslation();
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
        toast.error(t('visits.payment.visitNotFound'));
        return;
      }

      setLoading(true);
      try {
        const paymentData = await simulateTestPayment(visitData.id, VISIT_PAYMENT_AMOUNT);
        toast.success(t('visits.payment.testSuccess'));
        handlePaymentSuccess(paymentData);
      } catch (error: any) {
        console.error('Test payment error:', error);
        toast.error(error.message || t('visits.payment.testError'));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('visits.payment.visitValue')}</span>
              <span className="text-2xl font-bold">
                {formatCurrency(VISIT_PAYMENT_AMOUNT)}
              </span>
            </div>
          </div>

          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TestTube className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-orange-900">{t('visits.payment.testModeTitle')}</p>
                  <p className="text-sm text-orange-700">
                    {t('visits.payment.testModeBody')}
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
            {t('common.cancel')}
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
                {t('visits.payment.processing')}
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                {t('visits.payment.confirmTest')}
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
              {t('visits.payment.configRequired')}
            </DialogTitle>
            <DialogDescription>
              {t('visits.payment.stripeNotConfigured')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{t('visits.payment.toEnablePayments')}</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>{t('visits.payment.stripeStep1')} (<a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe</a>)</li>
                    <li>{t('visits.payment.stripeStep2')}</li>
                    <li>{t('visits.payment.stripeStep3')}</li>
                    <li>{t('visits.payment.stripeStep4')}</li>
                    <li className="text-primary font-medium">{t('visits.payment.stripeStep5')}</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                {t('common.close')}
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
                {t('visits.payment.confirmTest')}
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                {t('visits.payment.confirmTitle')}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {PAYMENT_TEST_MODE 
              ? t('visits.payment.testDescription')
              : t('visits.payment.liveDescription')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('visits.payment.detailsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('visits.property')}:</span>
                <span className="text-sm font-medium">{visitData.propertyTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('visits.date')}:</span>
                <span className="text-sm font-medium">
                  {formatDate(visitData.scheduledDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('visits.time')}:</span>
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
