import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Percent,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';

interface FinancialMetrics {
  purchasePrice: number;
  downPayment: number;
  monthlyPayment: number;
  termMonths: number;
  interestRate: number;
  monthlyRent?: number;
  annualAppreciation: number;
  inflationRate: number;
  taxRate: number;
  maintenanceRate: number;
  vacancyRate: number;
}

interface CalculatedMetrics {
  vpn: number;
  roi: number;
  irr: number;
  cashOnCash: number;
  capRate: number;
  dscr: number;
  riskScore: number;
  breakEvenMonths: number;
  totalReturn: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
}

const mockProperties = [
  {
    id: '1',
    title: 'Apartamento Moderno en El Poblado',
    price: 450000000,
    area: 85,
    monthlyRent: 2500000,
    metrics: {
      vpn: 385000000,
      roi: 12.5,
      irr: 15.2,
      cashOnCash: 8.3,
      riskScore: 3.2
    }
  },
  {
    id: '2',
    title: 'Casa Familiar en Laureles',
    price: 380000000,
    area: 120,
    monthlyRent: 1800000,
    metrics: {
      vpn: 355000000,
      roi: 14.2,
      irr: 18.1,
      cashOnCash: 9.8,
      riskScore: 2.1
    }
  }
];

export const FinancialAnalysisView: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    purchasePrice: 450000000,
    downPayment: 135000000,
    monthlyPayment: 2500000,
    termMonths: 180,
    interestRate: 8.5,
    monthlyRent: 2500000,
    annualAppreciation: 5,
    inflationRate: 4,
    taxRate: 1.5,
    maintenanceRate: 2,
    vacancyRate: 5
  });

  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics>({
    vpn: 385000000,
    roi: 12.5,
    irr: 15.2,
    cashOnCash: 8.3,
    capRate: 6.7,
    dscr: 1.2,
    riskScore: 3.2,
    breakEvenMonths: 18,
    totalReturn: 185000000,
    monthlyCashFlow: 150000,
    annualCashFlow: 1800000
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateMetrics = () => {
    // Simulación de cálculos financieros
    const loanAmount = metrics.purchasePrice - metrics.downPayment;
    const monthlyInterest = (loanAmount * metrics.interestRate / 100) / 12;
    const monthlyPrincipal = metrics.monthlyPayment - monthlyInterest;
    
    const annualRent = (metrics.monthlyRent || 0) * 12;
    const annualExpenses = metrics.purchasePrice * (metrics.taxRate + metrics.maintenanceRate) / 100;
    const netAnnualIncome = annualRent - annualExpenses;
    
    const capRate = (netAnnualIncome / metrics.purchasePrice) * 100;
    const cashOnCash = (netAnnualIncome / metrics.downPayment) * 100;
    
    // VPN simplificado
    const vpn = metrics.purchasePrice * 0.85; // Simplificación
    
    // IRR simplificado
    const irr = capRate + metrics.annualAppreciation;
    
    // ROI
    const roi = (netAnnualIncome + (metrics.purchasePrice * metrics.annualAppreciation / 100)) / metrics.purchasePrice * 100;
    
    // DSCR
    const dscr = netAnnualIncome / (metrics.monthlyPayment * 12);
    
    // Risk Score (1-5, donde 5 es más riesgoso)
    let riskScore = 3;
    if (capRate < 5) riskScore += 1;
    if (dscr < 1.2) riskScore += 1;
    if (metrics.vacancyRate > 10) riskScore += 1;
    if (metrics.interestRate > 10) riskScore += 1;
    riskScore = Math.min(riskScore, 5);
    
    const monthlyCashFlow = (metrics.monthlyRent || 0) - metrics.monthlyPayment - (metrics.purchasePrice * metrics.taxRate / 100 / 12);
    const annualCashFlow = monthlyCashFlow * 12;
    
    const breakEvenMonths = metrics.downPayment / Math.max(monthlyCashFlow, 1);
    const totalReturn = annualCashFlow * 10 + (metrics.purchasePrice * metrics.annualAppreciation / 100 * 10);

    setCalculatedMetrics({
      vpn,
      roi,
      irr,
      cashOnCash,
      capRate,
      dscr,
      riskScore,
      breakEvenMonths,
      totalReturn,
      monthlyCashFlow,
      annualCashFlow
    });
  };

  React.useEffect(() => {
    calculateMetrics();
  }, [metrics]);

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'text-green-600';
    if (score <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 2) return 'Bajo Riesgo';
    if (score <= 3) return 'Riesgo Medio';
    return 'Alto Riesgo';
  };

  const MetricCard: React.FC<{ 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  }> = ({ title, value, subtitle, trend, color }) => (
    <Card className="p-4 text-center">
      <div className="flex items-center justify-center mb-2">
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
        {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className={`text-2xl font-bold ${color || 'text-primary'}`}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        {title.includes('VPN') || title.includes('Flujo') ? '' : '%'}
      </p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </Card>
  );

  const ComparisonTable = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Comparación de Propiedades</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Propiedad</th>
              <th className="text-right p-3 font-medium">VPN</th>
              <th className="text-right p-3 font-medium">ROI</th>
              <th className="text-right p-3 font-medium">IRR</th>
              <th className="text-right p-3 font-medium">Cash-on-Cash</th>
              <th className="text-right p-3 font-medium">Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {mockProperties.map((property) => (
              <tr key={property.id} className="border-b hover:bg-muted/50">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{property.title}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(property.price)}</p>
                  </div>
                </td>
                <td className="text-right p-3 font-medium">
                  {formatPrice(property.metrics.vpn)}
                </td>
                <td className="text-right p-3">
                  <span className={`font-medium ${property.metrics.roi > 12 ? 'text-green-600' : 'text-red-600'}`}>
                    {property.metrics.roi}%
                  </span>
                </td>
                <td className="text-right p-3">
                  <span className={`font-medium ${property.metrics.irr > 15 ? 'text-green-600' : 'text-red-600'}`}>
                    {property.metrics.irr}%
                  </span>
                </td>
                <td className="text-right p-3">
                  <span className={`font-medium ${property.metrics.cashOnCash > 8 ? 'text-green-600' : 'text-red-600'}`}>
                    {property.metrics.cashOnCash}%
                  </span>
                </td>
                <td className="text-right p-3">
                  <Badge className={`${
                    property.metrics.riskScore <= 2 ? 'bg-green-100 text-green-800' :
                    property.metrics.riskScore <= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {property.metrics.riskScore}/5
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Análisis Financiero</h1>
            <p className="text-muted-foreground">
              Calcula métricas financieras y compara propiedades
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalcular
            </Button>
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Calculadora Financiera</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="purchase-price">Precio de Compra</Label>
                  <Input
                    id="purchase-price"
                    type="number"
                    value={metrics.purchasePrice}
                    onChange={(e) => setMetrics(prev => ({ ...prev, purchasePrice: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(metrics.purchasePrice)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="down-payment">Pago Inicial</Label>
                  <Input
                    id="down-payment"
                    type="number"
                    value={metrics.downPayment}
                    onChange={(e) => setMetrics(prev => ({ ...prev, downPayment: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(metrics.downPayment)} ({(metrics.downPayment / metrics.purchasePrice * 100).toFixed(1)}%)
                  </p>
                </div>

                <div>
                  <Label htmlFor="monthly-payment">Pago Mensual</Label>
                  <Input
                    id="monthly-payment"
                    type="number"
                    value={metrics.monthlyPayment}
                    onChange={(e) => setMetrics(prev => ({ ...prev, monthlyPayment: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(metrics.monthlyPayment)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="interest-rate">Tasa de Interés (%)</Label>
                  <Slider
                    value={[metrics.interestRate]}
                    onValueChange={(value) => setMetrics(prev => ({ ...prev, interestRate: value[0] }))}
                    max={15}
                    min={3}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {metrics.interestRate}%
                  </p>
                </div>

                <div>
                  <Label htmlFor="monthly-rent">Renta Mensual (Opcional)</Label>
                  <Input
                    id="monthly-rent"
                    type="number"
                    value={metrics.monthlyRent || ''}
                    onChange={(e) => setMetrics(prev => ({ ...prev, monthlyRent: parseInt(e.target.value) || undefined }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {metrics.monthlyRent ? formatPrice(metrics.monthlyRent) : 'Para análisis de inversión'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="appreciation">Apreciación Anual (%)</Label>
                  <Slider
                    value={[metrics.annualAppreciation]}
                    onValueChange={(value) => setMetrics(prev => ({ ...prev, annualAppreciation: value[0] }))}
                    max={10}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {metrics.annualAppreciation}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="VPN"
                value={formatPrice(calculatedMetrics.vpn)}
                subtitle="Valor Presente Neto"
                trend="up"
              />
              <MetricCard
                title="ROI"
                value={calculatedMetrics.roi}
                subtitle="Retorno sobre Inversión"
                trend={calculatedMetrics.roi > 10 ? 'up' : 'down'}
                color={calculatedMetrics.roi > 10 ? 'text-green-600' : 'text-red-600'}
              />
              <MetricCard
                title="IRR"
                value={calculatedMetrics.irr}
                subtitle="Tasa Interna de Retorno"
                trend={calculatedMetrics.irr > 12 ? 'up' : 'down'}
                color={calculatedMetrics.irr > 12 ? 'text-green-600' : 'text-red-600'}
              />
              <MetricCard
                title="Cash-on-Cash"
                value={calculatedMetrics.cashOnCash}
                subtitle="Retorno sobre Efectivo"
                trend={calculatedMetrics.cashOnCash > 8 ? 'up' : 'down'}
                color={calculatedMetrics.cashOnCash > 8 ? 'text-green-600' : 'text-red-600'}
              />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Cap Rate"
                value={calculatedMetrics.capRate}
                subtitle="Tasa de Capitalización"
                trend={calculatedMetrics.capRate > 6 ? 'up' : 'down'}
              />
              <MetricCard
                title="DSCR"
                value={calculatedMetrics.dscr}
                subtitle="Ratio de Cobertura"
                trend={calculatedMetrics.dscr > 1.2 ? 'up' : 'down'}
              />
              <MetricCard
                title="Riesgo"
                value={`${calculatedMetrics.riskScore}/5`}
                subtitle={getRiskLabel(calculatedMetrics.riskScore)}
                color={getRiskColor(calculatedMetrics.riskScore)}
              />
            </div>

            {/* Cash Flow Analysis */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Análisis de Flujo de Caja</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Flujo Mensual</p>
                  <p className={`text-xl font-bold ${
                    calculatedMetrics.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPrice(calculatedMetrics.monthlyCashFlow)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Flujo Anual</p>
                  <p className={`text-xl font-bold ${
                    calculatedMetrics.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPrice(calculatedMetrics.annualCashFlow)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Break-even</p>
                  <p className="text-xl font-bold text-primary">
                    {calculatedMetrics.breakEvenMonths.toFixed(0)} meses
                  </p>
                </div>
              </div>
            </Card>

            {/* Comparison Table */}
            <ComparisonTable />
          </div>
        </div>
      </div>
    </div>
  );
};
