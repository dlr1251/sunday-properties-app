import React, { useState, useEffect } from 'react';
import { useResourceDetail } from '../../../hooks/superadmin/useResourceDetail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Edit, 
  Save, 
  X, 
  FileText, 
  Eye, 
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useDateFnsLocale } from '../../../i18n/useDateFnsLocale';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { formatCurrency } from '../../../utils/format';
import { Skeleton } from '../../ui/skeleton';

interface PropertyDetailViewProps {
  propertyId: string | null;
  onUpdate?: () => void;
}

export function PropertyDetailView({ propertyId, onUpdate }: PropertyDetailViewProps) {
  const { t } = useTranslation();
  const dateFnsLocale = useDateFnsLocale();
  const { data, loading, error, update, refresh } = useResourceDetail({
    resourceType: 'property',
    resourceId: propertyId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [legalDocs, setLegalDocs] = useState<any[]>([]);
  const [offersCount, setOffersCount] = useState(0);
  const [visitsCount, setVisitsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        address: data.address || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        property_type: data.property_type || 'apartment',
        listing_type: data.listing_type || 'sale',
        price: data.price || 0,
        rent_monthly: data.rent_monthly || 0,
        lease_term_months: data.lease_term_months || null,
        deposit: data.deposit || null,
        admin_fee: data.admin_fee || null,
        utilities_included: data.utilities_included || [],
        pets_policy: data.pets_policy || '',
        minimum_offer_price: data.minimum_offer_price || null,
        monthly_costs: data.monthly_costs || null,
        visit_price: data.visit_price || 49000,
        area: data.area || 0,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        parking: data.parking || 0,
        floor: data.floor || null,
        total_floors: data.total_floors || null,
        year_built: data.year_built || null,
        strata: data.strata || null,
        status: data.status || 'draft',
        verified: data.verified || false,
        premium: data.premium || false,
        accepts_crypto: data.accepts_crypto || false,
        financing: data.financing || false,
        features: data.features || [],
        tags: data.tags || [],
        images: data.images || [],
        virtual_tour: data.virtual_tour || '',
        video: data.video || '',
        floor_plan: data.floor_plan || '',
        freedom_tradition: data.freedom_tradition || '',
        legal_documents: data.legal_documents || [],
      });
    }
  }, [data]);

  useEffect(() => {
    if (propertyId) {
      fetchRelatedData();
    }
  }, [propertyId]);

  const fetchRelatedData = async () => {
    if (!propertyId) return;

    try {
      setLoadingStats(true);

      // Fetch legal documents
      const { data: docs } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      setLegalDocs(docs || []);

      // Fetch offers count
      const { count: offers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId);

      setOffersCount(offers || 0);

      // Fetch visits count
      const { count: visits } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId);

      setVisitsCount(visits || 0);
    } catch (err: any) {
      console.error('Error fetching related data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSave = async () => {
    const success = await update(formData);
    if (success) {
      setIsEditing(false);
      onUpdate?.();
      await fetchRelatedData();
    }
  };

  const handleCancel = () => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        address: data.address || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        property_type: data.property_type || 'apartment',
        transaction_type: data.transaction_type || 'sale',
        price: data.price || 0,
        minimum_offer_price: data.minimum_offer_price || null,
        monthly_costs: data.monthly_costs || null,
        visit_price: data.visit_price || 49000,
        area: data.area || 0,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        parking: data.parking || 0,
        floor: data.floor || null,
        total_floors: data.total_floors || null,
        year_built: data.year_built || null,
        strata: data.strata || null,
        status: data.status || 'draft',
        verified: data.verified || false,
        premium: data.premium || false,
        accepts_crypto: data.accepts_crypto || false,
        financing: data.financing || false,
        features: data.features || [],
        tags: data.tags || [],
        images: data.images || [],
        virtual_tour: data.virtual_tour || '',
        video: data.video || '',
        floor_plan: data.floor_plan || '',
        freedom_tradition: data.freedom_tradition || '',
        legal_documents: data.legal_documents || [],
      });
    }
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      published: { label: t('admin.status.published'), variant: 'default' as const },
      pending: { label: t('admin.status.pending'), variant: 'secondary' as const },
      draft: { label: 'Borrador', variant: 'outline' as const },
      sold: { label: 'Vendida', variant: 'default' as const },
      rented: { label: t('admin.status.rented'), variant: 'default' as const },
      archived: { label: t('admin.status.archived'), variant: 'outline' as const },
    };
    const config = variants[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error || t('admin.propertyNotFound')}</p>
      </div>
    );
  }

  const property = data as any;
  const owner = property.owner;
  const agent = property.agent;
  const coordinates = property.coordinates;

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('admin.propertyDetails')}</h3>
          <p className="text-sm text-muted-foreground">{property.title}</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">{t('admin.information')}</TabsTrigger>
          <TabsTrigger value="characteristics">{t('admin.features')}</TabsTrigger>
          <TabsTrigger value="location">{t('admin.locationSection')}</TabsTrigger>
          <TabsTrigger value="multimedia">{t('admin.mediaSection')}</TabsTrigger>
          <TabsTrigger value="documents">Documentos ({legalDocs.length + (property.legal_documents?.length || 0)})</TabsTrigger>
          <TabsTrigger value="relations">{t('admin.relationships')}</TabsTrigger>
        </TabsList>

        {/* Información General */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.generalInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.recordTitle')}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('properties.status')}</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">{t('admin.status.draft')}</option>
                      <option value="pending">{t('admin.status.pending')}</option>
                      <option value="published">{t('admin.status.published')}</option>
                      <option value="sold">{t('admin.status.sold')}</option>
                      <option value="rented">{t('admin.status.rented')}</option>
                      <option value="archived">{t('admin.status.archived')}</option>
                    </select>
                  ) : (
                    <div>{getStatusBadge(property.status)}</div>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>{t('admin.description')}</Label>
                  {isEditing ? (
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{property.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.propertyType')}</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    >
                      <option value="apartment">{t('properties.types.apartment')}</option>
                      <option value="house">{t('properties.types.house')}</option>
                      <option value="townhouse">{t('properties.types.countryHouse')}</option>
                      <option value="office">{t('properties.types.office')}</option>
                      <option value="commercial">{t('properties.types.commercial')}</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium capitalize">{property.property_type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.listingType')}</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.transaction_type}
                      onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                    >
                      <option value="sale">{t('properties.listingTypes.sale')}</option>
                      <option value="rent">{t('properties.listingTypes.rental')}</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium capitalize">{property.transaction_type || 'sale'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.verifiedLabel')}</Label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Badge variant={property.verified ? 'default' : 'outline'}>
                      {property.verified ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.premiumLabel')}</Label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.premium}
                      onChange={(e) => setFormData({ ...formData, premium: e.target.checked })}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Badge variant={property.premium ? 'default' : 'outline'}>
                      {property.premium ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Características Físicas */}
        <TabsContent value="characteristics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.physicalFeatures')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.areaM2')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.area} m²</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('properties.bedrooms')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.bedrooms}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('properties.bathrooms')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.bathrooms}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('properties.parking')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.parking}
                      onChange={(e) => setFormData({ ...formData, parking: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.parking || 0}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.floor')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.floor || ''}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.floor || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.totalFloors')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.total_floors || ''}
                      onChange={(e) => setFormData({ ...formData, total_floors: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.total_floors || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.yearBuilt')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.year_built || ''}
                      onChange={(e) => setFormData({ ...formData, year_built: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.year_built || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.stratum')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.strata || ''}
                      onChange={(e) => setFormData({ ...formData, strata: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.strata || '-'}</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mt-4 space-y-2">
                <Label>{t('admin.features')}</Label>
                {isEditing ? (
                  <Input
                    placeholder={t("admin.featuresPlaceholder")}
                    value={Array.isArray(formData.features) ? formData.features.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value.split(',').map((f: string) => f.trim()).filter(Boolean) })}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {property.features && property.features.length > 0 ? (
                      property.features.map((feature: string, idx: number) => (
                        <Badge key={idx} variant="outline">{feature}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('common.noneFeminine')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="mt-4 space-y-2">
                <Label>{t('admin.tags')}</Label>
                {isEditing ? (
                  <Input
                    placeholder={t("admin.tagsPlaceholder")}
                    value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {property.tags && property.tags.length > 0 ? (
                      property.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('common.noneFeminine')}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Precio */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.priceInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('properties.price')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formatCurrency(property.price)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.minOfferPrice')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.minimum_offer_price || ''}
                      onChange={(e) => setFormData({ ...formData, minimum_offer_price: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {property.minimum_offer_price ? formatCurrency(property.minimum_offer_price) : '-'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.monthlyCosts')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.monthly_costs || ''}
                      onChange={(e) => setFormData({ ...formData, monthly_costs: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {property.monthly_costs ? formatCurrency(property.monthly_costs) : '-'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.visitPrice')}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.visit_price}
                      onChange={(e) => setFormData({ ...formData, visit_price: parseInt(e.target.value) || 49000 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formatCurrency(property.visit_price || 49000)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.acceptsCrypto')}</Label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.accepts_crypto}
                      onChange={(e) => setFormData({ ...formData, accepts_crypto: e.target.checked })}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Badge variant={property.accepts_crypto ? 'default' : 'outline'}>
                      {property.accepts_crypto ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.financingAvailable')}</Label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.financing}
                      onChange={(e) => setFormData({ ...formData, financing: e.target.checked })}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Badge variant={property.financing ? 'default' : 'outline'}>
                      {property.financing ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ubicación */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.locationSection')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.address')}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.neighborhood')}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.neighborhood}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.city')}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.department')}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.state || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.country')}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.country || '-'}</p>
                  )}
                </div>

                {coordinates && (
                  <div className="space-y-2">
                    <Label>{t('admin.coordinates')}</Label>
                    <p className="text-sm font-medium">
                      {coordinates.lat}, {coordinates.lng}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multimedia */}
        <TabsContent value="multimedia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.mediaSection')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Images */}
              <div className="space-y-2">
                <Label>{t('admin.images')}</Label>
                {isEditing ? (
                  <Input
                    placeholder={t("admin.urlsCommaPlaceholder")}
                    value={Array.isArray(formData.images) ? formData.images.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value.split(',').map((url: string) => url.trim()).filter(Boolean) })}
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {property.images && property.images.length > 0 ? (
                      property.images.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="relative group">
                          <img src={url} alt={t('admin.imageN', { n: idx + 1 })} className="w-full h-24 object-cover rounded border" />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded flex items-center justify-center">
                            <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" />
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground col-span-3">{t('common.noneFeminine')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Virtual Tour */}
              <div className="space-y-2">
                <Label>{t('admin.virtualTour')}</Label>
                {isEditing ? (
                  <Input
                    placeholder={t("admin.virtualTourPlaceholder")}
                    value={formData.virtual_tour}
                    onChange={(e) => setFormData({ ...formData, virtual_tour: e.target.value })}
                  />
                ) : (
                  property.virtual_tour ? (
                    <a href={property.virtual_tour} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      {t('admin.viewTour')}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('common.notAvailable')}</p>
                  )
                )}
              </div>

              {/* Video */}
              <div className="space-y-2">
                <Label>{t('admin.video')}</Label>
                {isEditing ? (
                  <Input
                    placeholder={t("admin.videoPlaceholder")}
                    value={formData.video}
                    onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                  />
                ) : (
                  property.video ? (
                    <a href={property.video} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {t('admin.video')}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('common.notAvailable')}</p>
                  )
                )}
              </div>

              {/* Floor Plan */}
              <div className="space-y-2">
                <Label>{t('admin.floorPlan')}</Label>
                {isEditing ? (
                  <Input
                    placeholder={t("admin.floorPlanPlaceholder")}
                    value={formData.floor_plan}
                    onChange={(e) => setFormData({ ...formData, floor_plan: e.target.value })}
                  />
                ) : (
                  property.floor_plan ? (
                    <a href={property.floor_plan} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('admin.floorPlan')}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('common.notAvailable')}</p>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.legalDocuments')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Freedom and Tradition */}
              <div className="space-y-2">
                <Label>{t('admin.freedomTradition')}</Label>
                {isEditing ? (
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                    value={formData.freedom_tradition}
                    onChange={(e) => setFormData({ ...formData, freedom_tradition: e.target.value })}
                    placeholder={t("admin.freedomTraditionPlaceholder")}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{property.freedom_tradition || t('common.notAvailable')}</p>
                )}
              </div>

              {/* Legal Documents Array */}
              <div className="space-y-2">
                <Label>{t('admin.legalDocumentUrls')}</Label>
                {isEditing ? (
                  <Input
                    placeholder={t("admin.urlsCommaPlaceholder")}
                    value={Array.isArray(formData.legal_documents) ? formData.legal_documents.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, legal_documents: e.target.value.split(',').map((url: string) => url.trim()).filter(Boolean) })}
                  />
                ) : (
                  <div className="space-y-2">
                    {property.legal_documents && property.legal_documents.length > 0 ? (
                      property.legal_documents.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <FileText className="h-4 w-4" />
                          Documento {idx + 1}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('admin.noDocuments')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Legal Documents from Table */}
              {legalDocs.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('admin.systemDocuments')}</Label>
                  <div className="space-y-2">
                    {legalDocs.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.document_type || t('admin.documentFallback')}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.created_at ? format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: dateFnsLocale }) : '-'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={doc.status === 'signed' ? 'default' : 'outline'}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relaciones */}
        <TabsContent value="relations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.relationships')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('negotiations.roles.owner')}</Label>
                  {owner ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{owner.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{owner.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('common.notSpecified')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('profile.roles.agent')}</Label>
                  {agent ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{agent.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('common.notSpecified')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.offersSection')}</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <p className="text-sm font-medium">{offersCount}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('visits.title')}</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="text-sm font-medium">{visitsCount}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.createdAt')}</Label>
                  <p className="text-sm font-medium">
                    {property.created_at
                      ? format(new Date(property.created_at), 'dd/MM/yyyy HH:mm', { locale: dateFnsLocale })
                      : '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.updatedAt')}</Label>
                  <p className="text-sm font-medium">
                    {property.updated_at
                      ? format(new Date(property.updated_at), 'dd/MM/yyyy HH:mm', { locale: dateFnsLocale })
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

