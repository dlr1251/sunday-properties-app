import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisitAvailabilityConfig } from './VisitAvailabilityConfig';
import {
  Edit,
  Save,
  X,
  Clock,
  MapPin,
  DollarSign,
  Home,
  Car,
  Bath,
  Bed,
  Ruler,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';

interface OfferedTimeline {
  deedSigningDate?: string;
  propertyDeliveryDate?: string;
  paymentReceptionDate?: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  property_type: string;
  listing_type: 'sale' | 'rental';
  price: number | null;
  rent_monthly?: number | null;
  lease_term_months?: number | null;
  deposit?: number | null;
  admin_fee?: number | null;
  utilities_included?: string[] | null;
  pets_policy?: string | null;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  strata?: number;
  features: string[];
  images: string[];
  status: string;
  owner_id: string;
  negotiation_terms?: {
    offeredTimeline?: OfferedTimeline;
    [key: string]: unknown;
  } | null;
}

interface PropertyEditPanelProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyUpdated?: (property: Property) => void;
}

export const PropertyEditPanel: React.FC<PropertyEditPanelProps> = ({
  property,
  open,
  onOpenChange,
  onPropertyUpdated
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Form state
  const [formData, setFormData] = useState<Property>(property);

  useEffect(() => {
    if (property) {
      setFormData(property);
    }
  }, [property]);

  // Check if user owns this property
  if (!user || user.id !== property.owner_id) {
    return null;
  }

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }));
  };

  const offeredTimeline = formData.negotiation_terms?.offeredTimeline ?? {};
  const setOfferedTimeline = (field: keyof OfferedTimeline, value: string) => {
    setFormData(prev => ({
      ...prev,
      negotiation_terms: {
        ...(prev.negotiation_terms ?? {}),
        offeredTimeline: { ...(prev.negotiation_terms?.offeredTimeline ?? {}), [field]: value || undefined }
      }
    }));
  };

  const handleSaveProperty = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          address: formData.address,
          neighborhood: formData.neighborhood,
          city: formData.city,
          property_type: formData.property_type,
          listing_type: formData.listing_type,
          price: formData.listing_type === 'sale' ? formData.price : null,
          rent_monthly: formData.listing_type === 'rental' ? (formData.rent_monthly ?? null) : null,
          lease_term_months: formData.listing_type === 'rental' ? (formData.lease_term_months ?? null) : null,
          deposit: formData.listing_type === 'rental' ? (formData.deposit ?? null) : null,
          admin_fee: formData.listing_type === 'rental' ? (formData.admin_fee ?? null) : null,
          utilities_included: formData.listing_type === 'rental' ? (formData.utilities_included ?? []) : [],
          pets_policy: formData.listing_type === 'rental' ? (formData.pets_policy ?? null) : null,
          area: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          parking: formData.parking,
          floor: formData.floor,
          total_floors: formData.total_floors,
          year_built: formData.year_built,
          strata: formData.strata,
          features: formData.features,
          negotiation_terms: formData.negotiation_terms ?? undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id)
        .eq('owner_id', user.id) // Extra security check
        .select()
        .single();

      if (error) throw error;

      toast.success(t('properties.edit.saveSuccess'));
      onPropertyUpdated?.(data);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error.message || t('properties.edit.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const availableFeatures = [
    'pool', 'gym', 'security', 'elevator', 'garden', 'terrace',
    'parking', 'storage', 'laundry', 'internet', 'furnished'
  ];

  const propertyTypes = [
    { value: 'apartment', label: t('properties.types.apartment') },
    { value: 'house', label: t('properties.types.house') },
    { value: 'townhouse', label: t('properties.types.townhouse') },
    { value: 'office', label: t('properties.types.office') },
    { value: 'commercial', label: t('properties.types.commercial') }
  ];

  const transactionTypes = [
    { value: 'sale', label: t('properties.listingTypes.sale') },
    { value: 'rental', label: t('properties.listingTypes.rental') }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-y-auto lg:max-w-7xl xl:max-w-[90vw]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl lg:text-2xl">
            <Edit className="h-5 w-5 lg:h-6 lg:w-6" />
            {t('properties.edit.title')}
          </DialogTitle>
          <DialogDescription className="text-sm lg:text-base">
            {t('properties.edit.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 lg:h-14">
            <TabsTrigger value="details" className="flex items-center gap-2 text-sm lg:text-base">
              <Home className="h-4 w-4 lg:h-5 lg:w-5" />
              {t('properties.edit.tabDetails')}
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2 text-sm lg:text-base">
              <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
              {t('properties.edit.tabAvailability')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Basic Information */}
              <Card className="lg:col-span-2 xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl">{t('properties.edit.basicInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm lg:text-base">{t('properties.edit.titleLabel')}</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={t('properties.edit.titlePlaceholder')}
                      className="h-10 lg:h-12 text-sm lg:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property_type" className="text-sm lg:text-base">{t('properties.edit.propertyType')}</Label>
                      <select
                        id="property_type"
                        className="w-full border rounded-md p-2 lg:p-3 h-10 lg:h-12 text-sm lg:text-base bg-background"
                        value={formData.property_type}
                        onChange={(e) => handleInputChange('property_type', e.target.value)}
                      >
                        {propertyTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listing_type" className="text-sm lg:text-base">{t('properties.edit.listingType')}</Label>
                      <select
                        id="listing_type"
                        className="w-full border rounded-md p-2 lg:p-3 h-10 lg:h-12 text-sm lg:text-base bg-background"
                        value={formData.listing_type}
                        onChange={(e) => handleInputChange('listing_type', e.target.value)}
                      >
                        {transactionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm lg:text-base">{t('properties.edit.description')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={t('properties.edit.descriptionPlaceholder')}
                      rows={4}
                      className="text-sm lg:text-base min-h-[100px] lg:min-h-[120px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="lg:col-span-2 xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
                    <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                    {t('properties.edit.location')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm lg:text-base">{t('properties.edit.address')}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder={t('properties.edit.addressPlaceholder')}
                      className="h-10 lg:h-12 text-sm lg:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood" className="text-sm lg:text-base">{t('properties.edit.neighborhood')}</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        placeholder={t('properties.edit.neighborhoodPlaceholder')}
                        className="h-10 lg:h-12 text-sm lg:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm lg:text-base">{t('properties.edit.city')}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder={t('properties.edit.cityPlaceholder')}
                        className="h-10 lg:h-12 text-sm lg:text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price and Area */}
              <Card className="xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
                    <DollarSign className="h-4 w-4 lg:h-5 lg:w-5" />
                    {t('properties.edit.priceAndArea')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm lg:text-base">
                        {formData.listing_type === 'rental' ? t('properties.edit.monthlyRentCop') : t('properties.edit.priceCop')}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={
                          formData.listing_type === 'rental'
                            ? (formData.rent_monthly ?? 0)
                            : (formData.price ?? 0)
                        }
                        onChange={(e) => {
                          const next = parseInt(e.target.value) || 0;
                          if (formData.listing_type === 'rental') {
                            handleInputChange('rent_monthly', next);
                          } else {
                            handleInputChange('price', next);
                          }
                        }}
                        placeholder={t('common.example', { value: formData.listing_type === 'rental' ? '3500000' : '300000000' })}
                        className="h-10 lg:h-12 text-sm lg:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-sm lg:text-base">{t('properties.edit.areaM2')}</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                        placeholder={t('common.example', { value: '80' })}
                        className="h-10 lg:h-12 text-sm lg:text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Condiciones */}
              <Card className="lg:col-span-2 xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                    {formData.listing_type === 'rental' ? t('properties.edit.rentalConditionsTitle') : t('properties.edit.negotiationTitle')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {formData.listing_type === 'rental'
                      ? t('properties.edit.rentalConditionsDescription')
                      : t('properties.edit.negotiationDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  {formData.listing_type === 'rental' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="lease_term_months" className="text-sm lg:text-base">{t('properties.edit.leaseTerm')}</Label>
                          <Input
                            id="lease_term_months"
                            type="number"
                            min="1"
                            value={formData.lease_term_months ?? ''}
                            onChange={(e) => handleInputChange('lease_term_months', parseInt(e.target.value) || null)}
                            className="h-10 lg:h-12 text-sm lg:text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deposit" className="text-sm lg:text-base">{t('properties.edit.deposit')}</Label>
                          <Input
                            id="deposit"
                            type="number"
                            min="0"
                            value={formData.deposit ?? ''}
                            onChange={(e) => handleInputChange('deposit', parseInt(e.target.value) || null)}
                            className="h-10 lg:h-12 text-sm lg:text-base"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin_fee" className="text-sm lg:text-base">{t('properties.edit.adminFee')}</Label>
                        <Input
                          id="admin_fee"
                          type="number"
                          min="0"
                          value={formData.admin_fee ?? ''}
                          onChange={(e) => handleInputChange('admin_fee', parseInt(e.target.value) || null)}
                          className="h-10 lg:h-12 text-sm lg:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pets_policy" className="text-sm lg:text-base">{t('properties.edit.petsPolicy')}</Label>
                        <Textarea
                          id="pets_policy"
                          value={formData.pets_policy ?? ''}
                          onChange={(e) => handleInputChange('pets_policy', e.target.value)}
                          rows={3}
                          className="text-sm lg:text-base resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm lg:text-base">{t('properties.edit.totalValue')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('properties.edit.totalValueHint')}
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrency(Number(formData.price ?? 0))}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deedSigningDate" className="text-sm lg:text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t('properties.edit.deedSigningDate')}
                        </Label>
                        <Input
                          id="deedSigningDate"
                          type="date"
                          value={offeredTimeline.deedSigningDate ?? ''}
                          onChange={(e) => setOfferedTimeline('deedSigningDate', e.target.value)}
                          className="h-10 lg:h-12 text-sm lg:text-base"
                        />
                        <p className="text-xs text-muted-foreground">{t('properties.edit.deedSigningHint')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="propertyDeliveryDate" className="text-sm lg:text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t('properties.edit.deliveryDate')}
                        </Label>
                        <Input
                          id="propertyDeliveryDate"
                          type="date"
                          value={offeredTimeline.propertyDeliveryDate ?? ''}
                          onChange={(e) => setOfferedTimeline('propertyDeliveryDate', e.target.value)}
                          className="h-10 lg:h-12 text-sm lg:text-base"
                        />
                        <p className="text-xs text-muted-foreground">{t('properties.edit.deliveryHint')}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card className="lg:col-span-2 xl:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl">{t('properties.edit.specifications')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms" className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        {t('properties.bedrooms')}
                      </Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms" className="flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        {t('properties.bathrooms')}
                      </Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parking" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {t('properties.parking')}
                      </Label>
                      <Input
                        id="parking"
                        type="number"
                        value={formData.parking}
                        onChange={(e) => handleInputChange('parking', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="strata">{t('properties.edit.strata')}</Label>
                      <select
                        id="strata"
                        className="w-full border rounded-md p-2"
                        value={formData.strata || ''}
                        onChange={(e) => handleInputChange('strata', parseInt(e.target.value) || undefined)}
                      >
                        <option value="">{t('properties.edit.select')}</option>
                        {[1, 2, 3, 4, 5, 6].map(strata => (
                          <option key={strata} value={strata}>
                            {t('properties.edit.strataOption', { n: strata })}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floor">{t('properties.edit.floor')}</Label>
                      <Input
                        id="floor"
                        type="number"
                        value={formData.floor || ''}
                        onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || undefined)}
                        min="0"
                        placeholder={t('common.optional')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="total_floors">{t('properties.edit.totalFloors')}</Label>
                      <Input
                        id="total_floors"
                        type="number"
                        value={formData.total_floors || ''}
                        onChange={(e) => handleInputChange('total_floors', parseInt(e.target.value) || undefined)}
                        min="1"
                        placeholder={t('common.optional')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl">{t('properties.edit.additionalFeatures')}</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  {t('properties.edit.featuresHint')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                  {availableFeatures.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={formData.features?.includes(feature) || false}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded"
                      />
                      <Label htmlFor={feature} className="capitalize">
                        {t(`properties.features.${feature}`, { defaultValue: feature })}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <VisitAvailabilityConfig
              propertyId={property.id}
              onComplete={() => {
                toast.success(t('properties.wizard.availability.updated'));
              }}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto h-11 lg:h-12 text-sm lg:text-base"
          >
            <X className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSaveProperty}
            disabled={loading}
            className="w-full sm:w-auto h-11 lg:h-12 text-sm lg:text-base"
          >
            <Save className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            {loading ? t('common.saving') : t('properties.edit.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
