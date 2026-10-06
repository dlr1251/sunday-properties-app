import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Trash2, Play, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

interface Step3ImagesProps {
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
  onLoadSampleImage?: () => Promise<void>;
}

export const Step3Images: React.FC<Step3ImagesProps> = ({
  propertyData,
  dragActive,
  primaryImageIndex,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onImageUpload,
  onMoveImage,
  onSetPrimaryImage,
  onRemoveImage,
  onLoadSampleImage,
}) => {
  const { t } = useTranslation();
  const [loadingSample, setLoadingSample] = useState(false);

  const handleLoadSample = useCallback(async () => {
    if (!onLoadSampleImage) return;
    setLoadingSample(true);
    try {
      await onLoadSampleImage();
      toast.success(t('properties.wizard.images.sampleLoaded'));
    } catch (err: any) {
      toast.error(err.message || t('properties.wizard.images.sampleError'));
    } finally {
      setLoadingSample(false);
    }
  }, [onLoadSampleImage, t]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('properties.wizard.images.title')}</h3>
          {onLoadSampleImage && (
            <Button type="button" variant="outline" size="sm" onClick={handleLoadSample} disabled={loadingSample || propertyData.images.length > 0} className="text-xs">
              {loadingSample ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
              {t('properties.wizard.images.useSample')}
            </Button>
          )}
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">{t('properties.wizard.images.uploadTitle')}</h4>
          <p className="text-muted-foreground mb-4">
            {t('properties.wizard.images.uploadHint')}
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onImageUpload(e.target.files)}
            className="hidden"
            id="image-upload"
          />
          <Button asChild>
            <label htmlFor="image-upload" className="cursor-pointer">
              <Camera className="h-4 w-4 mr-2" />
              {t('properties.wizard.images.selectImages')}
            </label>
          </Button>
        </div>

        {/* Image Preview */}
        {propertyData.images.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">{t('properties.wizard.images.uploadedCount', { count: propertyData.images.length })}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {propertyData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={t('properties.wizard.images.previewAlt', { n: index + 1 })}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute left-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => onMoveImage(index, 'left')}>←</Button>
                    <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => onMoveImage(index, 'right')}>→</Button>
                  </div>
                  <div className="absolute left-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant={primaryImageIndex === index ? 'default' : 'secondary'} onClick={() => onSetPrimaryImage(index)}>
                      {primaryImageIndex === index ? t('properties.wizard.images.primary') : t('properties.wizard.images.makePrimary')}
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('properties.wizard.images.limits')}</p>
          </div>
        )}

        {/* Virtual Tour */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">{t('properties.wizard.images.virtualTour')}</h3>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Play className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">
              {t('properties.wizard.images.virtualTourHint')}
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              {t('properties.wizard.images.uploadVirtualTour')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
