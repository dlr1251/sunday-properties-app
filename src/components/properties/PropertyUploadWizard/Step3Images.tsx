import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Trash2, Play } from 'lucide-react';

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
}) => {
  console.log('📸 Step3Images rendering with data:', propertyData);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Fotografías de la Propiedad</h3>

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
          <h4 className="text-lg font-semibold mb-2">Subir Imágenes</h4>
          <p className="text-muted-foreground mb-4">
            Arrastra y suelta las imágenes aquí o haz clic para seleccionar
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
              Seleccionar Imágenes
            </label>
          </Button>
        </div>

        {/* Image Preview */}
        {propertyData.images.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">Imágenes Subidas ({propertyData.images.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {propertyData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute left-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => onMoveImage(index, 'left')}>←</Button>
                    <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => onMoveImage(index, 'right')}>→</Button>
                  </div>
                  <div className="absolute left-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant={primaryImageIndex === index ? 'default' : 'secondary'} onClick={() => onSetPrimaryImage(index)}>
                      {primaryImageIndex === index ? 'Principal' : 'Hacer principal'}
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
            <p className="text-xs text-muted-foreground mt-2">Mínimo 1 y máximo 20 fotos. Máximo 5MB por foto.</p>
          </div>
        )}

        {/* Virtual Tour */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Tour Virtual (Opcional)</h3>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Play className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">
              Sube un video o enlace de tour virtual 360°
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Subir Tour Virtual
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
