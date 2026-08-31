export interface PaymentStage {
  name: string;
  type: 'opcion' | 'promesa' | 'escrituras';
  percentage: number;
  amount: number;
  description: string;
  contingencies?: string[];
}

export interface PropertyData {
  listingType: 'sale' | 'rental';
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
  /** Sale price (COP). For rentals, use rentMonthly instead. */
  price: number;
  /** Rental price (COP/month). */
  rentMonthly: number;
  /** Typical lease term (months). */
  leaseTermMonths: number;
  /** Security deposit (COP). */
  deposit: number;
  /** Admin/agency fee (COP). */
  adminFee: number;
  /** Utilities included (labels/ids). */
  utilitiesIncluded: string[];
  /** Pets policy (freeform for now). */
  petsPolicy: string;
  acceptsCrypto: boolean;
  financing: boolean;
  visitPrice: number;
  commission: number;
  /** Cronograma ofrecido: fechas clave de la venta */
  offeredTimeline?: {
    deedSigningDate?: string;
    propertyDeliveryDate?: string;
    paymentReceptionDate?: string;
  };
  /** Métodos de pago que el vendedor acepta */
  acceptedPaymentMethods?: string[];
  // Condiciones de negociación (legacy / futuro)
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

  /** Stored URLs for images uploaded to storage */
  uploadedImages?: string[];
  /** Whether visit availability was configured in the wizard */
  visitAvailabilityConfigured?: boolean;
}

export interface Step1BasicInfoProps {
  propertyData: PropertyData;
  onListingTypeChange: (value: PropertyData['listingType']) => void;
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
  onOfferedTimelineChange: (field: 'deedSigningDate' | 'propertyDeliveryDate' | 'paymentReceptionDate', value: string) => void;
  onAcceptedPaymentMethodsChange: (methods: string[]) => void;
  onMinPriceChange: (value: string) => void;
  onMaxClosingDaysChange: (value: string) => void;
  onAutoRejectToggle: (checked: boolean) => void;
  onManualReviewToggle: (checked: boolean) => void;
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
