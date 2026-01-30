import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useVisits } from '../../hooks/useVisits';
import { supabase } from '../../lib/supabase';
import { VisitDetailModal } from './VisitDetailModal';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, CreditCard, User, Home, Eye, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  };
  visitor?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  visitType: 'scheduled' | 'received'; // Nuevo campo para distinguir el tipo
}

export const UserVisitsView: React.FC = () => {
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
              owner_id
            ),
            visitor:profiles!visits_visitor_id_fkey (
              id,
              full_name,
              email,
              phone
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
                  owner_id
                ),
                visitor:profiles!visits_visitor_id_fkey (
                  id,
                  full_name,
                  email,
                  phone
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
      pending: { label: 'Pendiente', variant: 'secondary' },
      confirmed: { label: 'Confirmada', variant: 'default' },
      completed: { label: 'Completada', variant: 'default' },
      cancelled: { label: 'Cancelada', variant: 'destructive' },
      rescheduled: { label: 'Reprogramada', variant: 'outline' },
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

  const handleMakeOffer = async (visit: VisitWithType) => {
    if (!visit.property_id) {
      toast.error('No se pudo obtener la información de la propiedad');
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
        toast.error('No se pudo obtener la información de la propiedad');
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
      toast.error('Error al cargar la información de la propiedad');
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Mis Visitas
          </CardTitle>
          <CardDescription>
            Gestiona todas tus visitas: las que programaste y las que recibiste como propietario
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!allVisits || allVisits.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes visitas</h3>
              <p className="text-gray-500 mb-4">
                Cuando agendes una visita a una propiedad o recibas una solicitud de visita, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allVisits.map((visit: VisitWithType) => {
                const property = visit.property || {};
                const scheduledDate = visit.scheduled_date 
                  ? format(new Date(visit.scheduled_date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
                  : 'Fecha no disponible';
                
                const isReceivedVisit = visit.visitType === 'received';
                
                return (
                  <Card 
                    key={visit.id} 
                    className={`hover:shadow-md transition-shadow cursor-pointer ${isReceivedVisit ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'}`}
                    onClick={() => {
                      setSelectedVisit(visit);
                      setShowDetailModal(true);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isReceivedVisit ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Home className="h-3 w-3 mr-1" />
                                    Visita Recibida
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <User className="h-3 w-3 mr-1" />
                                    Visita Programada
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {property.title || 'Propiedad'}
                              </h3>
                              {property.address && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {property.address}
                                </p>
                              )}
                              {isReceivedVisit && visit.visitor && (
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                  <User className="h-4 w-4" />
                                  Visitante: {visit.visitor.full_name || visit.visitor.email}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(visit.status)}
                              {getStatusBadge(visit.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-800 font-semibold">Fecha:</span>
                              <span className="font-semibold text-gray-900">{scheduledDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-800 font-semibold">Hora:</span>
                              <span className="font-semibold text-gray-900">{visit.scheduled_time || 'No especificada'}</span>
                            </div>
                            {visit.visit_price && (
                              <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4 text-gray-600" />
                                <span className="text-gray-800 font-semibold">Precio:</span>
                                <span className="font-semibold text-gray-900">
                                  ${visit.visit_price.toLocaleString('es-CO')} COP
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <CreditCard className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-800 font-semibold">Estado de pago:</span>
                              <span className={`font-semibold ${visit.paid ? 'text-green-700' : 'text-yellow-700'}`}>
                                {visit.paid ? 'Pagado' : 'Pendiente'}
                              </span>
                            </div>
                          </div>

                          {visit.notes && (
                            <div className="pt-2 border-t">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Notas:</span> {visit.notes}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-3 border-t mt-3 flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVisit(visit);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Button>
                            {!isReceivedVisit && (visit.status === 'completed' || visit.status === 'confirmed') && (
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
                                Hacer Oferta
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
          )}
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
        onVisitUpdated={() => {
          // Refresh visits
          if (user?.id) {
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
                      owner_id
                    ),
                    visitor:profiles!visits_visitor_id_fkey (
                      id,
                      full_name,
                      email,
                      phone
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
        }}
      />

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
            toast.success('Oferta enviada exitosamente');
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

