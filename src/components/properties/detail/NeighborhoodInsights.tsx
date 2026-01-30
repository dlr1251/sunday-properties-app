import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  MapPin,
  School,
  ShoppingCart,
  Utensils,
  Bus,
  Hospital,
  Sun,
  Droplets,
} from 'lucide-react';

interface NeighborhoodInsightsProps {
  city: string;
  neighborhood: string;
  address: string;
}

export const NeighborhoodInsights: React.FC<NeighborhoodInsightsProps> = ({
  city,
  neighborhood,
  address,
}) => {
  // Mock data - in production this would come from an API or database
  const amenities = [
    { icon: School, label: 'Colegios', distance: '500m', count: 3 },
    { icon: ShoppingCart, label: 'Supermercados', distance: '300m', count: 2 },
    { icon: Utensils, label: 'Restaurantes', distance: '200m', count: 12 },
    { icon: Bus, label: 'Transporte público', distance: '150m', count: 4 },
    { icon: Hospital, label: 'Hospitales', distance: '2km', count: 1 },
  ];

  const climateData = [
    { icon: Sun, label: 'Temperatura promedio', value: '24°C' },
    { icon: Droplets, label: 'Humedad promedio', value: '65%' },
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Sobre la Zona</h2>
          </div>
          <p className="text-gray-600 text-sm">
            {neighborhood}, {city}
          </p>
          <p className="text-gray-500 text-sm mt-1">{address}</p>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="font-semibold mb-3">Comodidades Cercanas</h3>
          <div className="space-y-3">
            {amenities.map((amenity, index) => {
              const Icon = amenity.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{amenity.label}</p>
                      <p className="text-xs text-gray-500">{amenity.distance}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{amenity.count}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Climate */}
        <div>
          <h3 className="font-semibold mb-3">Clima</h3>
          <div className="grid grid-cols-2 gap-3">
            {climateData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-primary/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Neighborhood Description */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 leading-relaxed">
            {neighborhood} es un barrio bien conectado y con excelente oferta de servicios.
            La zona cuenta con fácil acceso a transporte público, múltiples opciones de
            entretenimiento y compras, y una sólida infraestructura educativa y de salud.
          </p>
        </div>
      </div>
    </Card>
  );
};

