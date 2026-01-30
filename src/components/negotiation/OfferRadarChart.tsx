import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedCard } from '../animations/AnimatedCard';
import { motion } from 'framer-motion';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  Share2, 
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  Star,
  Users
} from 'lucide-react';

interface OfferRadarChartProps {
  offers: Array<{
    id: string;
    buyerName: string;
    offerPrice: number;
    paymentMethod: string;
    closingDays: number;
    competitiveness: number;
    riskScore: number;
    conditions: string[];
  }>;
  onOfferSelected?: (offerId: string) => void;
}

export const OfferRadarChart: React.FC<OfferRadarChartProps> = ({
  offers,
  onOfferSelected
}) => {
  // Transform offers data for radar chart
  const radarData = offers.map((offer, index) => {
    const paymentFlexibility = offer.paymentMethod === 'cash' ? 100 : 
                              offer.paymentMethod === 'financing' ? 80 : 
                              offer.paymentMethod === 'crypto' ? 60 : 70;

    const closingSpeed = Math.max(0, 100 - (offer.closingDays / 30) * 100);
    
    const conditionsFavorability = offer.conditions.length === 0 ? 100 : 
                                  Math.max(20, 100 - (offer.conditions.length * 15));

    const buyerCredibility = 85; // This would be calculated based on user history, verification status, etc.

    return {
      offerId: offer.id,
      buyerName: offer.buyerName,
      'Precio Competitivo': offer.competitiveness,
      'Flexibilidad Pago': paymentFlexibility,
      'Velocidad Cierre': closingSpeed,
      'Favorabilidad Condiciones': conditionsFavorability,
      'Credibilidad Comprador': buyerCredibility,
      'Puntuación General': Math.round((offer.competitiveness + paymentFlexibility + closingSpeed + conditionsFavorability + buyerCredibility) / 5),
      color: `hsl(${(index * 360) / offers.length}, 70%, 50%)`
    };
  });

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
    '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#0000ff'
  ];

  const formatTooltip = (value: any, name: string) => {
    if (name === 'Precio Competitivo') return [`${value}%`, 'Competitividad del precio'];
    if (name === 'Flexibilidad Pago') return [`${value}%`, 'Flexibilidad de pago'];
    if (name === 'Velocidad Cierre') return [`${value}%`, 'Velocidad de cierre'];
    if (name === 'Favorabilidad Condiciones') return [`${value}%`, 'Favorabilidad de condiciones'];
    if (name === 'Credibilidad Comprador') return [`${value}%`, 'Credibilidad del comprador'];
    if (name === 'Puntuación General') return [`${value}%`, 'Puntuación general'];
    return [value, name];
  };

  const getBestOffer = () => {
    return radarData.reduce((best, current) => 
      current['Puntuación General'] > best['Puntuación General'] ? current : best
    );
  };

  const bestOffer = getBestOffer();

  if (offers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Radar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No hay ofertas para comparar
        </h3>
        <p className="text-muted-foreground">
          Las ofertas recibidas aparecerán en el gráfico radar
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Radar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Análisis Radar de Ofertas</h2>
            <p className="text-muted-foreground">Comparación visual de múltiples dimensiones</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Best Offer Highlight */}
      {bestOffer && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Mejor Oferta General</h3>
              <p className="text-sm text-green-700">
                <strong>{bestOffer.buyerName}</strong> - Puntuación: {bestOffer['Puntuación General']}%
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {bestOffer['Puntuación General']}%
            </Badge>
          </div>
        </Card>
      )}

      {/* Radar Chart */}
      <Card className="p-6">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="buyerName" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
                tickCount={6}
              />
              
              {radarData.map((offer, index) => (
                <Radar
                  key={offer.offerId}
                  name={offer.buyerName}
                  dataKey="Precio Competitivo"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  onClick={() => onOfferSelected?.(offer.offerId)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
              
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Comprador: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Metrics Explanation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Explicación de Métricas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Precio Competitivo</h4>
              <p className="text-xs text-muted-foreground">
                Comparación del precio ofrecido vs. precio de venta y mercado
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Flexibilidad Pago</h4>
              <p className="text-xs text-muted-foreground">
                Facilidad y confiabilidad del método de pago propuesto
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Velocidad Cierre</h4>
              <p className="text-xs text-muted-foreground">
                Rapidez propuesta para cerrar la transacción
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Favorabilidad Condiciones</h4>
              <p className="text-xs text-muted-foreground">
                Simplicidad y favorabilidad de las condiciones especiales
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Credibilidad Comprador</h4>
              <p className="text-xs text-muted-foreground">
                Historial y confiabilidad del comprador
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Star className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Puntuación General</h4>
              <p className="text-xs text-muted-foreground">
                Promedio ponderado de todas las métricas
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Offer Details Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detalles de Ofertas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Comprador</th>
                <th className="text-left py-2">Precio Competitivo</th>
                <th className="text-left py-2">Flexibilidad Pago</th>
                <th className="text-left py-2">Velocidad Cierre</th>
                <th className="text-left py-2">Favorabilidad Condiciones</th>
                <th className="text-left py-2">Credibilidad</th>
                <th className="text-left py-2">General</th>
              </tr>
            </thead>
            <tbody>
              {radarData.map((offer, index) => (
                <tr 
                  key={offer.offerId} 
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => onOfferSelected?.(offer.offerId)}
                >
                  <td className="py-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span className="font-medium">{offer.buyerName}</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <Badge variant="outline">
                      {offer['Precio Competitivo']}%
                    </Badge>
                  </td>
                  <td className="py-2">
                    <Badge variant="outline">
                      {offer['Flexibilidad Pago']}%
                    </Badge>
                  </td>
                  <td className="py-2">
                    <Badge variant="outline">
                      {offer['Velocidad Cierre']}%
                    </Badge>
                  </td>
                  <td className="py-2">
                    <Badge variant="outline">
                      {offer['Favorabilidad Condiciones']}%
                    </Badge>
                  </td>
                  <td className="py-2">
                    <Badge variant="outline">
                      {offer['Credibilidad Comprador']}%
                    </Badge>
                  </td>
                  <td className="py-2">
                    <Badge 
                      className={
                        offer['Puntuación General'] >= 80 ? 'bg-green-100 text-green-800' :
                        offer['Puntuación General'] >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {offer['Puntuación General']}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
