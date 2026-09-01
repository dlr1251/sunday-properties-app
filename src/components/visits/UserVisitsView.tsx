import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { getAvatarUrl } from '../../utils/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useVisits } from '../../hooks/useVisits';
import { supabase } from '../../lib/supabase';
import { visitsRepository } from '../../lib/db/repositories/visits.repo';
import { RescheduleVisitInput } from '../../lib/validation/visits.schema';
import { isOk } from '../../lib/utils/result';
import { toUserMessage } from '../../lib/utils/errors';
import { VisitDetailModal } from './VisitDetailModal';
import { RescheduleDialog } from './components/RescheduleDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, User, Home, Eye, DollarSign, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';
import { SmartOfferForm } from '../negotiation/SmartOfferForm';
import { toast } from 'sonner';

interface VisitWithType {
  id: string;
  property_id: string;
  visitor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  visit_price?: number;
  paid: boolean;
  notes?: string;
  property?: {
    id: string;
    title: string;
    address: string;
    owner_id: string;
    images?: string[] | null;
  };
  visitor?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string | null;
  };
  visitType: 'scheduled' | 'received'; // Nuevo campo para distinguir el tipo
}

export const UserVisitsView: React.FC = () => {
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
  const { user, profile } = useAuth();
  const { visits: scheduledVisits, loading: scheduledLoading, fetchVisits } = useVisits(user?.id);
  const [receivedVisits, setReceivedVisits] = useState<VisitWithType[]>([]);
  const [loadingReceived, setLoadingReceived] = useState(false);
  const [allVisits, setAllVisits] = useState<VisitWithType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPropertyData, setOfferPropertyData] = useState<{
    id: string;
    price: number;
    negotiationRules: any;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'buyer-upcoming' | 'buyer-done' | 'received-done' | 'received-upcoming'>('buyer-done');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const mainTab = activeTab.startsWith('buyer') ? 'comprando' : 'vendiendo';

  const refreshVisits = () => {
    if (user?.id) {
      fetchVisits({ visitorId: user.id });
      const refreshReceived = async () => {
        const { data: userProperties } = await supabase.from('properties').select('id').eq('owner_id', user!.id);
        if (userProperties?.length) {
          const propertyIds = userProperties.map((p: { id: string }) => p.id);
          const { data: visitsData } = await supabase
            .from('visits')
            .select(`
              *,
              property:properties!visits_property_id_fkey (id, title, address, owner_id, images),
              visitor:profiles!visits_visitor_id_fkey (id, full_name, email, phone, avatar_url)
            `)
            .in('property_id', propertyIds)
            .order('scheduled_date', { ascending: false });
          if (visitsData) setReceivedVisits(visitsData.map((v: VisitWithType) => ({ ...v, visitType: 'received' as const })));
        }
      };
      refreshReceived();
    }
  };

  // Fetch visits as visitor (scheduled visits)
  useEffect(() => {
    if (user?.id) {
      console.log('Fetching scheduled visits for user:', user.id);
      fetchVisits({ visitorId: user.id });
    }
  }, [user?.id, fetchVisits]);

  // Fetch visits as property owner (received visits)
  useEffect(() => {
    const fetchReceivedVisits = async () => {
      if (!user?.id) return;

      setLoadingReceived(true);
      try {
        // First, get all properties owned by this user
        const { data: userProperties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user.id);

        if (propError) {
          console.error('Error fetching user properties:', propError);
          setLoadingReceived(false);
          return;
        }

        const propertyIds = userProperties?.map(p => p.id) || [];

        if (propertyIds.length === 0) {
          setReceivedVisits([]);
          setLoadingReceived(false);
          return;
        }

        // Get all visits for those properties
        const { data: visitsData, error: visitsError } = await supabase
          .from('visits')
          .select(`
            *,
            property:properties!visits_property_id_fkey (
              id,
              title,
              address,
              owner_id,
              images
            ),
            visitor:profiles!visits_visitor_id_fkey (
              id,
              full_name,
              email,
              phone,
              avatar_url
            )
          `)
          .in('property_id', propertyIds)
          .order('scheduled_date', { ascending: false });

        if (visitsError) {
          console.error('Error fetching received visits:', visitsError);
          setReceivedVisits([]);
        } else {
          // Mark these as 'received' visits
          const visitsWithType = (visitsData || []).map(visit => ({
            ...visit,
            visitType: 'received' as const
          }));
          setReceivedVisits(visitsWithType);
        }
      } catch (error) {
        console.error('Error fetching received visits:', error);
        setReceivedVisits([]);
      } finally {
        setLoadingReceived(false);
      }
    };

    fetchReceivedVisits();
  }, [user?.id]);

  // Combine both lists and remove duplicates
  useEffect(() => {
    const scheduled = (scheduledVisits || []).map(visit => ({
      ...visit,
      visitType: 'scheduled' as const
    }));

    // Combine lists
    const combined = [...scheduled, ...receivedVisits];
    
    // Remove duplicates (same visit might appear in both lists if user owns the property)
    const uniqueVisits = combined.reduce((acc, visit) => {
      const existing = acc.find(v => v.id === visit.id);
      if (!existing) {
        acc.push(visit);
      } else {
        // If visit exists, prefer 'received' type if user owns the property
        // (it's more relevant to show it as received when managing as owner)
        if (visit.visitType === 'received' && existing.visitType === 'scheduled') {
          const index = acc.indexOf(existing);
          acc[index] = visit;
        }
      }
      return acc;
    }, [] as VisitWithType[]);
    
    // Sort by scheduled_date (most recent first)
    uniqueVisits.sort((a, b) => {
      const dateA = new Date(a.scheduled_date).getTime();
      const dateB = new Date(b.scheduled_date).getTime();
      return dateB - dateA;
    });

    setAllVisits(uniqueVisits);
    setLoading(scheduledLoading || loadingReceived);
  }, [scheduledVisits, receivedVisits, scheduledLoading, loadingReceived]);

  // Tab lists: 4 categorías
  // Como comprador: voy a hacer (pendientes/confirmadas) y he hecho (completadas)
  const voyAHacer: VisitWithType[] = (scheduledVisits || [])
    .filter((v) => v.status === 'pending' || v.status === 'confirmed')
    .map((v) => ({ ...v, visitType: 'scheduled' as const }));
  const heHecho: VisitWithType[] = (scheduledVisits || [])
    .filter((v) => v.status === 'completed')
    .map((v) => ({ ...v, visitType: 'scheduled' as const }));
  // A mis propiedades: me han hecho (completadas) y me van a hacer (pendientes/confirmadas)
  const meHanHecho: VisitWithType[] = (receivedVisits || []).filter((v) => v.status === 'completed');
  const meVanAHacer: VisitWithType[] = (receivedVisits || []).filter(
    (v) => v.status === 'pending' || v.status === 'confirmed'
  );

  // Refresh visits when component mounts or when navigating back to this tab
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        console.log('Refreshing visits on focus');
        fetchVisits({ visitorId: user.id });
        // Also refresh received visits
        const refreshReceived = async () => {
          const { data: userProperties } = await supabase
            .from('properties')
            .select('id')
            .eq('owner_id', user.id);
          
          if (userProperties && userProperties.length > 0) {
            const propertyIds = userProperties.map(p => p.id);
            const { data: visitsData } = await supabase
              .from('visits')
              .select(`
                *,
                property:properties!visits_property_id_fkey (
                  id,
                  title,
                  address,
                  owner_id,
                  images
                ),
                visitor:profiles!visits_visitor_id_fkey (
                  id,
                  full_name,
                  email,
                  phone,
                  avatar_url
                )
              `)
              .in('property_id', propertyIds)
              .order('scheduled_date', { ascending: false });
            
            if (visitsData) {
              setReceivedVisits(visitsData.map(v => ({ ...v, visitType: 'received' as const })));
            }
          }
        };
        refreshReceived();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, fetchVisits]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: t('visits.pending'), variant: 'secondary' },
      confirmed: { label: t('visits.confirmed'), variant: 'default' },
      completed: { label: t('visits.completed'), variant: 'default' },
      cancelled: { label: t('visits.cancelled'), variant: 'destructive' },
      rescheduled: { label: t('visits.rescheduled'), variant: 'outline' },
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  /** Oculta notas técnicas de pagos/sistema para no ensuciar la UI */
  const isTechnicalNotes = (notes: string): boolean => {
    const n = notes.toLowerCase();
    return n.includes('payment id') || n.includes('[payment]') || n.includes('[test payment]');
  };

  const handleMakeOffer = async (visit: VisitWithType) => {
    if (!visit.property_id) {
      toast.error(t('visits.toast.propertyLoadError'));
      return;
    }

    try {
      // Fetch property data including price and negotiation rules
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id, price, negotiation_rules')
        .eq('id', visit.property_id)
        .single();

      if (propertyError || !propertyData) {
        toast.error(t('visits.toast.propertyLoadError'));
        return;
      }

      setOfferPropertyData({
        id: propertyData.id,
        price: propertyData.price || 0,
        negotiationRules: propertyData.negotiation_rules || {}
      });
      setShowOfferForm(true);
    } catch (error) {
      console.error('Error fetching property data:', error);
      toast.error(t('visits.toast.propertyLoadFailed'));
    }
  };

  const handleRescheduleFromCard = async (input: RescheduleVisitInput) => {
    try {
      const result = await visitsRepository.rescheduleVisit(input);
      if (isOk(result)) {
        toast.success(t('visits.toast.rescheduled'));
        setShowRescheduleModal(false);
        setSelectedVisit(null);
        refreshVisits();
      } else {
        toast.error(toUserMessage(result.error));
      }
    } catch (error: any) {
      toast.error(t('visits.toast.rescheduleError'));
      console.error('Error rescheduling visit:', error);
    }
  };

  const handleCancelFromCard = async () => {
    if (!selectedVisit) return;
    setCancelling(true);
    try {
      const result = await visitsRepository.updateVisitStatus(
        selectedVisit.id,
        'cancelled',
        t('visits.cancelNotes'),
        t('visits.cancelReason')
      );
      if (isOk(result)) {
        toast.success(t('visits.toast.cancelled'));
        setShowCancelModal(false);
        setSelectedVisit(null);
        refreshVisits();
      } else {
        toast.error(toUserMessage(result.error));
      }
    } catch (error: any) {
      toast.error(t('visits.toast.cancelError'));
      console.error('Error cancelling visit:', error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderVisitList = (visits: VisitWithType[], emptyTitle: string, emptyDescription: string) => {
    if (!visits || visits.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyTitle}</h3>
          <p className="text-gray-500">{emptyDescription}</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {visits.map((visit: VisitWithType) => {
          const property = visit.property || {};
          const scheduledDate = visit.scheduled_date
            ? format(new Date(visit.scheduled_date), 'EEEE, PPP', { locale: dateLocale })
            : t('visits.dateUnavailable');
          const isReceivedVisit = visit.visitType === 'received';
          const thumbnailUrl = Array.isArray(property.images) && property.images.length > 0
            ? property.images[0]
            : '/placeholder-property.jpg';

          return (
            <Card
              key={visit.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${isReceivedVisit ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'}`}
              onClick={() => {
                setSelectedVisit(visit);
                setShowDetailModal(true);
              }}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-36 h-36 sm:h-auto sm:min-h-[180px] shrink-0 rounded-l-lg overflow-hidden bg-muted">
                    <img
                      src={thumbnailUrl}
                      alt={property.title || t('visits.property')}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== '/placeholder-property.jpg') target.src = '/placeholder-property.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 p-4 sm:p-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isReceivedVisit ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Home className="h-3 w-3 mr-1" />
                              {t('visits.receivedVisit')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <User className="h-3 w-3 mr-1" />
                              {t('visits.scheduledVisit')}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {property.title || t('visits.property')}
                        </h3>
                        {property.address && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4 shrink-0" />
                            {property.address}
                          </p>
                        )}
                        {isReceivedVisit && visit.visitor && (
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={getAvatarUrl(visit.visitor)} alt={visit.visitor.full_name || visit.visitor.email} />
                              <AvatarFallback className="text-xs">
                                {(visit.visitor.full_name || visit.visitor.email || '?').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {t('visits.visitorLabel', { name: visit.visitor.full_name || visit.visitor.email })}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(visit.status)}
                        {getStatusBadge(visit.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-2 border-t text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-600 shrink-0" />
                        <span className="text-gray-800 font-semibold">{t('visits.date')}:</span>
                        <span className="text-gray-900">{scheduledDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600 shrink-0" />
                        <span className="text-gray-800 font-semibold">{t('visits.time')}:</span>
                        <span className="text-gray-900">{visit.scheduled_time || t('visits.timeUnspecified')}</span>
                      </div>
                    </div>

                    {visit.notes && !isTechnicalNotes(visit.notes) && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{t('visits.notes')}:</span> {visit.notes}
                        </p>
                      </div>
                    )}

                    <div className="pt-3 border-t flex flex-col sm:flex-row gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVisit(visit);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('visits.viewDetails')}
                      </Button>
                      {visit.status !== 'cancelled' && visit.status !== 'completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVisit(visit);
                              setShowRescheduleModal(true);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t('visits.reschedule')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVisit(visit);
                              setShowCancelModal(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t('common.cancel')}
                          </Button>
                        </>
                      )}
                      {!isReceivedVisit && visit.status === 'completed' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeOffer(visit);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          {t('visits.makeOffer')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('visits.myVisits')}
          </CardTitle>
          <CardDescription>
            {t('visits.myVisitsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Nivel principal: Comprando | Vendiendo */}
          <Tabs
            value={mainTab}
            onValueChange={(v) => setActiveTab(v === 'comprando' ? 'buyer-done' : 'received-done')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comprando">{t('visits.buying')}</TabsTrigger>
              <TabsTrigger value="vendiendo">{t('visits.selling')}</TabsTrigger>
            </TabsList>

            <TabsContent value="comprando" className="mt-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buyer-upcoming' | 'buyer-done')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="buyer-done">{t('visits.past')}</TabsTrigger>
                  <TabsTrigger value="buyer-upcoming">{t('visits.upcoming')}</TabsTrigger>
                </TabsList>
                <TabsContent value="buyer-done" className="mt-0">
                  {renderVisitList(
                    heHecho,
                    t('visits.emptyBuyerPastTitle'),
                    t('visits.emptyBuyerPastDescription')
                  )}
                </TabsContent>
                <TabsContent value="buyer-upcoming" className="mt-0">
                  {renderVisitList(
                    voyAHacer,
                    t('visits.emptyBuyerUpcomingTitle'),
                    t('visits.emptyBuyerUpcomingDescription')
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="vendiendo" className="mt-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'received-upcoming' | 'received-done')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="received-done">{t('visits.past')}</TabsTrigger>
                  <TabsTrigger value="received-upcoming">{t('visits.upcoming')}</TabsTrigger>
                </TabsList>
                <TabsContent value="received-done" className="mt-0">
                  {renderVisitList(
                    meHanHecho,
                    t('visits.emptySellerPastTitle'),
                    t('visits.emptySellerPastDescription')
                  )}
                </TabsContent>
                <TabsContent value="received-upcoming" className="mt-0">
                  {renderVisitList(
                    meVanAHacer,
                    t('visits.emptySellerUpcomingTitle'),
                    t('visits.emptySellerUpcomingDescription')
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Visit Detail Modal */}
      <VisitDetailModal
        visit={selectedVisit}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedVisit(null);
        }}
        onVisitUpdated={refreshVisits}
      />

      {/* Reagendar modal (desde la tarjeta) */}
      {selectedVisit && (
        <RescheduleDialog
          visit={selectedVisit as any}
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedVisit(null);
          }}
          onReschedule={handleRescheduleFromCard}
        />
      )}

      {/* Cancelar visita modal */}
      <Dialog
        open={showCancelModal && !!selectedVisit}
        onOpenChange={(open) => {
          if (!open) {
            setShowCancelModal(false);
            setSelectedVisit(null);
          }
        }}
      >
        <DialogContent
          className="max-w-md"
          onClose={() => {
            setShowCancelModal(false);
            setSelectedVisit(null);
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('visits.cancelConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('visits.cancelConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setSelectedVisit(null);
              }}
            >
              {t('common.close')}
            </Button>
            <Button
              variant="destructive"
              disabled={cancelling}
              onClick={handleCancelFromCard}
            >
              {cancelling ? t('visits.cancelling') : t('visits.confirmCancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offer Form Modal */}
      {offerPropertyData && (
        <SmartOfferForm
          isOpen={showOfferForm}
          onOpenChange={(open) => {
            setShowOfferForm(open);
            if (!open) {
              setOfferPropertyData(null);
            }
          }}
          propertyId={offerPropertyData.id}
          propertyPrice={offerPropertyData.price}
          negotiationRules={offerPropertyData.negotiationRules}
          onSubmit={(offer) => {
            console.log('Offer submitted:', offer);
            toast.success(t('visits.toast.offerSent'));
            setShowOfferForm(false);
            setOfferPropertyData(null);
          }}
          onCancel={() => {
            setShowOfferForm(false);
            setOfferPropertyData(null);
          }}
        />
      )}
    </div>
  );
};

