export interface PaymentStage {
  name: string;
  type: 'opcion' | 'promesa' | 'escrituras';
  percentage: number;
  amount: number;
  description: string;
  contingencies?: string[];
}

export interface PropertyData {
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
  // Nuevas condiciones de negociación
  paymentStages?: PaymentStage[];
  stageTimeframes?: {
    opcionToPromesa: number;
    promesaToEscrituras: number;
  };
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

export interface Step1BasicInfoProps {
  propertyData: PropertyData;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onCoordinatesChange: (coordinates: { lat: number; lng: number }) => void;
}

export interface Step2PropertyDetailsProps {
  propertyData: PropertyData;
  onNumericChange: (field: string, value: string) => void;
  onPropertyTypeChange: (value: string) => void;
  onStrataChange: (value: string) => void;
}

export interface Step3ImagesProps {
  propertyData: PropertyData;
  dragActive: boolean;
  primaryImageIndex: number | null;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onImageUpload: (files: FileList | null) => void;
  onMoveImage: (index: number, direction: 'left' | 'right') => void;
  onSetPrimaryImage: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

export interface Step4DocumentsProps {
  uploadedDocs: { [key: string]: { path: string; file: File } };
  submitting: boolean;
  onDocUpload: (docType: string, file: File) => void;
}

export interface Step5SellingConditionsProps {
  propertyData: PropertyData;
  formatPrice: (price: number) => string;
  onPriceChange: (value: string) => void;
  onVisitPriceChange: (value: string) => void;
  onCommissionChange: (value: string) => void;
  onAcceptsCryptoChange: (checked: boolean) => void;
  onFinancingChange: (checked: boolean) => void;
  onPaymentStagesChange?: (stages: PaymentStage[]) => void;
  onTimeframesChange?: (timeframes: { opcionToPromesa: number; promesaToEscrituras: number }) => void;
}

export interface Step6NegotiationRulesProps {
  negotiationRules: PropertyData['negotiationRules'];
  onMinPriceChange: (value: string) => void;
  onMaxClosingDaysChange: (value: string) => void;
  onPaymentMethodToggle: (method: string) => void;
  onAutoRejectToggle: (checked: boolean) => void;
  onManualReviewToggle: (checked: boolean) => void;
}

export interface Step7FinalReviewProps {
  propertyData: PropertyData;
  formatPrice: (price: number) => string;
  onTermsAcceptedChange: (checked: boolean) => void;
  onPrivacyAcceptedChange: (checked: boolean) => void;
}
