import React, { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface PropertyData {
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  coordinates: { lat: number; lng: number };
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  floor: number;
  totalFloors: number;
  yearBuilt: number;
  images: File[];
  virtualTour: File | null;
  freedomTradition: File | null;
  propertyType: string;
  strata: number;
  price: number;
  acceptsCrypto: boolean;
  financing: boolean;
  visitPrice: number;
  commission: number;
  negotiationRules: {
    minPrice?: number;
    maxClosingDays?: number;
    requiredPaymentMethods: string[];
    autoRejectEnabled: boolean;
    manualReviewThreshold: boolean;
    specialConditions: string[];
  };
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

interface Step7FinalReviewProps {
  propertyData: PropertyData;
  formatPrice: (price: number) => string;
  onTermsAcceptedChange: (checked: boolean) => void;
  onPrivacyAcceptedChange: (checked: boolean) => void;
}

export const Step7FinalReview: React.FC<Step7FinalReviewProps> = ({
  propertyData,
  formatPrice,
  onTermsAcceptedChange,
  onPrivacyAcceptedChange,
}) => {
  console.log('✅ Step7FinalReview rendering with data:', propertyData);

  const handleCheckboxChange = useCallback((handler: (checked: boolean) => void) => (checked: boolean | "indeterminate") => {
    console.log('☑️ Review checkbox changed:', checked);
    handler(!!checked);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Revisión Final</h3>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">{propertyData.title}</h4>
              <p className="text-muted-foreground">{propertyData.address}, {propertyData.neighborhood}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Habitaciones:</span>
                <p className="font-semibold">{propertyData.bedrooms}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Baños:</span>
                <p className="font-semibold">{propertyData.bathrooms}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Área:</span>
                <p className="font-semibold">{propertyData.area}m²</p>
              </div>
              <div>
                <span className="text-muted-foreground">Precio:</span>
                <p className="font-semibold">{formatPrice(propertyData.price)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {propertyData.images.length} imágenes
              </Badge>
              {propertyData.acceptsCrypto && (
                <Badge variant="secondary">Acepta Crypto</Badge>
              )}
              {propertyData.financing && (
                <Badge variant="secondary">Financiación</Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={propertyData.termsAccepted}
            onCheckedChange={handleCheckboxChange(onTermsAcceptedChange)}
          />
          <Label htmlFor="terms" className="text-sm">
            Acepto los términos y condiciones de uso de la plataforma
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={propertyData.privacyAccepted}
            onCheckedChange={handleCheckboxChange(onPrivacyAcceptedChange)}
          />
          <Label htmlFor="privacy" className="text-sm">
            Acepto la política de privacidad y el procesamiento de mis datos
          </Label>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900">Revisión Administrativa</h4>
            <p className="text-yellow-700 text-sm mt-1">
              Tu propiedad será revisada por nuestro equipo antes de ser publicada.
              Te notificaremos cuando esté disponible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
