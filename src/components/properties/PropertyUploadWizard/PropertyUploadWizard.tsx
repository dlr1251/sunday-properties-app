import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2PropertyDetails } from './Step2PropertyDetails';
import { Step3Images } from './Step3Images';
import { Step4Documents } from './Step4Documents';
import { Step5SellingConditions } from './Step5SellingConditions';
import { Step6NegotiationRules } from './Step6NegotiationRules';
import { Step7FinalReview } from './Step7FinalReview';
import { VisitAvailabilityConfig } from '../VisitAvailabilityConfig';
import { DocumentData } from '../../../services/documentAnalysis';
import { negotiationSuggestionService } from '../../../services/negotiationSuggestion.service';
import { useAuth } from '../../../contexts/AuthContext';
import { useVerification } from '../../../hooks/verification/useVerification';
import { toast } from 'sonner';
import { usePropertyUpload } from '../../../hooks/properties/usePropertyUpload';
import { usePropertyAudit } from '../../../hooks/properties/usePropertyAudit';
import { SuccessModal } from '../../ui/success-modal';
import type { PropertyData } from './types';

interface UploadWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const steps = [
  { id: 1, title: 'Documentos Legales', description: 'Libertad y tradición con IA' },
  { id: 2, title: 'Información Básica', description: 'Nombre y ubicación' },
  { id: 3, title: 'Características', description: 'Detalles de la propiedad' },
  { id: 4, title: 'Fotografías', description: 'Imágenes y tour virtual' },
  { id: 5, title: 'Condiciones de Venta', description: 'Precio y términos' },
  { id: 6, title: 'Reglas de Negociación', description: 'Configurar ofertas automáticas' },
  { id: 7, title: 'Disponibilidad de Visitas', description: 'Configurar horarios' },
  { id: 8, title: 'Revisión Final', description: 'Confirmar y publicar' }
];

export const PropertyUploadWizard: React.FC<UploadWizardProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const { verificationStatus } = useVerification();
  const { logPropertyChange, comparePropertyChanges } = usePropertyAudit();
  const { createDraftProperty, updatePropertyFields, uploadImage, deleteImage, uploadDoc, submitForReview } = usePropertyUpload();

  // All hooks must be called before any conditional returns
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [originalProperty, setOriginalProperty] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData>({
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
  const [analyzedDocs, setAnalyzedDocs] = useState<{[key: string]: DocumentData}>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleVisitPriceChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    setPropertyData(prev => ({ ...prev, visitPrice: numValue }));
  }, []);

  const handleCommissionChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    setPropertyData(prev => ({ ...prev, commission: numValue }));
  }, []);

  const handleAcceptsCryptoChange = useCallback((checked: boolean) => {
    setPropertyData(prev => ({ ...prev, acceptsCrypto: checked }));
  }, []);

  const handleFinancingChange = useCallback((checked: boolean) => {
    setPropertyData(prev => ({ ...prev, financing: checked }));
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

  const handlePaymentStagesChange = useCallback((stages: any[]) => {
    setPropertyData(prev => ({ ...prev, paymentStages: stages }));
  }, []);

  const handleTimeframesChange = useCallback((timeframes: { opcionToPromesa: number; promesaToEscrituras: number }) => {
    setPropertyData(prev => ({ ...prev, stageTimeframes: timeframes }));
  }, []);

  const handleDocumentAnalyzed = useCallback((docType: string, data: DocumentData) => {
    console.log(`📋 Document ${docType} analyzed:`, data);

    // Store analyzed data
    setAnalyzedDocs(prev => ({
      ...prev,
      [docType]: data
    }));

    // Auto-fill property data based on extracted information
    if (data.extractedData) {
      setPropertyData(prev => {
        const updates: any = {};

        // CLYT data - NEW detailed structure
        if (docType === 'clyt' && data.extractedData) {
          const clyt = data.extractedData.clytDetailed;
          
          if (clyt?.DescripcionInmueble?.Ubicacion) {
            const ubicacion = clyt.DescripcionInmueble.Ubicacion;
            
            // Extract address components
            if (ubicacion.Direccion) updates.address = ubicacion.Direccion;
            if (ubicacion.Edificio) {
              // Include building name in title if available
              const buildingStr = ubicacion.Edificio;
              const floorStr = ubicacion.Piso ? ` Piso ${ubicacion.Piso}` : '';
              const aptStr = clyt.DescripcionInmueble.Numero ? ` Apt ${clyt.DescripcionInmueble.Numero}` : '';
              updates.title = `${buildingStr}${floorStr}${aptStr}`;
            }
            
            // Extract neighborhood/city (try to match with our available options)
            if (ubicacion.Barrio) {
              const barrioLower = ubicacion.Barrio.toLowerCase();
              // Map common neighborhoods
              if (barrioLower.includes('poblado')) updates.neighborhood = 'el-poblado';
              else if (barrioLower.includes('laureles')) updates.neighborhood = 'laureles';
              else if (barrioLower.includes('envigado')) updates.neighborhood = 'envigado';
              else if (barrioLower.includes('sabaneta')) updates.neighborhood = 'sabaneta';
              else if (barrioLower.includes('bello')) updates.neighborhood = 'bello';
            }
          }
          
          // Extract area - convert from "136.59 MTS" to number
          if (clyt?.DescripcionInmueble?.Area) {
            const areaMatch = clyt.DescripcionInmueble.Area.match(/([\d.]+)/);
            if (areaMatch) {
              updates.area = parseFloat(areaMatch[1]);
            }
          }
          
          // Extract floor
          if (clyt?.DescripcionInmueble?.Ubicacion?.Piso) {
            const floorMatch = clyt.DescripcionInmueble.Ubicacion.Piso.match(/(\d+)/);
            if (floorMatch) {
              updates.floor = parseInt(floorMatch[1]);
            }
          }
          
          // Extract property type
          if (clyt?.DescripcionInmueble?.Tipo) {
            const tipo = clyt.DescripcionInmueble.Tipo.toLowerCase();
            if (tipo.includes('apartamento')) updates.propertyType = 'apartment';
            else if (tipo.includes('casa')) updates.propertyType = 'house';
            else if (tipo.includes('oficina') || tipo.includes('oficinas')) updates.propertyType = 'office';
            else if (tipo.includes('comercial')) updates.propertyType = 'commercial';
          }
          
          // Also try legacy fields for compatibility
          if (data.extractedData.propertyAddress) updates.address = data.extractedData.propertyAddress;
          if (data.extractedData.propertyArea) updates.area = data.extractedData.propertyArea;
        }

        // Escrituras data
        if (docType === 'escritura' && data.extractedData) {
          if (data.extractedData.propertyAddress) updates.address = data.extractedData.propertyAddress;
          if (data.extractedData.propertyValue) updates.price = data.extractedData.propertyValue;
          if (data.extractedData.constructionArea) updates.area = data.extractedData.constructionArea;
          if (data.extractedData.stratum) updates.strata = data.extractedData.stratum;
        }

        // Cédula data (if needed for owner info)
        if (docType === 'cedula' && data.extractedData) {
          // Could be used for owner verification in the future
        }

        return { ...prev, ...updates };
      });

      toast.success(`Datos extraídos automáticamente del documento ${docType.toUpperCase()}`);
    }
  }, []);

  useEffect(() => {
    if (verificationStatus && verificationStatus !== 'verified') {
      toast.error('Debes verificar tu identidad antes de subir propiedades');
      onCancel();
    }
  }, [verificationStatus, onCancel]);

  // Generate negotiation conditions when entering step 5 if conditions not set
  useEffect(() => {
    if (currentStep === 5 && propertyData.price > 0 && propertyData.area > 0 && 
        !propertyData.paymentStages && propertyData.neighborhood) {
      console.log('🤖 Generating negotiation conditions for step 5...');
      
      const generateConditions = async () => {
        try {
          const conditions = await negotiationSuggestionService.generateConditions(
            {
              area: propertyData.area,
              neighborhood: propertyData.neighborhood,
              price: propertyData.price,
              propertyType: propertyData.propertyType
            },
            {
              liquidityTimeframe: 'normal',
              liquidityAmount: 30,
              riskTolerance: 'low'
            }
          );
          
          console.log('✅ Generated conditions:', conditions);
          
          setPropertyData(prev => ({
            ...prev,
            paymentStages: conditions.stages,
            stageTimeframes: conditions.timeframes
          }));
          
          toast.success('Condiciones de negociación generadas con IA');
        } catch (error) {
          console.error('❌ Error generating conditions:', error);
          // Set default conditions on error
          const defaults = negotiationSuggestionService.generateDefaultConditions(propertyData.price);
          setPropertyData(prev => ({
            ...prev,
            paymentStages: defaults.stages,
            stageTimeframes: defaults.timeframes
          }));
        }
      };
      
      generateConditions();
    }
  }, [currentStep, propertyData.price, propertyData.area, propertyData.neighborhood, propertyData.propertyType, propertyData.paymentStages]);

  if (!verificationStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Verificando identidad...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (verificationStatus !== 'verified') {
    return null; // Component will unmount due to onCancel call above
  }

  const progress = (currentStep / steps.length) * 100;

  const nextStep = async () => {
    if (currentStep < steps.length) {
      let currentDraftId = draftId;
      
      // Create draft property only when reaching step 7 (Visit Availability)
      // This is the first step that requires a propertyId in the database
      if (!currentDraftId && currentStep === 6) {
        try {
          toast.info('Creating draft property...');
          
          // Gather all collected data to create a complete draft
          const draftData = {
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
            price: propertyData.price || 100000,
            visit_price: propertyData.visitPrice || 49000,
            accepts_crypto: propertyData.acceptsCrypto || false,
            financing: propertyData.financing || false,
            status: 'draft'
          };
          
          console.log('Creating draft with data:', draftData);
          const result = await createDraftProperty(draftData);
          
          if (result?.id) {
            console.log('Draft created with ID:', result.id);
            setDraftId(result.id);
            currentDraftId = result.id;
            toast.success('Draft created successfully');
          } else {
            throw new Error('No ID returned from draft creation');
          }
        } catch (error: any) {
          console.error('Error creating draft:', error);
          toast.error(`Error al crear borrador: ${error.message}`);
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
              fieldsToUpdate.price = propertyData.price;
              fieldsToUpdate.visit_price = propertyData.visitPrice;
              fieldsToUpdate.commission = propertyData.commission;
              break;
            case 6:
              fieldsToUpdate.negotiation_terms = propertyData.negotiationRules;
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

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files);
    const validImages = newImages.filter(file =>
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validImages.length !== newImages.length) {
      toast.error('Solo se permiten imágenes de hasta 5MB');
        return;
      }

    if (propertyData.images.length + validImages.length > 20) {
      toast.error('Máximo 20 imágenes permitidas');
        return;
      }

    const uploadedImageUrls: string[] = [];

    // Upload images to Supabase Storage and collect URLs
    for (const image of validImages) {
      try {
        const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data, error } = await supabase.storage
          .from('property-photos')
          .upload(fileName, image);

        if (error) throw error;

        // Get public URL for the uploaded image
        const { data: publicUrl } = supabase.storage
          .from('property-photos')
          .getPublicUrl(fileName);

        uploadedImageUrls.push(publicUrl.publicUrl);
        console.log('Image uploaded:', publicUrl.publicUrl);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Error al subir ${image.name}`);
        return; // Stop if any upload fails
      }
    }

    // Update propertyData with both File objects (for preview) and URLs (for storage)
    setPropertyData(prev => ({
      ...prev,
      images: [...prev.images, ...validImages],
      uploadedImages: [...(prev.uploadedImages || []), ...uploadedImageUrls]
    }));
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

      toast.success(`${docType.toUpperCase()} subido exitosamente`);
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error(`Error al subir ${docType.toUpperCase()}`);
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
          onDocumentAnalyzed={handleDocumentAnalyzed}
        />
      );
      case 2: return (
        <Step1BasicInfo
          propertyData={propertyData}
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
        />
      );
      case 5: return (
        <Step5SellingConditions
          propertyData={propertyData}
          formatPrice={formatPrice}
          onPriceChange={handlePriceChange}
          onVisitPriceChange={handleVisitPriceChange}
          onCommissionChange={handleCommissionChange}
          onAcceptsCryptoChange={handleAcceptsCryptoChange}
          onFinancingChange={handleFinancingChange}
          onPaymentStagesChange={handlePaymentStagesChange}
          onTimeframesChange={handleTimeframesChange}
        />
      );
      case 6: return (
        <Step6NegotiationRules
          negotiationRules={propertyData.negotiationRules}
          onMinPriceChange={handleMinPriceChange}
          onMaxClosingDaysChange={handleMaxClosingDaysChange}
          onPaymentMethodToggle={handlePaymentMethodToggle}
          onAutoRejectToggle={handleAutoRejectToggle}
          onManualReviewToggle={handleManualReviewToggle}
        />
      );
      case 7: return draftId ? (
        <VisitAvailabilityConfig
          propertyId={draftId}
          onComplete={() => {
            // Mark visit availability as configured
            setPropertyData(prev => ({ ...prev, visitAvailabilityConfigured: true }));
            setCurrentStep(8);
          }}
        />
      ) : (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating draft property...</p>
        </div>
      );
      case 8: return (
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
          onDocumentAnalyzed={handleDocumentAnalyzed}
        />
      );
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return uploadedDocs.clyt; // CLYT requerido en el primer paso
      case 2:
        return propertyData.title && propertyData.description && propertyData.address && propertyData.neighborhood;
      case 3:
        return propertyData.bedrooms > 0 && propertyData.bathrooms > 0 && propertyData.area > 0 && propertyData.propertyType;
      case 4:
        return propertyData.images.length >= 1 && propertyData.images.length <= 20;
      case 5:
        return propertyData.price > 0;
      case 6:
        return true; // Las reglas de negociación son opcionales - draft will be created on nextStep
      case 7:
        return true; // Visit availability - draft is created when entering this step
      case 8:
        return propertyData.termsAccepted && propertyData.privacyAccepted;
      default:
        return false;
    }
  };

  const requireEligibility = (): boolean => {
    const emailVerified = Boolean((user as any)?.email_confirmed_at);
    if (!emailVerified) {
      toast.error('Debes verificar tu email antes de enviar la publicación');
      return false;
    }
    if (verificationStatus !== 'verified') {
      toast.error('Tu identidad debe estar verificada para enviar a aprobación');
      return false;
    }
    return true;
  };

  const saveDraft = async () => {
    try {
      if (!user) return;
      const draftData = {
        ...propertyData,
        currentStep,
        uploadedDocs,
        primaryImageIndex
      };
      await createDraftProperty(draftData);
      toast.success('Borrador guardado exitosamente');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Error al guardar el borrador');
    }
  };

  const submitForApproval = async () => {
    if (!requireEligibility() || !draftId || !user) return;

    setSubmitting(true);
    try {
      // Save to property_verifications table
      const { error: verificationError } = await supabase
        .from('property_verifications')
        .insert({
          property_id: draftId,
          user_id: user.id,
          status: 'pending',
          submitted_data: {
            property: propertyData,
            uploadedDocs,
            primaryImageIndex
          },
          visit_availability_configured: true
        });

      if (verificationError) throw verificationError;

      // Update property status to pending
      await submitForReview({ propertyId: draftId });

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting for review:', error);
      toast.error('Error al enviar a revisión');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Publicar Propiedad</h1>
            <p className="text-muted-foreground">
              Paso {currentStep} de {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
        
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 lg:px-6">
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
          Anterior
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

          {currentStep === steps.length ? (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={saveDraft} disabled={submitting}>Guardar Borrador</Button>
            <Button onClick={submitForApproval} disabled={!canProceed() || submitting} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Enviar a Revisión
            </Button>
          </div>
        ) : (
          <Button
              onClick={nextStep}
              disabled={!canProceed()}
          >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onComplete();
        }}
        title="¡Propiedad Enviada Exitosamente!"
        message="Tu propiedad ha sido enviada para revisión. Puedes seguir el proceso desde tu dashboard."
        redirectTo="/dashboard"
        redirectLabel="Ver mi Dashboard"
      />
    </div>
  );
};