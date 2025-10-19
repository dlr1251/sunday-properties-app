import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  MapPin, 
  Home, 
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

interface UploadWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface PropertyData {
  // Paso 1: Básicos
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  coordinates: { lat: number; lng: number };
  
  // Paso 2: Características
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  floor: number;
  totalFloors: number;
  yearBuilt: number;
  
  // Paso 3: Fotos
  images: File[];
  virtualTour: File | null;
  
  // Paso 4: Legal
  freedomTradition: File | null;
  propertyType: string;
  strata: number;
  
  // Paso 5: Condiciones
  price: number;
  acceptsCrypto: boolean;
  financing: boolean;
  visitPrice: number;
  commission: number;
  
  // Paso 6: Review
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

const steps = [
  { id: 1, title: 'Información Básica', description: 'Nombre y ubicación' },
  { id: 2, title: 'Características', description: 'Detalles de la propiedad' },
  { id: 3, title: 'Fotografías', description: 'Imágenes y tour virtual' },
  { id: 4, title: 'Documentos Legales', description: 'Libertad y tradición' },
  { id: 5, title: 'Condiciones de Venta', description: 'Precio y términos' },
  { id: 6, title: 'Revisión Final', description: 'Confirmar y publicar' }
];

export const PropertyUploadWizard: React.FC<UploadWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
    virtualTour: null,
    freedomTradition: null,
    propertyType: '',
    strata: 0,
    price: 0,
    acceptsCrypto: false,
    financing: false,
    visitPrice: 49000,
    commission: 2.5,
    termsAccepted: false,
    privacyAccepted: false
  });

  const [dragActive, setDragActive] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files);
      setPropertyData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setPropertyData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const Step1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Título de la Propiedad *</Label>
              <Input
                id="title"
          placeholder="Ej: Apartamento moderno en El Poblado"
          value={propertyData.title}
          onChange={(e) => setPropertyData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

      <div>
        <Label htmlFor="description">Descripción *</Label>
        <Textarea
          id="description"
          placeholder="Describe las características principales de la propiedad..."
          rows={4}
          value={propertyData.description}
          onChange={(e) => setPropertyData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address">Dirección Completa *</Label>
              <Input
            id="address"
            placeholder="Carrera 43A #15-25"
            value={propertyData.address}
            onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="neighborhood">Barrio *</Label>
          <Select value={propertyData.neighborhood} onValueChange={(value) => setPropertyData(prev => ({ ...prev, neighborhood: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar barrio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="el-poblado">El Poblado</SelectItem>
              <SelectItem value="laureles">Laureles</SelectItem>
              <SelectItem value="envigado">Envigado</SelectItem>
              <SelectItem value="sabaneta">Sabaneta</SelectItem>
              <SelectItem value="bello">Bello</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ubicación en el Mapa</h3>
          <p className="text-muted-foreground mb-4">
            Haz clic en el mapa para seleccionar la ubicación exacta
          </p>
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Seleccionar Ubicación
          </Button>
        </div>
            </div>
          </div>
        );
      
  const Step2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="bedrooms">Habitaciones *</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            value={propertyData.bedrooms}
            onChange={(e) => setPropertyData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Baños *</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            value={propertyData.bathrooms}
            onChange={(e) => setPropertyData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="area">Área (m²) *</Label>
                <Input
                  id="area"
            type="number"
            min="0"
            value={propertyData.area}
            onChange={(e) => setPropertyData(prev => ({ ...prev, area: parseInt(e.target.value) || 0 }))}
                />
              </div>
        <div>
          <Label htmlFor="parking">Parqueaderos</Label>
                <Input
            id="parking"
            type="number"
            min="0"
            value={propertyData.parking}
            onChange={(e) => setPropertyData(prev => ({ ...prev, parking: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="floor">Piso</Label>
              <Input
            id="floor"
            type="number"
            min="0"
            value={propertyData.floor}
            onChange={(e) => setPropertyData(prev => ({ ...prev, floor: parseInt(e.target.value) || 0 }))}
              />
            </div>
        <div>
          <Label htmlFor="totalFloors">Total de Pisos</Label>
                <Input
            id="totalFloors"
                  type="number"
            min="0"
            value={propertyData.totalFloors}
            onChange={(e) => setPropertyData(prev => ({ ...prev, totalFloors: parseInt(e.target.value) || 0 }))}
                />
              </div>
        <div>
          <Label htmlFor="yearBuilt">Año de Construcción</Label>
                <Input
            id="yearBuilt"
                  type="number"
            min="1900"
            max="2024"
            value={propertyData.yearBuilt}
            onChange={(e) => setPropertyData(prev => ({ ...prev, yearBuilt: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="propertyType">Tipo de Propiedad *</Label>
          <Select value={propertyData.propertyType} onValueChange={(value) => setPropertyData(prev => ({ ...prev, propertyType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartamento</SelectItem>
              <SelectItem value="house">Casa</SelectItem>
              <SelectItem value="townhouse">Casa Campestre</SelectItem>
              <SelectItem value="office">Oficina</SelectItem>
              <SelectItem value="commercial">Local Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="strata">Estrato</Label>
          <Select value={propertyData.strata.toString()} onValueChange={(value) => setPropertyData(prev => ({ ...prev, strata: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Estrato 1</SelectItem>
              <SelectItem value="2">Estrato 2</SelectItem>
              <SelectItem value="3">Estrato 3</SelectItem>
              <SelectItem value="4">Estrato 4</SelectItem>
              <SelectItem value="5">Estrato 5</SelectItem>
              <SelectItem value="6">Estrato 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
          </div>
        );
      
  const Step3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Fotografías de la Propiedad</h3>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
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
            onChange={(e) => handleImageUpload(e.target.files)}
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
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
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

  const Step4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Documentos Legales</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="freedom-tradition">Libertad y Tradición *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">
                Sube el documento de libertad y tradición
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="freedom-tradition"
              />
              <Button asChild>
                <label htmlFor="freedom-tradition" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documento
                </label>
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Extracción Automática de Datos</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Nuestro sistema extraerá automáticamente la información legal del documento para acelerar el proceso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Step5 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="price">Precio de Venta *</Label>
        <Input
          id="price"
          type="number"
          min="0"
          placeholder="450000000"
          value={propertyData.price}
          onChange={(e) => setPropertyData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
        />
        {propertyData.price > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {formatPrice(propertyData.price)}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="visitPrice">Precio de Visita (COP)</Label>
        <Input
          id="visitPrice"
          type="number"
          min="0"
          value={propertyData.visitPrice}
          onChange={(e) => setPropertyData(prev => ({ ...prev, visitPrice: parseInt(e.target.value) || 0 }))}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Precio recomendado: $49,000 COP
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptsCrypto"
            checked={propertyData.acceptsCrypto}
            onCheckedChange={(checked) => setPropertyData(prev => ({ ...prev, acceptsCrypto: !!checked }))}
          />
          <Label htmlFor="acceptsCrypto">Acepta pagos en criptomonedas</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="financing"
            checked={propertyData.financing}
            onCheckedChange={(checked) => setPropertyData(prev => ({ ...prev, financing: !!checked }))}
          />
          <Label htmlFor="financing">Ofrece opciones de financiación</Label>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-2">Comisión de la Plataforma</h4>
        <p className="text-sm text-muted-foreground">
          Comisión del {propertyData.commission}% sobre el valor de venta
        </p>
        {propertyData.price > 0 && (
          <p className="text-lg font-semibold text-primary mt-2">
            {formatPrice(propertyData.price * (propertyData.commission / 100))}
          </p>
        )}
            </div>
          </div>
        );
      
  const Step6 = () => (
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
            onCheckedChange={(checked) => setPropertyData(prev => ({ ...prev, termsAccepted: !!checked }))}
          />
          <Label htmlFor="terms" className="text-sm">
            Acepto los términos y condiciones de uso de la plataforma
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={propertyData.privacyAccepted}
            onCheckedChange={(checked) => setPropertyData(prev => ({ ...prev, privacyAccepted: !!checked }))}
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
      
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      case 5: return <Step5 />;
      case 6: return <Step6 />;
      default: return <Step1 />;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return propertyData.title && propertyData.description && propertyData.address && propertyData.neighborhood;
      case 2:
        return propertyData.bedrooms > 0 && propertyData.bathrooms > 0 && propertyData.area > 0 && propertyData.propertyType;
      case 3:
        return propertyData.images.length > 0;
      case 4:
        return true; // Documentos opcionales por ahora
      case 5:
        return propertyData.price > 0;
      case 6:
        return propertyData.termsAccepted && propertyData.privacyAccepted;
      default:
        return false;
    }
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
          <Button
              onClick={onComplete}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700"
          >
              <Check className="h-4 w-4 mr-2" />
              Publicar Propiedad
          </Button>
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
    </div>
  );
};