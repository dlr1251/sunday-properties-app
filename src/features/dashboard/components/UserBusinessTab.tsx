import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  TrendingDown,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { offersRepository, Offer } from '../../../lib/db/repositories/offers.repo';
import { isOk, isErr } from '../../../lib/utils/result';
import { toUserMessage } from '../../../lib/utils/errors';
import { CounterOfferDialog } from '../../../components/negotiation/CounterOfferDialog';
import { CounterOfferInput } from '../../../lib/validation/offers.schema';

interface SellerOffer extends Offer {
  property?: {
    id: string;
    title: string;
    address: string;
    price: number;
    owner_id: string;
    owner?: {
      id: string;
      full_name?: string;
      email: string;
      phone?: string;
      location?: string;
      verification_status?: string;
      avatar_url?: string;
      bio?: string;
    };
  };
  buyer?: {
    id: string;
    full_name?: string;
    name?: string;
    email: string;
    phone?: string;
    location?: string;
    verification_status?: string;
    avatar_url?: string;
    bio?: string;
  };
}

export const UserBusinessTab: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('buyer-offers');
  const [buyerOffers, setBuyerOffers] = useState<Offer[]>([]);
  const [sellerOffers, setSellerOffers] = useState<SellerOffer[]>([]);
  const [loadingBuyerOffers, setLoadingBuyerOffers] = useState(false);
  const [loadingSellerOffers, setLoadingSellerOffers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [counterOfferDialog, setCounterOfferDialog] = useState<{
    isOpen: boolean;
    offer: SellerOffer | null;
  }>({
    isOpen: false,
    offer: null
  });

  // Fetch buyer offers (offers made by the user)
  useEffect(() => {
    if (!user?.id) return;

    const fetchBuyerOffers = async () => {
      setLoadingBuyerOffers(true);
      try {
        const result = await offersRepository.getOffersByBuyer(user.id);
        if (isOk(result)) {
          setBuyerOffers(result.data);
        } else {
          toast.error(toUserMessage(result.error));
        }
      } catch (error: any) {
        toast.error('Error al cargar tus ofertas');
        console.error('Error fetching buyer offers:', error);
      } finally {
        setLoadingBuyerOffers(false);
      }
    };

    fetchBuyerOffers();
  }, [user?.id]);

  // Fetch seller offers (offers received on user's properties)
  useEffect(() => {
    if (!user?.id) return;

    const fetchSellerOffers = async () => {
      setLoadingSellerOffers(true);
      try {
        // First get user's properties
        const { data: properties, error: propsError } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user.id);

        if (propsError) throw propsError;

        if (!properties || properties.length === 0) {
          setSellerOffers([]);
          setLoadingSellerOffers(false);
          return;
        }

        const propertyIds = properties.map(p => p.id);

        // Then get offers for those properties
        const { data: offers, error: offersError } = await supabase
          .from('offers')
          .select(`
            *,
            property:properties!offers_property_id_fkey (
              id,
              title,
              address,
              price,
              owner_id
            ),
            buyer:profiles!offers_buyer_id_fkey (
              id,
              full_name,
              email,
              phone,
              location,
              verification_status,
              avatar_url,
              bio
            )
          `)
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false });

        if (offersError) throw offersError;

        setSellerOffers((offers || []) as SellerOffer[]);
      } catch (error: any) {
        toast.error('Error al cargar las ofertas recibidas');
        console.error('Error fetching seller offers:', error);
      } finally {
        setLoadingSellerOffers(false);
      }
    };

    fetchSellerOffers();
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  // Calculate financial metrics for an offer
  const calculateFinancialMetrics = (offer: Offer | SellerOffer) => {
    const originalPrice = offer.original_price;
    const offerPrice = offer.offer_price;
    const propertyPrice = offer.property?.price || originalPrice;

    // Price difference and percentage
    const priceDifference = offerPrice - originalPrice;
    const discountPercentage = ((originalPrice - offerPrice) / originalPrice) * 100;
    const priceVsPropertyPercentage = (offerPrice / propertyPrice) * 100;

    // Days until closing
    const closingDate = new Date(offer.closing_date);
    const today = new Date();
    const daysUntilClosing = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Risk score based on payment method and conditions
    let riskScore = 0;
    if (offer.payment_method === 'cash') riskScore = 10;
    else if (offer.payment_method === 'financing') riskScore = 30;
    else if (offer.payment_method === 'crypto') riskScore = 50;
    else if (offer.payment_method === 'mixed') riskScore = 40;

    // Add risk for special conditions
    if (offer.conditions && offer.conditions.length > 0) {
      riskScore += offer.conditions.length * 5;
    }

    // Payment reliability based on method
    const paymentReliability = offer.payment_method === 'cash' ? 95 : 
                             offer.payment_method === 'financing' ? 80 : 
                             offer.payment_method === 'crypto' ? 70 : 75;

    // Competitiveness score (0-100)
    let competitivenessScore = 50; // Base score
    
    // Price competitiveness (40 points max)
    if (priceVsPropertyPercentage >= 95) competitivenessScore += 40;
    else if (priceVsPropertyPercentage >= 90) competitivenessScore += 30;
    else if (priceVsPropertyPercentage >= 85) competitivenessScore += 20;
    else if (priceVsPropertyPercentage >= 80) competitivenessScore += 10;

    // Payment method score (30 points max)
    if (offer.payment_method === 'cash') competitivenessScore += 30;
    else if (offer.payment_method === 'financing') competitivenessScore += 20;
    else if (offer.payment_method === 'mixed') competitivenessScore += 15;
    else competitivenessScore += 10;

    // Closing speed score (20 points max)
    if (daysUntilClosing <= 30) competitivenessScore += 20;
    else if (daysUntilClosing <= 60) competitivenessScore += 15;
    else if (daysUntilClosing <= 90) competitivenessScore += 10;

    // Conditions penalty (reduce score for complex conditions)
    if (offer.conditions && offer.conditions.length > 0) {
      competitivenessScore -= offer.conditions.length * 2;
    }

    competitivenessScore = Math.min(100, Math.max(0, competitivenessScore));

    return {
      priceDifference,
      discountPercentage: Math.abs(discountPercentage),
      priceVsPropertyPercentage,
      daysUntilClosing,
      riskScore: Math.min(100, riskScore),
      paymentReliability,
      competitivenessScore: Math.round(competitivenessScore)
    };
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: XCircle },
      countered: { label: 'Contraoferta', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
      expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
    };
    return configs[status] || configs.pending;
  };

  const filteredBuyerOffers = buyerOffers.filter(offer => {
    const matchesSearch = searchQuery === '' || 
      offer.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.property?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSellerOffers = sellerOffers.filter(offer => {
    const buyerName = offer.buyer?.full_name || offer.buyer?.name || '';
    const matchesSearch = searchQuery === '' || 
      offer.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.property?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.buyer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const result = await offersRepository.acceptOffer(offerId);
      if (isOk(result)) {
        toast.success('Oferta aceptada exitosamente');
        // Refresh offers
        if (activeTab === 'seller-offers') {
          const { data: properties } = await supabase
            .from('properties')
            .select('id')
            .eq('owner_id', user?.id);
          if (properties) {
            const propertyIds = properties.map(p => p.id);
            const { data: offers } = await supabase
              .from('offers')
              .select(`
                *,
                property:properties!offers_property_id_fkey (
                  id,
                  title,
                  address,
                  price,
                  owner_id
                ),
                buyer:profiles!offers_buyer_id_fkey (
                  id,
                  full_name,
                  email,
                  phone,
                  location,
                  verification_status,
                  avatar_url,
                  bio
                )
              `)
              .in('property_id', propertyIds)
              .order('created_at', { ascending: false });
            setSellerOffers((offers || []) as SellerOffer[]);
          }
        }
      } else {
        toast.error(toUserMessage(result.error));
      }
    } catch (error: any) {
      toast.error('Error al aceptar la oferta');
      console.error('Error accepting offer:', error);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const result = await offersRepository.rejectOffer(offerId, 'Rechazada por el vendedor');
      if (isOk(result)) {
        toast.success('Oferta rechazada');
        // Refresh offers
        if (activeTab === 'seller-offers') {
          const { data: properties } = await supabase
            .from('properties')
            .select('id')
            .eq('owner_id', user?.id);
          if (properties) {
            const propertyIds = properties.map(p => p.id);
            const { data: offers } = await supabase
              .from('offers')
              .select(`
                *,
                property:properties!offers_property_id_fkey (
                  id,
                  title,
                  address,
                  price,
                  owner_id
                ),
                buyer:profiles!offers_buyer_id_fkey (
                  id,
                  full_name,
                  email,
                  phone,
                  location,
                  verification_status,
                  avatar_url,
                  bio
                )
              `)
              .in('property_id', propertyIds)
              .order('created_at', { ascending: false });
            setSellerOffers((offers || []) as SellerOffer[]);
          }
        }
      } else {
        toast.error(toUserMessage(result.error));
      }
    } catch (error: any) {
      toast.error('Error al rechazar la oferta');
      console.error('Error rejecting offer:', error);
    }
  };

  // Calculate NPV-improved counter offer suggestions
  const calculateImprovedNPVCounterOffer = (offer: SellerOffer) => {
    const originalPrice = offer.offer_price;
    const originalClosingDate = new Date(offer.closing_date);
    const today = new Date();
    const daysUntilClosing = Math.ceil((originalClosingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate suggested improvements:
    // 1. Increase price by 2-5% to improve NPV
    const suggestedPrice = Math.round(originalPrice * 1.03); // 3% increase
    
    // 2. Reduce closing date by 10-20 days if possible (minimum 30 days)
    const suggestedDaysUntilClosing = Math.max(30, Math.floor(daysUntilClosing * 0.85));
    const suggestedClosingDate = new Date(today);
    suggestedClosingDate.setDate(suggestedClosingDate.getDate() + suggestedDaysUntilClosing);
    
    // 3. Prefer cash payment if current is financing
    const suggestedPaymentMethod = offer.payment_method === 'financing' ? 'cash' : offer.payment_method;
    
    return {
      price: suggestedPrice,
      closingDate: suggestedClosingDate.toISOString().split('T')[0],
      paymentMethod: suggestedPaymentMethod,
      conditions: offer.conditions || []
    };
  };

  const handleOpenCounterOffer = (offer: SellerOffer) => {
    setCounterOfferDialog({
      isOpen: true,
      offer
    });
  };

  const handleCounterOfferSubmit = async (counterOfferData: any) => {
    if (!counterOfferDialog.offer) return;

    const offer = counterOfferDialog.offer;
    const loadingToast = toast.loading('Creando contraoferta...');

    try {
      // Convert CounterOfferDialog data to CounterOfferInput format
      const counterOfferInput: CounterOfferInput = {
        originalOfferId: offer.id,
        counterPrice: counterOfferData.offerPrice,
        paymentMethod: counterOfferData.paymentMethod as any,
        closingDate: counterOfferData.closingDate,
        conditions: counterOfferData.conditions || [],
        reason: counterOfferData.reason || '',
        message: counterOfferData.reason || '',
        financingDetails: offer.financing_details,
        cryptoDetails: offer.crypto_details
      };

      const result = await offersRepository.createCounterOffer(counterOfferInput);
      
      if (isOk(result)) {
        toast.success('Contraoferta creada exitosamente', { id: loadingToast });
        
        // Refresh seller offers
        if (user?.id) {
          const { data: properties } = await supabase
            .from('properties')
            .select('id')
            .eq('owner_id', user.id);
          if (properties) {
            const propertyIds = properties.map(p => p.id);
            const { data: offers } = await supabase
              .from('offers')
              .select(`
                *,
                property:properties!offers_property_id_fkey (
                  id,
                  title,
                  address,
                  price,
                  owner_id
                ),
                buyer:profiles!offers_buyer_id_fkey (
                  id,
                  full_name,
                  email,
                  phone,
                  location,
                  verification_status,
                  avatar_url,
                  bio
                )
              `)
              .in('property_id', propertyIds)
              .order('created_at', { ascending: false });
            setSellerOffers((offers || []) as SellerOffer[]);
          }
        }
        
        setCounterOfferDialog({ isOpen: false, offer: null });
      } else {
        toast.error(toUserMessage(result.error), { id: loadingToast });
      }
    } catch (error: any) {
      toast.error('Error al crear la contraoferta', { id: loadingToast });
      console.error('Error creating counter offer:', error);
    }
  };

  const renderOfferCard = (offer: Offer | SellerOffer, isBuyer: boolean) => {
    const statusConfig = getStatusConfig(offer.status);
    const StatusIcon = statusConfig.icon;
    const metrics = calculateFinancialMetrics(offer);

    return (
      <Card key={offer.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className="w-5 h-5" />
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900">
                {offer.property?.title || 'Propiedad sin título'}
              </h3>
              {offer.property?.address && (
                <p className="text-sm text-gray-700 flex items-center gap-1 mb-2 font-medium">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  {offer.property.address}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(offer.offer_price)}
              </div>
              <div className="text-sm text-gray-700 font-medium">
                vs. {formatCurrency(offer.original_price)}
              </div>
              {metrics.discountPercentage > 0 && (
                <div className={`text-xs font-semibold mt-1 ${metrics.discountPercentage > 10 ? 'text-red-600' : 'text-orange-600'}`}>
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                  {metrics.discountPercentage.toFixed(1)}% descuento
                </div>
              )}
            </div>
          </div>

          {/* Owner Information Section (only for buyer offers) */}
          {isBuyer && offer.property?.owner && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {offer.property.owner.avatar_url ? (
                    <img 
                      src={offer.property.owner.avatar_url} 
                      alt={offer.property.owner.full_name || offer.property.owner.email}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-base font-semibold text-gray-900">
                      {offer.property.owner.full_name || 'Propietario'}
                    </h4>
                    {offer.property.owner.verification_status === 'verified' && (
                      <Badge className="bg-green-600 text-white text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    {offer.property.owner.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-3 h-3 text-gray-600" />
                        <span className="font-medium">{offer.property.owner.email}</span>
                      </div>
                    )}
                    {offer.property.owner.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-3 h-3 text-gray-600" />
                        <span className="font-medium">{offer.property.owner.phone}</span>
                      </div>
                    )}
                    {offer.property.owner.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-3 h-3 text-gray-600" />
                        <span className="font-medium">{offer.property.owner.location}</span>
                      </div>
                    )}
                  </div>
                  {offer.property.owner.bio && (
                    <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">{offer.property.owner.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Buyer Information Section (only for seller offers) */}
          {!isBuyer && 'buyer' in offer && offer.buyer && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {offer.buyer.avatar_url ? (
                    <img 
                      src={offer.buyer.avatar_url} 
                      alt={offer.buyer.full_name || offer.buyer.email}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-base font-semibold text-gray-900">
                      {offer.buyer.full_name || offer.buyer.name || 'Comprador'}
                    </h4>
                    {offer.buyer.verification_status === 'verified' && (
                      <Badge className="bg-green-600 text-white text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    {offer.buyer.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-3 h-3 text-gray-600" />
                        <span className="font-medium">{offer.buyer.email}</span>
                      </div>
                    )}
                    {offer.buyer.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-3 h-3 text-gray-600" />
                        <span className="font-medium">{offer.buyer.phone}</span>
                      </div>
                    )}
                    {offer.buyer.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-3 h-3 text-gray-600" />
                        <span className="font-medium">{offer.buyer.location}</span>
                      </div>
                    )}
                  </div>
                  {offer.buyer.bio && (
                    <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">{offer.buyer.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-800 font-semibold">Método de pago:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {offer.payment_method === 'cash' ? 'Efectivo' :
                 offer.payment_method === 'financing' ? 'Financiación' :
                 offer.payment_method === 'crypto' ? 'Criptomonedas' :
                 offer.payment_method === 'mixed' ? 'Mixto' : offer.payment_method}
              </span>
            </div>
            <div>
              <span className="text-gray-800 font-semibold">Fecha de cierre:</span>
              <span className="ml-2 font-semibold text-gray-900">{formatDate(offer.closing_date)}</span>
            </div>
            <div>
              <span className="text-gray-800 font-semibold">Creada:</span>
              <span className="ml-2 font-semibold text-gray-900">{formatDate(offer.created_at)}</span>
            </div>
            {offer.expires_at && (
              <div>
                <span className="text-gray-800 font-semibold">Expira:</span>
                <span className="ml-2 font-semibold text-gray-900">{formatDate(offer.expires_at)}</span>
              </div>
            )}
          </div>

          {/* Financial Analysis Section */}
          <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <h4 className="text-base font-semibold text-gray-900">Análisis Financiero</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Descuento</div>
                <div className={`text-lg font-bold ${metrics.discountPercentage > 10 ? 'text-red-700' : metrics.discountPercentage > 5 ? 'text-orange-700' : 'text-green-700'}`}>
                  {metrics.discountPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {formatCurrency(Math.abs(metrics.priceDifference))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Días hasta cierre</div>
                <div className={`text-lg font-bold ${metrics.daysUntilClosing <= 30 ? 'text-green-700' : metrics.daysUntilClosing <= 60 ? 'text-blue-700' : 'text-gray-700'}`}>
                  {metrics.daysUntilClosing}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {metrics.daysUntilClosing <= 30 ? 'Rápido' : metrics.daysUntilClosing <= 60 ? 'Normal' : 'Extendido'}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Score Competitividad</div>
                <div className={`text-lg font-bold ${
                  metrics.competitivenessScore >= 80 ? 'text-green-700' : 
                  metrics.competitivenessScore >= 60 ? 'text-blue-700' : 
                  'text-orange-700'
                }`}>
                  {metrics.competitivenessScore}/100
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {metrics.competitivenessScore >= 80 ? 'Excelente' : 
                   metrics.competitivenessScore >= 60 ? 'Buena' : 
                   'Regular'}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Riesgo</div>
                <div className={`text-lg font-bold ${
                  metrics.riskScore <= 20 ? 'text-green-700' : 
                  metrics.riskScore <= 40 ? 'text-yellow-700' : 
                  'text-red-700'
                }`}>
                  {metrics.riskScore}/100
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Confiabilidad: {metrics.paymentReliability}%
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">% vs Precio de Propiedad:</span>
                <span className={`font-bold ${metrics.priceVsPropertyPercentage >= 95 ? 'text-green-700' : metrics.priceVsPropertyPercentage >= 90 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {metrics.priceVsPropertyPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {offer.conditions && offer.conditions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-1 text-gray-800">Condiciones:</p>
              <ul className="text-sm text-gray-700 list-disc list-inside font-medium">
                {offer.conditions.map((condition, idx) => (
                  <li key={idx}>{condition}</li>
                ))}
              </ul>
            </div>
          )}

          {offer.counter_offer && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Contraoferta:</p>
              <p className="text-sm text-blue-800">
                {formatCurrency(offer.counter_offer.price || offer.counter_offer.counter_price)}
              </p>
              {offer.counter_offer.message && (
                <p className="text-sm text-blue-700 mt-1">{offer.counter_offer.message}</p>
              )}
            </div>
          )}

          {!isBuyer && offer.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => handleAcceptOffer(offer.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenCounterOffer(offer)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Contraoferta
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectOffer(offer.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rechazar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Mis Negocios
          </CardTitle>
          <CardDescription>
            Gestiona tus ofertas, contraofertas y documentos relacionados con tus negocios inmobiliarios
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                <Input
                  placeholder="Buscar por propiedad, dirección o comprador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-900"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="accepted">Aceptada</option>
                <option value="rejected">Rechazada</option>
                <option value="countered">Contraoferta</option>
                <option value="expired">Expirada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buyer-offers" className="flex items-center gap-2 font-semibold">
            <DollarSign className="w-4 h-4" />
            Mis Ofertas ({buyerOffers.length})
          </TabsTrigger>
          <TabsTrigger value="seller-offers" className="flex items-center gap-2 font-semibold">
            <TrendingUp className="w-4 h-4" />
            Ofertas Recibidas ({sellerOffers.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 font-semibold">
            <FileText className="w-4 h-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Buyer Offers Tab */}
        <TabsContent value="buyer-offers" className="space-y-4">
          {loadingBuyerOffers ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-semibold">Cargando tus ofertas...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredBuyerOffers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-900 font-semibold">No has realizado ninguna oferta aún</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBuyerOffers.map(offer => renderOfferCard(offer, true))}
            </div>
          )}
        </TabsContent>

        {/* Seller Offers Tab */}
        <TabsContent value="seller-offers" className="space-y-4">
          {loadingSellerOffers ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando ofertas recibidas...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredSellerOffers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-900">No has recibido ninguna oferta aún</p>
                  <p className="text-sm text-gray-700 mt-2">
                    Las ofertas aparecerán aquí cuando alguien haga una oferta en tus propiedades
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSellerOffers.map(offer => renderOfferCard(offer, false))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos de Negocios
              </CardTitle>
              <CardDescription>
                Documentos relacionados con tus ofertas y contratos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-900">Funcionalidad de documentos próximamente</p>
                <p className="text-sm text-gray-700 mt-2">
                  Aquí podrás ver y gestionar todos los documentos relacionados con tus negocios
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Counter Offer Dialog */}
      <CounterOfferDialog
        isOpen={counterOfferDialog.isOpen}
        onClose={() => setCounterOfferDialog({ isOpen: false, offer: null })}
        offer={counterOfferDialog.offer}
        onSubmit={handleCounterOfferSubmit}
      />
    </div>
  );
};

