import { getIntlLocale } from '../../i18n';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { npvCalculationService, NPVCalculationResult } from '../../services/npvCalculation.service';

interface NPVCalculatorWidgetProps {
  offerId: string;
  offer?: any;
  property?: any;
  showBreakdown?: boolean;
}

export const NPVCalculatorWidget: React.FC<NPVCalculatorWidgetProps> = ({
  offerId,
  offer,
  property,
  showBreakdown = true
}) => {
  const [npvResult, setNpvResult] = useState<NPVCalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    calculateNPV();
  }, [offerId]);

  const calculateNPV = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await npvCalculationService.calculateOfferNPV(offerId);
      if (result.ok) {
        setNpvResult(result.data);
      } else {
        setError(result.error?.message || 'Error al calcular VPN');
      }
    } catch (err: any) {
      console.error('Error calculating NPV:', err);
      setError(err.message || 'Error al calcular VPN');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Valor Presente Neto (VPN)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Valor Presente Neto (VPN)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">
            <p>Error al calcular VPN</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!npvResult) {
    return null;
  }

  const { npv, adjustedValue, riskAdjustedNPV, breakdown, confidence } = npvResult;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Valor Presente Neto (VPN)
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Main NPV display */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(npv)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Valor ajustado: {formatCurrency(adjustedValue)}
          </div>
          <div className="text-sm text-muted-foreground">
            VPN ajustado por riesgo: {formatCurrency(riskAdjustedNPV)}
          </div>
        </div>
        
        {/* Breakdown */}
        {showBreakdown && breakdown && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-sm mb-3">Desglose de Ajustes:</h4>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor base:</span>
                <span className="font-medium">{formatCurrency(breakdown.baseValue)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ajuste método de pago:</span>
                <span className={cn(
                  "font-medium",
                  breakdown.paymentMethodAdjustment > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {breakdown.paymentMethodAdjustment > 0 ? '+' : ''}
                  {formatCurrency(breakdown.paymentMethodAdjustment)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ajuste temporal:</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(Math.abs(breakdown.timeAdjustment))}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ajuste por riesgo:</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(Math.abs(breakdown.riskAdjustment))}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ajuste condiciones:</span>
                <span className={cn(
                  "font-medium",
                  breakdown.conditionsAdjustment > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {breakdown.conditionsAdjustment > 0 ? '+' : ''}
                  {formatCurrency(breakdown.conditionsAdjustment)}
                </span>
              </div>
              
              {breakdown.inflationAdjustment && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ajuste inflación:</span>
                  <span className="font-medium text-orange-600">
                    +{formatCurrency(breakdown.inflationAdjustment)}
                  </span>
                </div>
              )}
              
              <div className="border-t my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total ajustes:</span>
                <span className={cn(
                  breakdown.totalAdjustments > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {breakdown.totalAdjustments > 0 ? '+' : ''}
                  {formatCurrency(breakdown.totalAdjustments)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Confidence indicator */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Info className="w-4 h-4" />
              Confianza del cálculo:
            </span>
            <div className="flex items-center gap-2">
              <Progress value={confidence} className="w-20 h-2" />
              <span className="font-medium">{confidence}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

