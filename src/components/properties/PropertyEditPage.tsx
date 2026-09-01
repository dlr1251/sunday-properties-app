import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisitAvailabilityConfig } from './VisitAvailabilityConfig';
import { FormFieldHelper } from '@/components/ui/FormFieldHelper';
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
  CheckCircle,
  ArrowLeft,
  Loader2
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

export const PropertyEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [property, setProperty] = useState<Property | null>(null);

  // Form state
  const [formData, setFormData] = useState<Property | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error(t('properties.edit.notFound'));
        navigate('/properties');
        return;
      }

      // Check if user owns this property
      if (!user || user.id !== data.owner_id) {
        toast.error(t('properties.edit.noPermission'));
        navigate(`/properties/${propertyId}`);
        return;
      }

      setProperty(data);
      setFormData(data);
    } catch (error: any) {
      console.error('Error fetching property:', error);
      toast.error(t('properties.edit.loadError'));
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Property, value: any) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleFeatureToggle = (feature: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }) : null);
  };

  const offeredTimeline = formData?.negotiation_terms?.offeredTimeline ?? {};
  const setOfferedTimeline = (field: keyof OfferedTimeline, value: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      negotiation_terms: {
        ...(prev.negotiation_terms ?? {}),
        offeredTimeline: { ...(prev.negotiation_terms?.offeredTimeline ?? {}), [field]: value || undefined }
      }
    }) : null);
  };

  const handleSaveProperty = async () => {
    if (!formData || !propertyId) return;

    setSaving(true);
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
        .eq('id', propertyId)
        .eq('owner_id', user?.id) // Extra security check
        .select()
        .single();

      if (error) throw error;

      toast.success(t('properties.edit.saveSuccess'));
      navigate(`/properties/${propertyId}`);
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error.message || t('properties.edit.saveError'));
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!formData || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{t('properties.edit.notFound')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/properties/${propertyId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Edit className="h-7 w-7" />
              {t('properties.edit.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('properties.edit.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/properties/${propertyId}`)}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSaveProperty}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('common.saving') : t('properties.edit.saveChanges')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {t('properties.edit.tabDetails')}
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('properties.edit.tabAvailability')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card className="lg:col-span-2 xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t('properties.edit.basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title">{t('properties.edit.titleLabel')}</Label>
                    <FormFieldHelper
                      fieldId="title"
                      content={t('properties.edit.helpers.title')}
                    />
                  </div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('properties.edit.titlePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="property_type">{t('properties.edit.propertyType')}</Label>
                      <FormFieldHelper
                        fieldId="property_type"
                        content={t('properties.edit.helpers.propertyType')}
                      />
                    </div>
                    <select
                      id="property_type"
                      className="w-full border rounded-md p-2 bg-background"
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="listing_type">{t('properties.edit.listingType')}</Label>
                      <FormFieldHelper
                        fieldId="listing_type"
                        content={t('properties.edit.helpers.listingType')}
                      />
                    </div>
                    <select
                      id="listing_type"
                      className="w-full border rounded-md p-2 bg-background"
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
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description">{t('properties.edit.description')}</Label>
                    <FormFieldHelper
                      fieldId="description"
                      content={t('properties.edit.helpers.description')}
                    />
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('properties.edit.descriptionPlaceholder')}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="lg:col-span-2 xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('properties.edit.location')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="address">{t('properties.edit.address')}</Label>
                    <FormFieldHelper
                      fieldId="address"
                      content={t('properties.edit.helpers.address')}
                    />
                  </div>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder={t('properties.edit.addressPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="neighborhood">{t('properties.edit.neighborhood')}</Label>
                      <FormFieldHelper
                        fieldId="neighborhood"
                        content={t('properties.edit.helpers.neighborhood')}
                      />
                    </div>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      placeholder={t('properties.edit.neighborhoodPlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="city">{t('properties.edit.city')}</Label>
                      <FormFieldHelper
                        fieldId="city"
                        content={t('properties.edit.helpers.city')}
                      />
                    </div>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder={t('properties.edit.cityPlaceholder')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price and Area */}
            <Card className="xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('properties.edit.priceAndArea')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="price">{t('properties.edit.priceCop')}</Label>
                      <FormFieldHelper
                        fieldId="price"
                        content={t('properties.edit.helpers.price')}
                      />
                    </div>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                      placeholder={t('common.example', { value: '300000000' })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="area">{t('properties.edit.areaM2')}</Label>
                      <FormFieldHelper
                        fieldId="area"
                        content={t('properties.edit.helpers.area')}
                      />
                    </div>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                      placeholder={t('common.example', { value: '80' })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Condiciones mínimas de negociación */}
            <Card className="lg:col-span-2 xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t('properties.edit.negotiationTitle')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t('properties.edit.negotiationDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">{t('properties.edit.totalValue')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('properties.edit.totalValueHint')}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(Number(formData.price ?? 0))}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deedSigningDate" className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('properties.edit.deedSigningDate')}
                  </Label>
                  <Input
                    id="deedSigningDate"
                    type="date"
                    value={offeredTimeline.deedSigningDate ?? ''}
                    onChange={(e) => setOfferedTimeline('deedSigningDate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{t('properties.edit.deedSigningHint')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyDeliveryDate" className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('properties.edit.deliveryDate')}
                  </Label>
                  <Input
                    id="propertyDeliveryDate"
                    type="date"
                    value={offeredTimeline.propertyDeliveryDate ?? ''}
                    onChange={(e) => setOfferedTimeline('propertyDeliveryDate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{t('properties.edit.deliveryHint')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="lg:col-span-2 xl:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t('properties.edit.specifications')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bedrooms" className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        {t('properties.bedrooms')}
                      </Label>
                      <FormFieldHelper
                        fieldId="bedrooms"
                        content={t('properties.edit.helpers.bedrooms')}
                      />
                    </div>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bathrooms" className="flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        {t('properties.bathrooms')}
                      </Label>
                      <FormFieldHelper
                        fieldId="bathrooms"
                        content={t('properties.edit.helpers.bathrooms')}
                      />
                    </div>
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="parking" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {t('properties.parking')}
                      </Label>
                      <FormFieldHelper
                        fieldId="parking"
                        content={t('properties.edit.helpers.parking')}
                      />
                    </div>
                    <Input
                      id="parking"
                      type="number"
                      value={formData.parking}
                      onChange={(e) => handleInputChange('parking', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="strata">{t('properties.edit.strata')}</Label>
                      <FormFieldHelper
                        fieldId="strata"
                        content={t('properties.edit.helpers.strata')}
                      />
                    </div>
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="floor">{t('properties.edit.floor')}</Label>
                      <FormFieldHelper
                        fieldId="floor"
                        content={t('properties.edit.helpers.floor')}
                      />
                    </div>
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="total_floors">{t('properties.edit.totalFloors')}</Label>
                      <FormFieldHelper
                        fieldId="total_floors"
                        content={t('properties.edit.helpers.totalFloors')}
                      />
                    </div>
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
              <CardTitle className="text-lg">{t('properties.edit.additionalFeatures')}</CardTitle>
              <CardDescription>
                {t('properties.edit.featuresHint')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
    </div>
  );
};

