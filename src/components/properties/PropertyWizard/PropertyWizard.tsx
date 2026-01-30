import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { ChevronLeft, ChevronRight, Home, MapPin, DollarSign, Camera, FileText, Check } from 'lucide-react';
import { BasicDetailsStep } from './steps/BasicDetailsStep';
import { LocationStep } from './steps/LocationStep';
import { PricingStep } from './steps/PricingStep';
import { MediaStep } from './steps/MediaStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { ReviewStep } from './steps/ReviewStep';
import { toast } from 'sonner';

export interface PropertyFormData {
  // Basic Details
  title: string;
  description: string;
  property_type: 'apartment' | 'house' | 'townhouse' | 'office' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  strata?: number;

  // Location
  address: string;
  neighborhood: string;
  city: string;
  coordinates: { lat: number; lng: number };

  // Pricing & Conditions
  price: number;
  minimum_offer_price?: number;
  monthly_costs?: number;
  accepts_crypto: boolean;
  financing: boolean;
  visit_price: number;
  conditions: string[];

  // Media
  images: File[];
  virtual_tour?: string;
  videos: File[];
  freedom_tradition?: string;

  // Documents
  ownership_documents: File[];
  legal_documents: File[];
}

const steps = [
  { id: 'basic', title: 'Detalles Básicos', icon: Home },
  { id: 'location', title: 'Ubicación', icon: MapPin },
  { id: 'pricing', title: 'Precio y Condiciones', icon: DollarSign },
  { id: 'media', title: 'Fotos y Videos', icon: Camera },
  { id: 'documents', title: 'Documentos Legales', icon: FileText },
  { id: 'review', title: 'Revisar y Publicar', icon: Check }
];

interface PropertyWizardProps {
  onComplete?: (data: PropertyFormData) => void;
  onCancel?: () => void;
  isDarkMode?: boolean;
}

export const PropertyWizard: React.FC<PropertyWizardProps> = ({
  onComplete,
  onCancel,
  isDarkMode = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    parking: 0,
    accepts_crypto: false,
    financing: false,
    visit_price: 49000,
    address: '',
    neighborhood: '',
    city: '',
    coordinates: { lat: 0, lng: 0 },
    price: 0,
    conditions: [],
    images: [],
    videos: [],
    ownership_documents: [],
    legal_documents: []
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Here we would submit the form data
      toast.success('Propiedad enviada para revisión');
      onComplete?.(formData);
    } catch (error) {
      toast.error('Error al enviar la propiedad');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic details
        return formData.title && formData.description && formData.price > 0;
      case 1: // Location
        return formData.address && formData.neighborhood && formData.city;
      case 2: // Pricing
        return formData.price > 0;
      case 3: // Media
        return formData.images.length > 0;
      case 4: // Documents
        return formData.ownership_documents.length > 0;
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicDetailsStep data={formData} onUpdate={updateFormData} isDarkMode={isDarkMode} />;
      case 1:
        return <LocationStep data={formData} onUpdate={updateFormData} isDarkMode={isDarkMode} />;
      case 2:
        return <PricingStep data={formData} onUpdate={updateFormData} isDarkMode={isDarkMode} />;
      case 3:
        return <MediaStep data={formData} onUpdate={updateFormData} isDarkMode={isDarkMode} />;
      case 4:
        return <DocumentsStep data={formData} onUpdate={updateFormData} isDarkMode={isDarkMode} />;
      case 5:
        return <ReviewStep data={formData} onComplete={handleComplete} isDarkMode={isDarkMode} />;
      default:
        return null;
    }
  };

  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className={cardClasses}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={textPrimary}>Publicar Nueva Propiedad</CardTitle>
              <p className={textSecondary}>Complete los pasos para publicar su propiedad</p>
            </div>
            <div className="text-right">
              <div className={`text-sm ${textSecondary}`}>Paso {currentStep + 1} de {steps.length}</div>
              <div className={`text-lg font-semibold ${textPrimary}`}>{steps[currentStep].title}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'bg-blue-500 text-white' :
                        isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}
                    `}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? textPrimary : textSecondary}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card className={cardClasses}>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : prevStep}
          className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        <Button
          onClick={currentStep === steps.length - 1 ? handleComplete : nextStep}
          disabled={!canProceed()}
          className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {currentStep === steps.length - 1 ? 'Publicar Propiedad' : 'Siguiente'}
          {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};
