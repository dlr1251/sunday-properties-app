import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Camera, 
  FileText, 
  DollarSign, 
  Eye,
  Check,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Save
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2PropertyDetails } from './Step2PropertyDetails';
import { Step3Images } from './Step3Images';
import { Step4Documents } from './Step4Documents';
import { Step5SellingConditions } from './Step5SellingConditions';
import { Step5RentalConditions } from './Step5RentalConditions';
import { Step7FinalReview } from './Step7FinalReview';
import { VisitAvailabilityConfig } from '../VisitAvailabilityConfig';
import { useAuth } from '../../../contexts/AuthContext';
import { useVerification } from '../../../hooks/verification/useVerification';
import { toast } from 'sonner';
import { usePropertyUpload } from '../../../hooks/properties/usePropertyUpload';
import { usePropertyAudit } from '../../../hooks/properties/usePropertyAudit';
import { SuccessModal } from '../../ui/success-modal';
import type { PropertyData } from './types';
import { formatCurrency } from '../../../utils/format';

interface UploadWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const PropertyUploadWizard: React.FC<UploadWizardProps> = ({ onComplete, onCancel }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { verificationStatus } = useVerification();
  const { logPropertyChange, comparePropertyChanges } = usePropertyAudit();
  const { createDraftProperty, updatePropertyFields, uploadImage, deleteImage, uploadDoc, submitForReview } = usePropertyUpload();

  const steps = [
    { id: 1, title: t('properties.wizard.steps.documents.title'), description: t('properties.wizard.steps.documents.description') },
    { id: 2, title: t('properties.wizard.steps.basic.title'), description: t('properties.wizard.steps.basic.description') },
    { id: 3, title: t('properties.wizard.steps.features.title'), description: t('properties.wizard.steps.features.description') },
    { id: 4, title: t('properties.wizard.steps.photos.title'), description: t('properties.wizard.steps.photos.description') },
    { id: 5, title: t('properties.wizard.steps.conditions.title'), description: t('properties.wizard.steps.conditions.description') },
    { id: 6, title: t('properties.wizard.steps.availability.title'), description: t('properties.wizard.steps.availability.description') },
    { id: 7, title: t('properties.wizard.steps.review.title'), description: t('properties.wizard.steps.review.description') }
  ];

  // All hooks must be called before any conditional returns
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [originalProperty, setOriginalProperty] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    listingType: 'sale',
    title: '',
    description: '',
    address: '',
    neighborhood: '',
    coordinates: { lat: 0, lng: 0 },
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    parking: 0,
    floor: 0,
    totalFloors: 0,
    yearBuilt: 0,
    images: [],
    uploadedImages: [],
    virtualTour: null,
    freedomTradition: null,
    propertyType: '',
    strata: 0,
    price: 0,
    rentMonthly: 0,
    leaseTermMonths: 12,
    deposit: 0,
    adminFee: 0,
    utilitiesIncluded: [],
    petsPolicy: '',
    acceptsCrypto: false,
    financing: false,
    visitPrice: 49000,
    commission: 2.5,
    negotiationRules: {
      minPrice: undefined,
      maxClosingDays: undefined,
      requiredPaymentMethods: [],
      autoRejectEnabled: false,
      manualReviewThreshold: false,
      specialConditions: []
    },
    termsAccepted: false,
    privacyAccepted: false
  });
  const [dragActive, setDragActive] = useState(false);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<{[key: string]: {path: string, file: File}}>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [devBypass, setDevBypass] = useState(false);

  // Presets para testing rápido (dev)
  const TEST_PRESETS = [
    { title: 'Apartamento El Poblado', description: 'Apartamento amplio con vista.', address: 'Carrera 43A #15-25', neighborhood: 'el-poblado', bedrooms: 3, bathrooms: 2, area: 120, parking: 2, propertyType: 'apartment', strata: 4, price: 850000000 },
    { title: 'Casa Laureles', description: 'Casa con jardín y zona de parrilla.', address: 'Calle 70 #45-20', neighborhood: 'laureles', bedrooms: 4, bathrooms: 3, area: 180, parking: 2, propertyType: 'house', strata: 3, price: 650000000 },
    { title: 'Apartamento Envigado', description: 'Apartamento nuevo, acabados premium.', address: 'Carrera 43 #30 Sur 15', neighborhood: 'envigado', bedrooms: 2, bathrooms: 2, area: 95, parking: 1, propertyType: 'apartment', strata: 5, price: 520000000 },
    { title: 'Apartamento Sabaneta', description: 'Cerca al metro, excelente ubicación.', address: 'Calle 50 #70-10', neighborhood: 'sabaneta', bedrooms: 2, bathrooms: 1, area: 75, parking: 1, propertyType: 'apartment', strata: 3, price: 380000000 },
  ];

  const fillTestData = useCallback(() => {
    const preset = TEST_PRESETS[Math.floor(Math.random() * TEST_PRESETS.length)];
    const in3Months = new Date();
    in3Months.setMonth(in3Months.getMonth() + 3);
    setPropertyData(prev => ({
      ...prev,
      listingType: 'sale',
      title: preset.title,
      description: preset.description,
      address: preset.address,
      neighborhood: preset.neighborhood,
      bedrooms: preset.bedrooms,
      bathrooms: preset.bathrooms,
      area: preset.area,
      parking: preset.parking,
      propertyType: preset.propertyType,
      strata: preset.strata,
      price: preset.price,
      offeredTimeline: {
        deedSigningDate: in3Months.toISOString().slice(0, 10),
        propertyDeliveryDate: in3Months.toISOString().slice(0, 10),
        paymentReceptionDate: in3Months.toISOString().slice(0, 10),
      },
      acceptedPaymentMethods: ['transferencia', 'efectivo'],
    }));
    toast.success(t('properties.wizard.testDataLoaded', { title: preset.title }));
  }, [t]);

  // Optimized change handlers to prevent unnecessary re-renders
  const handleTitleChange = useCallback((value: string) => {
    console.log('🔄 handleTitleChange called with:', value);
    console.log('📊 Current propertyData.title:', propertyData.title);
    setPropertyData(prev => {
      const newState = { ...prev, title: value };
      console.log('📝 New propertyData after title change:', newState);
      return newState;
    });
  }, [propertyData.title]);

  const handleDescriptionChange = useCallback((value: string) => {
    console.log('🔄 handleDescriptionChange called with:', value);
    setPropertyData(prev => ({ ...prev, description: value }));
  }, []);

  const handleAddressChange = useCallback((value: string) => {
    console.log('🔄 handleAddressChange called with:', value);
    setPropertyData(prev => ({ ...prev, address: value }));
  }, []);

  const handleNeighborhoodChange = useCallback((value: string) => {
    console.log('🔄 handleNeighborhoodChange called with:', value);
    setPropertyData(prev => ({ ...prev, neighborhood: value }));
  }, []);

  const handleCoordinatesChange = useCallback((coordinates: { lat: number; lng: number }) => {
    console.log('🔄 handleCoordinatesChange called with:', coordinates);
    setPropertyData(prev => ({ ...prev, coordinates }));
  }, []);

  const handleNumericChange = useCallback((field: string, value: string) => {
    console.log('🔄 handleNumericChange called for field:', field, 'with value:', value);
    const numValue = parseInt(value) || 0;
    setPropertyData(prev => ({ ...prev, [field]: numValue }));
  }, []);

  // Additional handlers for new components
  const handlePriceChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    setPropertyData(prev => ({ ...prev, price: numValue }));
  }, []);

  const handleOfferedTimelineChange = useCallback((field: 'deedSigningDate' | 'propertyDeliveryDate' | 'paymentReceptionDate', value: string) => {
    setPropertyData(prev => ({
      ...prev,
      offeredTimeline: {
        ...(prev.offeredTimeline ?? {}),
        [field]: value || undefined
      }
    }));
  }, []);

  const handleAcceptedPaymentMethodsChange = useCallback((methods: string[]) => {
    setPropertyData(prev => ({ ...prev, acceptedPaymentMethods: methods }));
  }, []);

  const handleMinPriceChange = useCallback((value: string) => {
    const numValue = value ? Number(value) : undefined;
    setPropertyData(prev => ({
      ...prev,
      negotiationRules: {
        ...prev.negotiationRules,
        minPrice: numValue
      }
    }));
  }, []);

  const handleMaxClosingDaysChange = useCallback((value: string) => {
    const numValue = value ? Number(value) : undefined;
    setPropertyData(prev => ({
      ...prev,
      negotiationRules: {
        ...prev.negotiationRules,
        maxClosingDays: numValue
      }
    }));
  }, []);

  const handlePaymentMethodToggle = useCallback((method: string) => {
    setPropertyData(prev => {
      const currentMethods = prev.negotiationRules.requiredPaymentMethods;
      const newMethods = currentMethods.includes(method)
        ? currentMethods.filter(m => m !== method)
        : [...currentMethods, method];

      return {
        ...prev,
        negotiationRules: {
          ...prev.negotiationRules,
          requiredPaymentMethods: newMethods
        }
      };
    });
  }, []);

  const handleAutoRejectToggle = useCallback((checked: boolean) => {
    setPropertyData(prev => ({
      ...prev,
      negotiationRules: {
        ...prev.negotiationRules,
        autoRejectEnabled: checked
      }
    }));
  }, []);

  const handleManualReviewToggle = useCallback((checked: boolean) => {
    setPropertyData(prev => ({
      ...prev,
      negotiationRules: {
        ...prev.negotiationRules,
        manualReviewThreshold: checked
      }
    }));
  }, []);

  const handleTermsAcceptedChange = useCallback((checked: boolean) => {
    setPropertyData(prev => ({ ...prev, termsAccepted: checked }));
  }, []);

  const handlePrivacyAcceptedChange = useCallback((checked: boolean) => {
    setPropertyData(prev => ({ ...prev, privacyAccepted: checked }));
  }, []);


  useEffect(() => {
    if (verificationStatus && verificationStatus !== 'verified') {
      toast.error(t('properties.wizard.verifyIdentityFirst'));
    }
  }, [verificationStatus]);

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files);
    const validImages = newImages.filter(file =>
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );
    if (validImages.length !== newImages.length) {
      toast.error(t('properties.wizard.imagesMax10mb'));
      return;
    }
    if (propertyData.images.length + validImages.length > 20) {
      toast.error(t('properties.wizard.imagesMax20'));
      return;
    }
    const uploadedImageUrls: string[] = [];
    for (const image of validImages) {
      try {
        const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error } = await supabase.storage.from('property-photos').upload(fileName, image);
        if (error) throw error;
        const { data: publicUrl } = supabase.storage.from('property-photos').getPublicUrl(fileName);
        uploadedImageUrls.push(publicUrl.publicUrl);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Upload error:', error);
        if (import.meta.env.DEV) {
          const blobUrl = URL.createObjectURL(image);
          uploadedImageUrls.push(blobUrl);
          toast.warning(t('properties.wizard.storageFailedPreview', { name: image.name, msg }));
          continue;
        }
        toast.error(t('properties.wizard.uploadError', { name: image.name, msg }));
        return;
      }
    }
    setPropertyData(prev => ({
      ...prev,
      images: [...prev.images, ...validImages],
      uploadedImages: [...(prev.uploadedImages || []), ...uploadedImageUrls]
    }));
  }, [propertyData.images.length, t]);

  const loadSampleImage = useCallback(async () => {
    const res = await fetch('/ai_food/jpeg/vista_1.jpeg');
    if (!res.ok) throw new Error(t('properties.wizard.sampleImageMissing'));
    const blob = await res.blob();
    const file = new File([blob], 'vista_1.jpeg', { type: 'image/jpeg' });
    const dt = new DataTransfer();
    dt.items.add(file);
    await handleImageUpload(dt.files);
  }, [handleImageUpload, t]);

  const buildDraftPayload = useCallback((): Record<string, unknown> => ({
    title: propertyData.title || 'Draft Property',
    description: propertyData.description || 'Draft property',
    address: propertyData.address || 'To be updated',
    neighborhood: propertyData.neighborhood || 'To be updated',
    city: 'To be updated',
    coordinates: propertyData.coordinates || { lat: 0, lng: 0 },
    bedrooms: propertyData.bedrooms || 1,
    bathrooms: propertyData.bathrooms || 1,
    area: propertyData.area || 1,
    property_type: propertyData.propertyType || 'apartment',
    listing_type: propertyData.listingType,
    price: propertyData.listingType === 'sale' ? (propertyData.price || 100000) : null,
    rent_monthly: propertyData.listingType === 'rental' ? (propertyData.rentMonthly || 100000) : null,
    lease_term_months: propertyData.listingType === 'rental' ? (propertyData.leaseTermMonths || 12) : null,
    deposit: propertyData.listingType === 'rental' ? (propertyData.deposit || 0) : null,
    admin_fee: propertyData.listingType === 'rental' ? (propertyData.adminFee || 0) : null,
    utilities_included: propertyData.listingType === 'rental' ? (propertyData.utilitiesIncluded || []) : [],
    pets_policy: propertyData.listingType === 'rental' ? (propertyData.petsPolicy || '') : null,
    visit_price: propertyData.visitPrice ?? 49000,
    accepts_crypto: propertyData.acceptsCrypto ?? false,
    financing: propertyData.financing ?? false,
    status: 'draft',
    negotiation_terms: {
      ...(propertyData.negotiationRules && typeof propertyData.negotiationRules === 'object' ? propertyData.negotiationRules : {}),
      offeredTimeline: propertyData.offeredTimeline,
      acceptedPaymentMethods: propertyData.acceptedPaymentMethods ?? []
    }
  }), [propertyData]);

  if (!verificationStatus) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <Card className="p-8 border-2">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            <span className="font-medium">{t('properties.wizard.verifyingIdentity')}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (verificationStatus !== 'verified' && !devBypass) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('properties.wizard.verificationRequired')}
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          {t('properties.wizard.verificationRequiredBody')}
        </p>
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline">
            {t('common.close')}
          </Button>
          {import.meta.env.DEV && (
            <Button onClick={() => setDevBypass(true)} variant="secondary">
              {t('properties.wizard.continueUnverifiedDev')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const progress = (currentStep / steps.length) * 100;

  const nextStep = async () => {
    if (currentStep < steps.length) {
      let currentDraftId = draftId;
      
      // Create draft property only when reaching step 6 (Visit Availability)
      if (!currentDraftId && currentStep === 5) {
        try {
          toast.info(t('properties.wizard.creatingDraft'));
          
          // Gather all collected data to create a complete draft
          const draftData: Record<string, unknown> = {
            title: propertyData.title || 'Draft Property',
            description: propertyData.description || 'Draft property',
            address: propertyData.address || 'To be updated',
            neighborhood: propertyData.neighborhood || 'To be updated',
            city: 'To be updated',
            coordinates: propertyData.coordinates || { lat: 0, lng: 0 },
            bedrooms: propertyData.bedrooms || 1,
            bathrooms: propertyData.bathrooms || 1,
            area: propertyData.area || 1,
            property_type: propertyData.propertyType || 'apartment',
            listing_type: propertyData.listingType,
            price: propertyData.listingType === 'sale' ? (propertyData.price || 100000) : null,
            rent_monthly: propertyData.listingType === 'rental' ? (propertyData.rentMonthly || 100000) : null,
            lease_term_months: propertyData.listingType === 'rental' ? (propertyData.leaseTermMonths || 12) : null,
            deposit: propertyData.listingType === 'rental' ? (propertyData.deposit || 0) : null,
            admin_fee: propertyData.listingType === 'rental' ? (propertyData.adminFee || 0) : null,
            utilities_included: propertyData.listingType === 'rental' ? (propertyData.utilitiesIncluded || []) : [],
            pets_policy: propertyData.listingType === 'rental' ? (propertyData.petsPolicy || '') : null,
            visit_price: propertyData.visitPrice ?? 49000,
            accepts_crypto: propertyData.acceptsCrypto ?? false,
            financing: propertyData.financing ?? false,
            status: 'draft',
            negotiation_terms: {
              ...(propertyData.negotiationRules && typeof propertyData.negotiationRules === 'object' ? propertyData.negotiationRules : {}),
              offeredTimeline: propertyData.offeredTimeline,
              acceptedPaymentMethods: propertyData.acceptedPaymentMethods ?? []
            }
          };
          
          console.log('Creating draft with data:', draftData);
          const result = await createDraftProperty(draftData);
          
          if (result?.id) {
            console.log('Draft created with ID:', result.id);
            setDraftId(result.id);
            currentDraftId = result.id;
            toast.success(t('properties.wizard.draftCreated'));
          } else {
            throw new Error('No ID returned from draft creation');
          }
        } catch (error: any) {
          console.error('Error creating draft:', error);
          toast.error(t('properties.wizard.draftError', { message: error.message }));
          return; // Don't proceed to next step if draft creation fails
        }
      }
      
      // Autosave before moving to next step
      if (currentDraftId) {
        try {
          const fieldsToUpdate: any = {};

          switch (currentStep) {
            case 1:
              // Documents already saved when uploaded
              break;
            case 2:
              fieldsToUpdate.title = propertyData.title;
              fieldsToUpdate.description = propertyData.description;
              fieldsToUpdate.address = propertyData.address;
              fieldsToUpdate.neighborhood = propertyData.neighborhood;
              break;
            case 3:
              fieldsToUpdate.bedrooms = propertyData.bedrooms;
              fieldsToUpdate.bathrooms = propertyData.bathrooms;
              fieldsToUpdate.area = propertyData.area;
              fieldsToUpdate.property_type = propertyData.propertyType;
              fieldsToUpdate.strata = propertyData.strata;
              break;
            case 4:
              // Images already saved when uploaded
              break;
            case 5:
              fieldsToUpdate.listing_type = propertyData.listingType;
              fieldsToUpdate.price = propertyData.listingType === 'sale' ? propertyData.price : null;
              fieldsToUpdate.rent_monthly = propertyData.listingType === 'rental' ? propertyData.rentMonthly : null;
              fieldsToUpdate.lease_term_months = propertyData.listingType === 'rental' ? propertyData.leaseTermMonths : null;
              fieldsToUpdate.deposit = propertyData.listingType === 'rental' ? propertyData.deposit : null;
              fieldsToUpdate.admin_fee = propertyData.listingType === 'rental' ? propertyData.adminFee : null;
              fieldsToUpdate.utilities_included = propertyData.listingType === 'rental' ? (propertyData.utilitiesIncluded ?? []) : [];
              fieldsToUpdate.pets_policy = propertyData.listingType === 'rental' ? (propertyData.petsPolicy ?? '') : null;
              fieldsToUpdate.negotiation_terms = {
                ...(typeof propertyData.negotiationRules === 'object' ? propertyData.negotiationRules : {}),
                offeredTimeline: propertyData.offeredTimeline,
                acceptedPaymentMethods: propertyData.acceptedPaymentMethods ?? []
              };
              break;
          }

          if (Object.keys(fieldsToUpdate).length > 0) {
            await updatePropertyFields(currentDraftId, fieldsToUpdate);
          }
        } catch (error) {
          console.error('Autosave error:', error);
        }
      }

      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const removeImage = (index: number) => {
    setPropertyData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      uploadedImages: prev.uploadedImages?.filter((_, i) => i !== index) || []
    }));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(null);
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setPropertyData(prev => {
      const images = [...prev.images];
      const uploadedImages = [...(prev.uploadedImages || [])];
      if (direction === 'left' && index > 0) {
        [images[index], images[index - 1]] = [images[index - 1], images[index]];
        [uploadedImages[index], uploadedImages[index - 1]] = [uploadedImages[index - 1], uploadedImages[index]];
      } else if (direction === 'right' && index < images.length - 1) {
        [images[index], images[index + 1]] = [images[index + 1], images[index]];
        [uploadedImages[index], uploadedImages[index + 1]] = [uploadedImages[index + 1], uploadedImages[index]];
      }
      return { ...prev, images, uploadedImages };
    });
  };

  const handleDocUpload = async (docType: string, file: File) => {
    try {
      // Sanitize filename to remove special characters
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
      
      const fileName = `${docType}-${Date.now()}-${sanitizedFileName}`;
      const { data, error } = await supabase.storage
        .from('property-docs')
        .upload(fileName, file);

      if (error) throw error;

      setUploadedDocs(prev => ({
        ...prev,
        [docType]: { path: data.path, file }
      }));

      toast.success(t('properties.wizard.docUploaded', { type: docType.toUpperCase() }));
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error(t('properties.wizard.docUploadError', { type: docType.toUpperCase() }));
    }
  };

  const renderStep = () => {
    console.log('🎯 renderStep called for step:', currentStep);
    switch (currentStep) {
      case 1: return (
        <Step4Documents
          uploadedDocs={uploadedDocs}
          submitting={submitting}
          onDocUpload={handleDocUpload}
        />
      );
      case 2: return (
        <Step1BasicInfo
          propertyData={propertyData}
          onListingTypeChange={(value) => setPropertyData((prev) => ({ ...prev, listingType: value }))}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onAddressChange={handleAddressChange}
          onNeighborhoodChange={handleNeighborhoodChange}
          onCoordinatesChange={handleCoordinatesChange}
        />
      );
      case 3: return (
        <Step2PropertyDetails
          propertyData={propertyData}
          onNumericChange={handleNumericChange}
          onPropertyTypeChange={(value) => setPropertyData(prev => ({ ...prev, propertyType: value }))}
          onStrataChange={(value) => setPropertyData(prev => ({ ...prev, strata: parseInt(value) }))}
        />
      );
      case 4: return (
        <Step3Images
          propertyData={propertyData}
          dragActive={dragActive}
          primaryImageIndex={primaryImageIndex}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleImageUpload(e.dataTransfer.files);
          }}
          onImageUpload={handleImageUpload}
          onMoveImage={moveImage}
          onSetPrimaryImage={(index) => setPrimaryImageIndex(index)}
          onRemoveImage={removeImage}
          onLoadSampleImage={loadSampleImage}
        />
      );
      case 5: return (
        propertyData.listingType === 'sale' ? (
          <Step5SellingConditions
            propertyData={propertyData}
            formatPrice={formatPrice}
            onPriceChange={handlePriceChange}
            onOfferedTimelineChange={handleOfferedTimelineChange}
            onAcceptedPaymentMethodsChange={handleAcceptedPaymentMethodsChange}
            onMinPriceChange={handleMinPriceChange}
            onMaxClosingDaysChange={handleMaxClosingDaysChange}
            onAutoRejectToggle={handleAutoRejectToggle}
            onManualReviewToggle={handleManualReviewToggle}
          />
        ) : (
          <Step5RentalConditions
            propertyData={propertyData}
            formatPrice={formatPrice}
            onRentMonthlyChange={(value) => setPropertyData((prev) => ({ ...prev, rentMonthly: Number(value) || 0 }))}
            onLeaseTermMonthsChange={(value) => setPropertyData((prev) => ({ ...prev, leaseTermMonths: Number(value) || 0 }))}
            onDepositChange={(value) => setPropertyData((prev) => ({ ...prev, deposit: Number(value) || 0 }))}
            onAdminFeeChange={(value) => setPropertyData((prev) => ({ ...prev, adminFee: Number(value) || 0 }))}
            onUtilitiesIncludedChange={(utilities) => setPropertyData((prev) => ({ ...prev, utilitiesIncluded: utilities }))}
            onPetsPolicyChange={(value) => setPropertyData((prev) => ({ ...prev, petsPolicy: value }))}
          />
        )
      );
      case 6: return draftId ? (
        <VisitAvailabilityConfig
          propertyId={draftId}
          onComplete={() => {
            setPropertyData(prev => ({ ...prev, visitAvailabilityConfigured: true }));
            setCurrentStep(7);
          }}
        />
      ) : (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('properties.wizard.creatingDraft')}</p>
        </div>
      );
      case 7: return (
        <Step7FinalReview
          propertyData={propertyData}
          formatPrice={formatPrice}
          onTermsAcceptedChange={handleTermsAcceptedChange}
          onPrivacyAcceptedChange={handlePrivacyAcceptedChange}
        />
      );
      default: return (
        <Step4Documents
          uploadedDocs={uploadedDocs}
          submitting={submitting}
          onDocUpload={handleDocUpload}
        />
      );
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return uploadedDocs.clyt; // CLYT requerido en el primer paso
      case 2:
        return propertyData.listingType && propertyData.title && propertyData.description && propertyData.address && propertyData.neighborhood;
      case 3:
        return propertyData.bedrooms > 0 && propertyData.bathrooms > 0 && propertyData.area > 0 && propertyData.propertyType;
      case 4:
        return propertyData.images.length >= 1 && propertyData.images.length <= 20;
      case 5:
        return propertyData.listingType === 'sale'
          ? propertyData.price > 0
          : propertyData.rentMonthly > 0 && propertyData.leaseTermMonths > 0;
      case 6:
        return true; // Visit availability - draft is created when entering this step
      case 7:
        return propertyData.termsAccepted && propertyData.privacyAccepted;
      default:
        return false;
    }
  };

  const requireEligibility = (): boolean => {
    const emailVerified = Boolean((user as any)?.email_confirmed_at);
    if (!emailVerified) {
      toast.error(t('properties.wizard.mustVerifyEmailSubmit'));
      return false;
    }
    if (verificationStatus !== 'verified') {
      toast.error(t('properties.wizard.mustVerifyIdentitySubmit'));
      return false;
    }
    return true;
  };

  const saveDraft = async () => {
    try {
      if (!user) return;
      const payload = buildDraftPayload();
      if (draftId) {
        await updatePropertyFields(draftId, payload);
        toast.success(t('properties.wizard.draftUpdated'));
      } else {
        const result = await createDraftProperty(payload);
        if (result?.id) {
          setDraftId(result.id);
          toast.success(t('properties.wizard.draftSaved'));
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(t('properties.wizard.draftSaveError'));
    }
  };

  const submitForApproval = async () => {
    if (!requireEligibility() || !draftId || !user) return;

    setSubmitting(true);
    try {
      // Sanitize: omit File objects and other non-JSON-serializable data
      const { images: _im, virtualTour: _vt, freedomTradition: _ft, ...propertySerializable } = propertyData;
      const submittedData = {
        property: {
          ...propertySerializable,
          imagesCount: propertyData.images?.length ?? 0,
          uploadedImages: propertyData.uploadedImages ?? []
        },
        uploadedDocsPaths: Object.fromEntries(
          Object.entries(uploadedDocs).map(([k, v]) => [k, v?.path ?? null])
        ),
        primaryImageIndex
      };

      const { error: verificationError } = await supabase
        .from('property_verifications')
        .insert({
          property_id: draftId,
          user_id: user.id,
          status: 'pending',
          submitted_data: submittedData,
          visit_availability_configured: true
        });

      if (verificationError) throw verificationError;

      // Update property status to pending
      await submitForReview({ propertyId: draftId });

      // Show success modal
      setShowSuccessModal(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('properties.wizard.submitError');
      console.error('Error submitting for review:', error);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number): string => formatCurrency(price);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{t('properties.wizard.publishTitle')}</h1>
            <p className="text-muted-foreground">
              {t('properties.wizard.stepOf', { current: currentStep, total: steps.length, title: steps[currentStep - 1].title })}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t('common.cancel')}
          </Button>
        </div>
        
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 lg:px-6">
        {currentStep >= 2 && currentStep <= 5 && (
          <div className="mb-4 flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={fillTestData} className="text-xs">
              {t('properties.wizard.fillTestData')}
            </Button>
          </div>
        )}
        <Card className="p-6">
          {renderStep()}
      </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('common.previous')}
          </Button>

          <div className="flex items-center space-x-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full ${
                  step.id <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" onClick={saveDraft} disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {t('properties.wizard.saveDraft')}
            </Button>
            {currentStep === steps.length ? (
              <Button onClick={submitForApproval} disabled={!canProceed() || submitting} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                {t('properties.wizard.submitForReview')}
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={!canProceed()}>
                {t('common.next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onComplete();
        }}
        title={t('properties.wizard.successTitle')}
        message={t('properties.wizard.successMessage')}
        redirectTo="/dashboard"
        redirectLabel={t('properties.wizard.viewDashboard')}
      />
    </div>
  );
};