import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { getPropertyImages } from '../utils/imageUtils';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car,
  Shield,
  Star,
  Calendar,
  DollarSign,
  Users,
  Home,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Camera,
  Play
} from 'lucide-react';

interface PropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}

const mockProperty = {
  id: '1',
  title: 'Apartamento Moderno en El Poblado',
  price: 450000000,
  area: 85,
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  location: 'El Poblado, Medellín',
  address: 'Carrera 43A #15-25, El Poblado',
  description: 'Hermoso apartamento moderno ubicado en el corazón de El Poblado, con excelente conectividad y cerca a centros comerciales, restaurantes y zonas verdes. Ideal para familias jóvenes o profesionales.',
  images: getPropertyImages(6, 800, 600),
  verified: true,
  premium: true,
  monthlyCosts: 1200000,
  tags: ['Nuevo', 'Vista panorámica', 'Gym', 'Piscina', 'Seguridad 24/7'],
  features: [
    'Cocina integral con electrodomésticos',
    'Balcón con vista panorámica',
    'Closets empotrados',
    'Piso en porcelanato',
    'Aire acondicionado',
    'Internet fibra óptica'
  ],
  coordinates: { lat: 6.2088, lng: -75.5654 },
  owner: {
    name: 'María González',
    phone: '+57 300 123 4567',
    verified: true,
    rating: 4.8,
    propertiesCount: 12
  },
  availability: {
    visits: ['2024-01-15', '2024-01-16', '2024-01-17'],
    visitPrice: 49000
  }
};

export const PropertyDetailView: React.FC<PropertyDetailProps> = ({ propertyId, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === mockProperty.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? mockProperty.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{mockProperty.title}</h1>
              <p className="text-muted-foreground">{mockProperty.address}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={mockProperty.images[currentImageIndex]}
                  alt={mockProperty.title}
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                
                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {mockProperty.images.length}
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  {mockProperty.verified && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  {mockProperty.premium && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {mockProperty.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Details */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Detalles de la Propiedad</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Habitaciones</p>
                  <p className="font-semibold">{mockProperty.bedrooms}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Baños</p>
                  <p className="font-semibold">{mockProperty.bathrooms}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Área</p>
                  <p className="font-semibold">{mockProperty.area}m²</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Parqueadero</p>
                  <p className="font-semibold">{mockProperty.parking}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{mockProperty.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Características</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockProperty.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockProperty.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-primary mb-2">
                  {formatPrice(mockProperty.price)}
                </h2>
                <p className="text-muted-foreground">
                  Costos mensuales: {formatPrice(mockProperty.monthlyCosts)}
                </p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Visita
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar Vendedor
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Hacer Oferta
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Costo de visita: {formatPrice(mockProperty.availability.visitPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Incluye NDA y documentación legal
                </p>
              </div>
            </Card>

            {/* Owner Card */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{mockProperty.owner.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{mockProperty.owner.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Propiedades:</span>
                  <span>{mockProperty.owner.propertiesCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span>{mockProperty.owner.phone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Mensaje
                </Button>
              </div>
            </Card>

            {/* Map Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Ubicación
              </h3>
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Mapa interactivo</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {mockProperty.address}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};