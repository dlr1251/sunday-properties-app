import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';
import { formatArea, formatCurrency, getListingPriceValue } from '../../utils/format';
import { applyPropertyKeyFilter, propertyEditPath, propertyKeyRedirectPath, propertyPath } from '../../utils/propertyPath';
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
  ShareModal,
  NeighborhoodSection,
  SimilarProperties,
} from './detail';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { MapFallback } from '../maps/PropertyMap';
import { useFavorites } from '../../hooks/useFavorites';
import { publicLocationLabel, sanitizePublicDescription } from '../../utils/publicLocation';
import {
  PUBLIC_PROPERTY_SELECT,
  fetchPrivatePropertyByKey,
  mapPublicProperty,
  publicMapCoordinates,
} from '../../lib/propertyPrivacy';
import { 
  Heart, 
  Share2, 
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
  Camera,
  Play,
  Loader2,
  AlertCircle,
  Maximize2,
  AlertTriangle,
  Edit,
  Eye
} from 'lucide-react';

/** Minimal visit row for "my visits to this property" list */
interface PropertyVisitSummary {
  id: string;
  scheduled_date: string;
  scheduled_time?: string;
  status: string;
}

interface PropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}


export const PropertyDetailView: React.FC<PropertyDetailProps> = ({ propertyId, onBack }) => {
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
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
  const [propertyVisits, setPropertyVisits] = useState<PropertyVisitSummary[]>([]);
  
  const resolvedId: string = property?.id || '';
  const isFavorite = resolvedId ? isFavorited(resolvedId) : false;
  const isOwner = Boolean(property?._canManage);

  // Fetch property data
  useEffect(() => {
    const redirectTo = propertyKeyRedirectPath(propertyId);
    if (redirectTo) {
      navigate(`${redirectTo}${window.location.search}`, { replace: true });
      return;
    }
    fetchPropertyData();
  }, [propertyId, user]);

  useEffect(() => {
    if (user && resolvedId) {
      checkIfVisited();
    }
  }, [resolvedId, user]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select(PUBLIC_PROPERTY_SELECT);
      query = applyPropertyKeyFilter(query, propertyId);

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      let canManage = false;
      if (user) {
        const privateRow = await fetchPrivatePropertyByKey(propertyId);
        canManage = Boolean(privateRow.data);
      }

      const listing = data ?? null;
      if (!listing) {
        toast.error(t('properties.detail.notFound'));
        onBack();
        return;
      }

      if (listing.status !== 'published' && !canManage) {
        toast.error(t('properties.detail.notAvailable'));
        onBack();
        return;
      }

      const publicListing = { ...mapPublicProperty(listing), _canManage: canManage };
      setProperty(publicListing);
      const location = publicLocationLabel(publicListing);
      document.title = location
        ? `${publicListing.title} · ${location} · Sunday Properties`
        : `${publicListing.title} · Sunday Properties`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && publicListing.description) {
        const publicDescription = sanitizePublicDescription(
          String(publicListing.description)
        );
        meta.setAttribute('content', publicDescription.slice(0, 160));
      }

      if (publicListing.slug && propertyId !== publicListing.slug) {
        const path = window.location.pathname;
        if (path === `/properties/${propertyId}`) {
          navigate(propertyPath(publicListing), { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Error fetching property:', error);
      toast.error(t('properties.detail.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const checkIfVisited = async () => {
    if (!user || !resolvedId) return;
    
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('id, scheduled_date, scheduled_time, status')
        .eq('property_id', resolvedId)
        .eq('visitor_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      const visits = (data || []) as PropertyVisitSummary[];
      setPropertyVisits(visits);
      setHasVisited(visits.some((v) => v.status === 'completed'));
    } catch (error) {
      console.error('Error checking visit status:', error);
    }
  };

  const visitStatusLabel = (status: string) =>
    t(`properties.detail.visitStatuses.${status}`, { defaultValue: status });

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
          <p className="text-muted-foreground">{t('properties.detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t('properties.detail.notFound')}</p>
          <Button onClick={onBack} className="mt-4">{t('common.back')}</Button>
        </div>
      </div>
    );
  }

  const displayProperty = property;
  const images = property?.images && property.images.length > 0 ? property.images : [];
  const isRentalListing = displayProperty?.listing_type === 'rental';
  const mainPrice: number = Number(isRentalListing ? displayProperty?.rent_monthly : displayProperty?.price) || 0;
  const mainPriceLabel = isRentalListing
    ? t('properties.detail.pricePerMonth', { amount: formatCurrency(mainPrice) })
    : formatCurrency(mainPrice);
  const locationLabel = publicLocationLabel(displayProperty);
  const publicDescription = sanitizePublicDescription(displayProperty.description);
  const publicFeatures = (displayProperty.features || []).map((feature: string) =>
    sanitizePublicDescription(feature)
  ).filter(Boolean);
  const publicTags = (displayProperty.tags || []).map((tag: string) =>
    sanitizePublicDescription(tag)
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-16 z-30 border-b border-border bg-background/95 px-4 py-3 lg:px-6 backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-1 -ml-2 text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground break-words">
              {displayProperty.title}
            </h1>
            {locationLabel && (
              <p className="text-sm text-muted-foreground">{locationLabel}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!user) {
                  toast.error(t('properties.detail.mustLoginFavorites'));
                  return;
                }
                if (isFavorite) {
                  await removeFromFavorites(resolvedId);
                } else {
                  await addToFavorites(resolvedId);
                }
              }}
            >
              <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-brand-gold text-brand-gold' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const shareUrl = window.location.href;
                const shareTitle = t('properties.detail.share.lookAt', { title: displayProperty.title });
                if (typeof navigator !== 'undefined' && navigator.share) {
                  try {
                    await navigator.share({ title: shareTitle, text: shareTitle, url: shareUrl });
                    return;
                  } catch {
                    // cancelled or unsupported payload — fall back to the icon sheet
                  }
                }
                setShowShareModal(true);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-6 min-w-0">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 1. Image Gallery - top on single column, top-left on xl */}
          <div className="order-1 xl:col-span-2 space-y-6 min-w-0">
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
                    <Badge variant="verified">
                      <Shield className="h-3 w-3 mr-1" />
                      {t('properties.verified')}
                    </Badge>
                  )}
                    {displayProperty.premium && (
                    <Badge variant="premium">
                      <Star className="h-3 w-3 mr-1" />
                      {t('properties.premium')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
                <div className="p-4 bg-muted/50">
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
                        alt={t('properties.detail.viewAlt', { n: index + 1 })}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>
            </motion.div>
          </div>

          {/* 2. Sidebar - price & actions (below image on mobile, right on xl) */}
          <div className="order-2 xl:col-start-3 xl:row-start-1 xl:row-span-3 space-y-6 min-w-0 w-full max-w-full xl:max-w-none">
            <Card className="p-4 sm:p-5 overflow-hidden">
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-primary truncate">
                  {mainPriceLabel}
                </h2>
                <span className="text-sm text-muted-foreground shrink-0">
                  {displayProperty.monthly_costs
                    ? t('properties.detail.monthlyCosts', { amount: formatCurrency(displayProperty.monthly_costs) })
                    : t('properties.detail.na')}
                </span>
              </div>

              <div className="space-y-2">
                {isOwner ? (
                  <>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        // Navigate to properties page or show full details
                        window.location.href = propertyPath(property);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('properties.detail.viewFullDetails')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => navigate(propertyEditPath(property))}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('properties.detail.editProperty')}
                    </Button>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {t('properties.detail.ownerAlert')}
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  // Non-owner actions: Schedule visit, contact, make offer
                  <>
                    {hasVisited && (
                      <Alert className="mb-2 border-success/30 bg-success/10">
                        <Eye className="h-4 w-4 text-success" />
                        <AlertDescription className="text-xs text-success">
                          {t('properties.detail.alreadyVisited')}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      className="w-full min-w-0" 
                      size="sm"
                      onClick={() => setShowVisitModal(true)}
                      disabled={!user || property.status !== 'published' || (profile && profile.verification_status !== 'verified')}
                    >
                      <Calendar className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{hasVisited ? t('properties.detail.scheduleAnotherVisit') : t('visits.schedule')}</span>
                    </Button>
                    {hasVisited && user && (
                      <Button 
                        variant="outline" 
                        className="w-full h-10 sm:h-11 text-sm sm:text-base" 
                        size="lg"
                        onClick={() => navigate('/dashboard?tab=visits')}
                      >
                        <Eye className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">{t('properties.detail.viewMyVisits')}</span>
                      </Button>
                    )}
                    {user && propertyVisits.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">{t('properties.detail.yourVisits')}</p>
                        <ul className="space-y-1.5">
                          {propertyVisits.map((v) => (
                            <li key={v.id}>
                              <button
                                type="button"
                                onClick={() => navigate('/dashboard?tab=visits')}
                                className="text-left w-full text-sm text-primary hover:underline flex items-center justify-between gap-2"
                              >
                                <span>
                                  {v.scheduled_date
                                    ? format(new Date(v.scheduled_date), "d MMM y", { locale: dateLocale })
                                    : '—'}
                                  {v.scheduled_time && ` · ${v.scheduled_time}`}
                                </span>
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {visitStatusLabel(v.status)}
                                </Badge>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {user && profile && profile.verification_status !== 'verified' && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {t('properties.detail.mustVerifyToSchedule')}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        if (!user) {
                          toast.error(t('properties.detail.mustLoginToOffer'));
                          return;
                        }
                        if (!hasVisited) {
                          toast.error(t('properties.detail.mustVisitToOffer'));
                          return;
                        }
                        if (property.status !== 'published') {
                          toast.error(t('properties.detail.propertyNotAvailableForOffers'));
                          return;
                        }
                        setShowOfferForm(true);
                      }}
                      disabled={!user || !hasVisited || property.status !== 'published'}
                    >
                      <DollarSign className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{t('properties.makeOffer')}</span>
                    </Button>
                    {!hasVisited && user && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {t('properties.detail.mustVisitBeforeOffer')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>

              <Separator className="my-3" />

              <div className="text-center text-xs text-muted-foreground">
                {typeof displayProperty.visit_price === 'number' && (
                  <p>{t('properties.detail.visitFee', { amount: formatCurrency(displayProperty.visit_price) })}</p>
                )}
                <p>{t('properties.detail.includesNda')}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{t('properties.detail.contact.owner')}</p>
              </div>
            </Card>

            {/* Smart Offer Form */}
            {showOfferForm && (
              <Card className="p-6">
                <SmartOfferForm
                  isOpen={showOfferForm}
                  onOpenChange={setShowOfferForm}
                  propertyId={resolvedId}
                  propertyPrice={mainPrice}
                  transactionType={isRentalListing ? 'rental' : 'sale'}
                  negotiationRules={displayProperty.negotiation_rules || {}}
                  onSubmit={(offer) => {
                    console.log('Offer submitted:', offer);
                    toast.success(t('properties.detail.offerSent'));
                    setShowOfferForm(false);
                  }}
                  onCancel={() => setShowOfferForm(false)}
                />
              </Card>
            )}
          </div>

          <div className="order-3 xl:col-span-2 space-y-6 min-w-0">
            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">{t('properties.detail.propertyDetails')}</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">{t('properties.bedrooms')}</p>
                    <p className="font-semibold">{displayProperty.bedrooms}</p>
                </div>
                  <div className="text-center p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">{t('properties.bathrooms')}</p>
                    <p className="font-semibold">{displayProperty.bathrooms}</p>
                </div>
                  <div className="text-center p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
                  <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">{t('properties.area')}</p>
                    <p className="font-semibold">{formatArea(displayProperty.area)}</p>
                </div>
                  <div className="text-center p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
                  <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">{t('properties.parking')}</p>
                    <p className="font-semibold">{displayProperty.parking}</p>
                  </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('properties.detail.description')}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{publicDescription}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('properties.detail.characteristics')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {publicFeatures.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('properties.detail.tags')}</h3>
                  <div className="flex flex-wrap gap-2">
                      {publicTags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ErrorBoundary fallback={<MapFallback message="No pudimos cargar el mapa del barrio." />}>
                <NeighborhoodSection
                  title={displayProperty.title}
                  neighborhood={displayProperty.neighborhood}
                  city={displayProperty.city}
                  coordinates={publicMapCoordinates(property || {})}
                  nearbyPlaces={property?.nearby_places}
                />
              </ErrorBoundary>
            </motion.div>

            {/* Similar Properties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <SimilarProperties
                currentPropertyId={resolvedId}
                neighborhood={displayProperty.neighborhood || ''}
                city={displayProperty.city || ''}
                priceRange={(() => {
                  const listingPrice = getListingPriceValue(displayProperty);
                  return listingPrice != null
                    ? { min: listingPrice * 0.7, max: listingPrice * 1.3 }
                    : undefined;
                })()}
                onPropertyClick={(id) => {
                  window.location.href = `/properties/${id}`;
                }}
              />
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
        propertyId={resolvedId}
        onVisitScheduled={() => {
          checkIfVisited();
        }}
      />

      <SmartOfferForm
        isOpen={showOfferForm}
        onOpenChange={setShowOfferForm}
        propertyId={resolvedId}
        propertyPrice={mainPrice}
        transactionType={isRentalListing ? 'rental' : 'sale'}
        negotiationRules={displayProperty.negotiation_rules || {}}
        onSubmit={(offer) => {
          console.log('Offer submitted:', offer);
          toast.success(t('properties.detail.offerSent'));
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
        propertyId={property.slug || resolvedId}
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
            toast.success(t('properties.detail.updatedSuccess'));
          }}
        />
      )}
    </div>
  );
};