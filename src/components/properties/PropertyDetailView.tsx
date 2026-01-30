import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SmartOfferForm } from '../negotiation/SmartOfferForm';
import { ScheduleVisitModal } from '../ScheduleVisitModal';
import { PropertyEditPanel } from './PropertyEditPanel';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  ImageLightbox,
  ContactPanel,
  ShareModal,
  NeighborhoodInsights,
  SimilarProperties,
} from './detail';
import { PropertyDetailMap } from '../maps/PropertyDetailMap';
import { useFavorites } from '../../hooks/useFavorites';
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
  Play,
  Loader2,
  AlertCircle,
  Maximize2,
  AlertTriangle,
  Edit,
  Eye
} from 'lucide-react';

interface PropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}


export const PropertyDetailView: React.FC<PropertyDetailProps> = ({ propertyId, onBack }) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites, isFavorited } = useFavorites();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  
  const isFavorite = isFavorited(propertyId);
  const isOwner = user?.id === property?.owner_id;

  // Fetch property data
  useEffect(() => {
    fetchPropertyData();
    if (user) {
      checkIfVisited();
    }
  }, [propertyId, user]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:owner_id (
            id,
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast.error('Propiedad no encontrada');
        onBack();
        return;
      }

      // Only show published properties to regular users
      if (data.status !== 'published' && user?.id !== data.owner_id) {
        toast.error('Esta propiedad no está disponible');
        onBack();
        return;
      }

      setProperty(data);
    } catch (error: any) {
      console.error('Error fetching property:', error);
      toast.error('Error al cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const checkIfVisited = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('id')
        .eq('property_id', propertyId)
        .eq('visitor_id', user.id)
        .eq('status', 'completed')
        .limit(1);

      if (error) throw error;
      setHasVisited(data && data.length > 0);
    } catch (error) {
      console.error('Error checking visit status:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    const total = (property?.images || []).length;
    if (total === 0) return;
    setCurrentImageIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    const total = (property?.images || []).length;
    if (total === 0) return;
    setCurrentImageIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Propiedad no encontrada</p>
          <Button onClick={onBack} className="mt-4">Volver</Button>
        </div>
      </div>
    );
  }

  const displayProperty = property;
  const images = property?.images && property.images.length > 0 ? property.images : [];
  const owner = property?.owner_id ? {
    id: property.owner_id,
    name: property.owner?.full_name || '',
    email: property.owner?.email || '',
    phone: property.owner?.phone || '',
    verified: property.verified || false,
    propertiesCount: 0
  } : { id: '', name: '', email: '', phone: '', verified: false, propertiesCount: 0 };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-border px-4 py-4 lg:px-6 sticky top-0 z-40 backdrop-blur-sm bg-white/95"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{displayProperty.title}</h1>
              <p className="text-muted-foreground">{displayProperty.address}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!user) {
                  toast.error('Debes iniciar sesión para agregar a favoritos');
                  return;
                }
                if (isFavorite) {
                  await removeFromFavorites(propertyId);
                } else {
                  await addToFavorites(propertyId);
                }
              }}
            >
              <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowShareModal(true)}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden group">
              <div className="relative">
                <img
                    src={images[currentImageIndex]}
                    alt={displayProperty.title}
                    className="w-full h-96 lg:h-[500px] object-cover cursor-pointer transition-transform duration-300"
                    onClick={() => setShowLightbox(true)}
                />
                
                {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                <Button
                  variant="ghost"
                  size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Fullscreen Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setShowLightbox(true); }}
                  >
                    <Maximize2 className="h-4 w-4" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {images.length}
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                    {displayProperty.verified && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                    {displayProperty.premium && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
                <div className="p-4 bg-gray-50">
                <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all hover:scale-105 ${
                          index === currentImageIndex ? 'border-primary scale-105' : 'border-transparent'
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
            </motion.div>

            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Detalles de la Propiedad</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Habitaciones</p>
                    <p className="font-semibold">{displayProperty.bedrooms}</p>
                </div>
                  <div className="text-center p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Baños</p>
                    <p className="font-semibold">{displayProperty.bathrooms}</p>
                </div>
                  <div className="text-center p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
                  <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Área</p>
                    <p className="font-semibold">{displayProperty.area}m²</p>
                </div>
                  <div className="text-center p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
                  <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Parqueadero</p>
                    <p className="font-semibold">{displayProperty.parking}</p>
                  </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                    <p className="text-muted-foreground">{displayProperty.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Características</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(displayProperty.features || []).map((feature: string, index: number) => (
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
                      {(displayProperty.tags || []).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            </motion.div>

            {/* Neighborhood Insights */}
            {displayProperty.neighborhood && displayProperty.city && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <NeighborhoodInsights
                  city={displayProperty.city}
                  neighborhood={displayProperty.neighborhood}
                  address={displayProperty.address}
                />
              </motion.div>
            )}

            {/* Property Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <PropertyDetailMap
                propertyId={propertyId}
                title={displayProperty.title}
                address={displayProperty.address}
                neighborhood={displayProperty.neighborhood}
                city={displayProperty.city}
                coordinates={property?.coordinates}
                image={images.length > 0 ? images[0] : undefined}
                height="400px"
                showHeader={true}
              />
            </motion.div>

            {/* Similar Properties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <SimilarProperties
                currentPropertyId={propertyId}
                neighborhood={displayProperty.neighborhood || ''}
                city={displayProperty.city || ''}
                priceRange={{ min: displayProperty.price * 0.7, max: displayProperty.price * 1.3 }}
                onPropertyClick={(id) => {
                  window.location.href = `/properties/${id}`;
                }}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-primary mb-2">
                  {formatPrice(displayProperty.price)}
                </h2>
                <p className="text-muted-foreground">
                  Costos mensuales: {displayProperty.monthly_costs ? formatPrice(displayProperty.monthly_costs) : 'N/D'}
                </p>
              </div>

              <div className="space-y-3">
                {isOwner ? (
                  // Owner actions: View and Edit
                  <>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        // Navigate to properties page or show full details
                        window.location.href = `/properties/${propertyId}`;
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles Completos
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate(`/properties/${propertyId}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Propiedad
                    </Button>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Esta es tu propiedad. Puedes editarla y gestionarla desde tu panel de propiedades.
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  // Non-owner actions: Schedule visit, contact, make offer
                  <>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setShowVisitModal(true)}
                      disabled={!user || property.status !== 'published' || (profile && profile.verification_status !== 'verified')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Visita
                    </Button>
                    {user && profile && profile.verification_status !== 'verified' && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Debes verificar tu cuenta para agendar visitas. Ve a Verificación de Perfil.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button variant="outline" className="w-full" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar Vendedor
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        if (!user) {
                          toast.error('Debes iniciar sesión para hacer una oferta');
                          return;
                        }
                        if (property.status !== 'published') {
                          toast.error('Esta propiedad no está disponible para ofertas');
                          return;
                        }
                        setShowOfferForm(true);
                      }}
                      disabled={!user || property.status !== 'published'}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Hacer Oferta
                    </Button>
                    {!hasVisited && user && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Recomendamos visitar la propiedad antes de hacer una oferta
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>

              <Separator className="my-4" />

              <div className="text-center">
                {typeof displayProperty.visit_price === 'number' && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Costo de visita: {formatPrice(displayProperty.visit_price)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Incluye NDA y documentación legal
                </p>
              </div>
            </Card>

            {/* Smart Offer Form */}
            {showOfferForm && (
              <Card className="p-6">
                <SmartOfferForm
                  isOpen={showOfferForm}
                  onOpenChange={setShowOfferForm}
                  propertyId={propertyId}
                  propertyPrice={displayProperty.price}
                  negotiationRules={displayProperty.negotiation_rules || {}}
                  onSubmit={(offer) => {
                    console.log('Offer submitted:', offer);
                    toast.success('Oferta enviada exitosamente');
                    setShowOfferForm(false);
                  }}
                  onCancel={() => setShowOfferForm(false)}
                />
              </Card>
            )}

            {/* Owner Card - Replaced with ContactPanel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ContactPanel
                owner={{
                  id: property?.owner_id || property?.owner?.id || '',
                  full_name: property?.owner?.full_name || displayProperty.owner?.name || 'Propietario',
                  email: property?.owner?.email || '',
                  phone: property?.owner?.phone || '',
                  avatar_url: property?.owner?.avatar_url,
                  verification_status: property?.verified ? 'verified' : 'pending',
                  properties_count: displayProperty.owner?.propertiesCount || 0,
                }}
                propertyId={propertyId}
                propertyTitle={displayProperty.title}
              />
            </motion.div>

            {/* Map Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Ubicación
              </h3>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Mapa interactivo</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                  {displayProperty.address}
              </p>
            </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScheduleVisitModal
        open={showVisitModal}
        onOpenChange={(open) => {
          setShowVisitModal(open);
          if (!open) checkIfVisited();
        }}
        propertyTitle={displayProperty.title}
        propertyId={propertyId}
        onVisitScheduled={() => {
          checkIfVisited();
        }}
      />

      <SmartOfferForm
        isOpen={showOfferForm}
        onOpenChange={setShowOfferForm}
        propertyId={propertyId}
        propertyPrice={displayProperty.price}
        negotiationRules={displayProperty.negotiation_rules || {}}
        onSubmit={(offer) => {
          console.log('Offer submitted:', offer);
          toast.success('Oferta enviada exitosamente');
          setShowOfferForm(false);
        }}
        onCancel={() => setShowOfferForm(false)}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        isOpen={showLightbox}
        initialIndex={currentImageIndex}
        onClose={() => setShowLightbox(false)}
        propertyTitle={displayProperty.title}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        propertyTitle={displayProperty.title}
        propertyId={propertyId}
      />

      {/* Edit Panel Modal */}
      {showEditPanel && property && (
        <PropertyEditPanel
          property={property}
          open={showEditPanel}
          onOpenChange={setShowEditPanel}
          onPropertyUpdated={(updatedProperty) => {
            setProperty(updatedProperty);
            setShowEditPanel(false);
            toast.success('Propiedad actualizada exitosamente');
          }}
        />
      )}
    </div>
  );
};