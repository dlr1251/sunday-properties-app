import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export interface NegotiationParticipant {
  id: string;
  name: string | null;
  email: string;
  role: string;
  verification_status: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  avatar_url?: string | null;
}

export interface NegotiationProperty {
  id: string;
  title: string;
  description?: string;
  address: string;
  neighborhood?: string;
  city: string;
  state?: string;
  country?: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number | null;
  parking?: number | null;
  year_built: number | null;
  strata_fee: number | null;
  strata?: number | null;
  price: number;
  minimum_offer_price?: number | null;
  monthly_costs?: number | null;
  coordinates: { lat: number; lng: number } | null;
  images: string[];
  property_type: string;
  registration_number?: string | null;
  legal_documents?: string[] | null;
  floor?: number | null;
  total_floors?: number | null;
  features?: string[] | null;
  tags?: string[] | null;
  virtual_tour?: string | null;
  video?: string | null;
  floor_plan?: string | null;
  financing?: boolean | null;
  accepts_crypto?: boolean | null;
  negotiation_terms?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface NegotiationOffer {
  id: string;
  negotiation_id: string;
  author: string;
  author_role?: 'buyer' | 'seller' | 'agent' | 'lawyer' | 'admin' | null;
  kind: 'offer' | 'counter';
  parent_offer_id?: string | null;
  version: number;
  
  // Typed columns (with fallback to payload)
  price?: number | null;
  down_payment?: number | null;
  payment_method?: string | null;
  closing_date?: string | null;
  conditions?: any[] | null;
  message?: string | null;
  valid_until?: string | null;
  
  // Keep JSONB for backward compat
  payload: {
    price?: number;
    downPayment?: number;
    annualRate?: number;
    termMonths?: number;
    conditions?: string[];
    paymentMethod?: string;
    closingDate?: string;
    changes?: any;
    message?: string;
  };
  
  status: 'offer' | 'counter' | 'accepted' | 'rejected' | 'pending' | 'expired';
  created_at: string;
  updated_at: string;
  author_profile?: NegotiationParticipant;
}

export interface NegotiationDocument {
  id: string;
  negotiation_id: string;
  kind: 'promise_of_sale' | 'promesa' | 'escritura' | 'oferta' | 'legal' | 'other';
  content: any;
  version: number;
  updated_by: string | null;
  document_url: string | null;
  document_name: string | null;
  status: 'draft' | 'review' | 'signed' | 'finalized' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface NegotiationData {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  lawyer_id: string | null;
  agent_id: string | null;
  title: string;
  status: string;
  participants: string[];
  current_price: number | null;
  original_price: number | null;
  price_difference: number | null;
  price_change_percentage: number | null;
  negotiation_progress: number;
  last_offer_id: string | null;
  offer_count: number;
  counter_offer_count: number;
  metadata: any;
  milestones_completed: any;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  expires_at: string | null;

  // Joined data
  property?: NegotiationProperty;
  buyer?: NegotiationParticipant;
  seller?: NegotiationParticipant;
  lawyer?: NegotiationParticipant;
  agent?: NegotiationParticipant;
  offers?: NegotiationOffer[];
  documents?: NegotiationDocument[];
}

export function useNegotiationData(negotiationId: string) {
  const [data, setData] = useState<NegotiationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNegotiationData() {
      console.log('📥 [useNegotiationData] Loading negotiation data for:', negotiationId);
      setLoading(true);
      setError(null);

      try {
        // Obtener la negociación con todos los participantes
        const { data: negotiation, error: negotiationError } = await supabase
          .from('negotiations')
          .select(`
            *,
            buyer:profiles!negotiations_buyer_id_fkey(*),
            seller:profiles!negotiations_seller_id_fkey(*),
            lawyer:profiles!negotiations_lawyer_id_fkey(*),
            agent:profiles!negotiations_agent_id_fkey(*)
          `)
          .eq('id', negotiationId)
          .single();

        if (negotiationError) {
          console.error('❌ [useNegotiationData] Failed to load negotiation:', negotiationError);
          throw negotiationError;
        }

        if (!negotiation) {
          throw new Error('Negociación no encontrada');
        }

        // Obtener la propiedad con toda la información disponible
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select(`
            *,
            owner:profiles!properties_owner_id_fkey(
              id,
              full_name,
              email,
              phone
            ),
            agent:profiles!properties_agent_id_fkey(
              id,
              full_name,
              email,
              phone
            )
          `)
          .eq('id', negotiation.property_id)
          .single();

        if (propertyError) {
          console.error('❌ [useNegotiationData] Failed to load property:', propertyError);
          throw propertyError;
        }

        // Formatear la propiedad con toda la información
        const formattedProperty: NegotiationProperty = {
          id: property.id,
          title: property.title || property.address || 'Propiedad sin título',
          description: property.description || null,
          address: property.address || '',
          neighborhood: property.neighborhood || null,
          city: property.city || property.location?.city || '',
          state: property.state || null,
          country: property.country || 'Colombia',
          area: property.area || property.square_meters || 0,
          bedrooms: property.bedrooms || property.rooms || 0,
          bathrooms: property.bathrooms || 0,
          parking_spaces: property.parking_spaces || property.parking || null,
          parking: property.parking || property.parking_spaces || null,
          year_built: property.year_built || property.construction_year || null,
          strata_fee: property.strata_fee || property.admin_fee || null,
          strata: property.strata || null,
          price: property.price || 0,
          minimum_offer_price: property.minimum_offer_price || null,
          monthly_costs: property.monthly_costs || null,
          coordinates: property.coordinates || (property.location ? {
            lat: property.location.lat || 0,
            lng: property.location.lng || 0
          } : null),
          images: property.images || [],
          property_type: property.property_type || property.type || 'apartment',
          registration_number: property.registration_number || property.matricula || null,
          legal_documents: property.legal_documents || null,
          floor: property.floor || null,
          total_floors: property.total_floors || null,
          features: property.features || null,
          tags: property.tags || null,
          virtual_tour: property.virtual_tour || null,
          video: property.video || null,
          floor_plan: property.floor_plan || null,
          financing: property.financing || null,
          accepts_crypto: property.accepts_crypto || null,
          negotiation_terms: property.negotiation_terms || null,
          created_at: property.created_at || null
        };

        // Helper para formatear participantes
        const formatParticipant = (profile: any): NegotiationParticipant | undefined => {
          if (!profile) return undefined;
          return {
            id: profile.id,
            name: profile.full_name || profile.name || null,
            email: profile.email || '',
            role: profile.role || '',
            verification_status: profile.verification_status || 'verified',
            email_confirmed_at: profile.email_confirmed_at || profile.created_at || new Date().toISOString(),
            created_at: profile.created_at || new Date().toISOString(),
            last_sign_in_at: profile.last_sign_in_at || null,
            avatar_url: profile.avatar_url || null
          };
        };

        // Helper para convertir ofertas de la tabla 'offers' a NegotiationOffer
        const convertOffersTableToNegotiationOffer = (offer: any, negotiation: any): NegotiationOffer => {
          let financingDetails: any = {};
          try {
            if (offer.financing_details) {
              if (typeof offer.financing_details === 'object') {
                financingDetails = offer.financing_details;
              } else if (typeof offer.financing_details === 'string') {
                financingDetails = JSON.parse(offer.financing_details);
              }
            }
          } catch (e) {
            console.warn('⚠️ [useNegotiationData] Failed to parse financing_details:', e);
            financingDetails = {};
          }

          const statusMap: Record<string, 'offer' | 'counter' | 'accepted' | 'rejected' | 'pending' | 'expired'> = {
            'pending': 'pending',
            'accepted': 'accepted',
            'rejected': 'rejected',
            'countered': 'counter',
            'expired': 'expired',
            'cancelled': 'rejected'
          };

          return {
            id: offer.id,
            negotiation_id: negotiation.id,
            author: offer.buyer_id,
            author_role: 'buyer',
            kind: negotiation.initial_offer_id === offer.id ? 'offer' : 'counter',
            version: 1,
            parent_offer_id: null,
            price: offer.offer_price,
            down_payment: financingDetails?.down_payment || financingDetails?.downPayment || null,
            payment_method: offer.payment_method || null,
            closing_date: offer.closing_date ? new Date(offer.closing_date).toISOString() : null,
            conditions: offer.conditions || [],
            message: offer.rejection_reason || null,
            valid_until: offer.expires_at ? new Date(offer.expires_at).toISOString() : null,
            status: statusMap[offer.status] || 'pending',
            created_at: offer.created_at,
            updated_at: offer.updated_at || offer.created_at,
            author_profile: formatParticipant(offer.buyer),
            payload: {
              price: offer.offer_price,
              downPayment: financingDetails?.down_payment || financingDetails?.downPayment,
              paymentMethod: offer.payment_method,
              closingDate: offer.closing_date,
              conditions: offer.conditions || [],
              message: offer.rejection_reason
            }
          };
        };

        // 1. Obtener las ofertas de negotiation_offers
        const { data: negotiationOffers, error: negotiationOffersError } = await supabase
          .from('negotiation_offers')
          .select(`
            *,
            author_profile:profiles!negotiation_offers_author_fkey(*)
          `)
          .eq('negotiation_id', negotiationId)
          .order('created_at', { ascending: false });

        if (negotiationOffersError) {
          console.error('❌ [useNegotiationData] Failed to load negotiation_offers:', negotiationOffersError);
          // No lanzamos error, solo logueamos para no romper el flujo
        }

        // 2. Obtener la oferta inicial desde offers (si existe)
        let initialOfferFromOffers: NegotiationOffer | null = null;
        if (negotiation.initial_offer_id) {
          const { data: initialOfferData, error: initialOfferError } = await supabase
            .from('offers')
            .select(`
              *,
              buyer:profiles!offers_buyer_id_fkey(*)
            `)
            .eq('id', negotiation.initial_offer_id)
            .single();

          if (initialOfferError) {
            console.warn('⚠️ [useNegotiationData] Failed to load initial offer:', initialOfferError);
          } else if (initialOfferData) {
            initialOfferFromOffers = convertOffersTableToNegotiationOffer(initialOfferData, negotiation);
            console.log('✅ [useNegotiationData] Loaded initial offer from offers table');
          }
        }

        // 3. Obtener otras ofertas de offers vinculadas a esta negociación
        const { data: linkedOffers, error: linkedOffersError } = await supabase
          .from('offers')
          .select(`
            *,
            buyer:profiles!offers_buyer_id_fkey(*)
          `)
          .eq('negotiation_id', negotiationId)
          .order('created_at', { ascending: false });

        if (linkedOffersError) {
          console.warn('⚠️ [useNegotiationData] Failed to load linked offers:', linkedOffersError);
        }

        // 4. Formatear las ofertas de negotiation_offers
        const formattedNegotiationOffers: NegotiationOffer[] = (negotiationOffers || []).map((offer: any) => {
          // Use typed columns if available, fallback to payload
          const price = offer.price ?? offer.payload?.price ?? null;
          const downPayment = offer.down_payment ?? offer.payload?.downPayment ?? null;
          const paymentMethod = offer.payment_method ?? offer.payload?.paymentMethod ?? null;
          const closingDate = offer.closing_date ?? offer.payload?.closingDate ?? null;
          const conditions = offer.conditions ?? offer.payload?.conditions ?? null;
          const message = offer.message ?? offer.payload?.message ?? null;

          return {
            ...offer,
            price,
            down_payment: downPayment,
            payment_method: paymentMethod,
            closing_date: closingDate,
            conditions,
            message,
            author_profile: offer.author_profile ? formatParticipant(offer.author_profile) : undefined,
            // Ensure defaults for new fields if missing
            kind: offer.kind || 'offer',
            version: offer.version || 1,
            parent_offer_id: offer.parent_offer_id || null,
            author_role: offer.author_role || null,
            valid_until: offer.valid_until || null
          };
        });

        // 5. Convertir ofertas de offers table
        const convertedOffersFromOffers: NegotiationOffer[] = (linkedOffers || [])
          .filter((offer: any) => {
            // Excluir la oferta inicial si ya la procesamos por separado
            return negotiation.initial_offer_id !== offer.id;
          })
          .map((offer: any) => convertOffersTableToNegotiationOffer(offer, negotiation));

        // 6. Combinar todas las ofertas y eliminar duplicados
        const allOffersMap = new Map<string, NegotiationOffer>();

        // Agregar ofertas de negotiation_offers
        formattedNegotiationOffers.forEach(offer => {
          allOffersMap.set(offer.id, offer);
        });

        // Agregar oferta inicial si existe y no está duplicada
        if (initialOfferFromOffers && !allOffersMap.has(initialOfferFromOffers.id)) {
          allOffersMap.set(initialOfferFromOffers.id, initialOfferFromOffers);
        }

        // Agregar otras ofertas de offers
        convertedOffersFromOffers.forEach(offer => {
          if (!allOffersMap.has(offer.id)) {
            allOffersMap.set(offer.id, offer);
          }
        });

        // 7. Ordenar todas las ofertas por fecha (más antiguas primero para timeline)
        const formattedOffers = Array.from(allOffersMap.values()).sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        console.log(`✅ [useNegotiationData] Combined offers: ${formattedOffers.length} total (${formattedNegotiationOffers.length} from negotiation_offers, ${convertedOffersFromOffers.length} from offers, ${initialOfferFromOffers ? '1' : '0'} initial)`);

        // Obtener los documentos de la negociación
        const { data: documents, error: documentsError } = await supabase
          .from('negotiation_documents')
          .select('*')
          .eq('negotiation_id', negotiationId)
          .order('updated_at', { ascending: false });

        if (documentsError) {
          console.error('❌ [useNegotiationData] Failed to load documents:', documentsError);
          // No lanzamos error aquí, solo logueamos ya que los documentos pueden no existir aún
        }


        // Combinar todos los datos
        const completeData: NegotiationData = {
          ...negotiation,
          property: formattedProperty,
          buyer: formatParticipant(negotiation.buyer),
          seller: formatParticipant(negotiation.seller),
          lawyer: formatParticipant(negotiation.lawyer),
          agent: formatParticipant(negotiation.agent),
          offers: formattedOffers,
          documents: documents || []
        };

        console.log('✅ [useNegotiationData] Loaded complete negotiation data');
        if (!isMounted) return;

        setData(completeData);
      } catch (e: any) {
        console.error('💥 [useNegotiationData] Load error:', e);
        if (!isMounted) return;
        setError(e?.message || 'Error loading negotiation data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (negotiationId) {
      loadNegotiationData();
    }

    // Realtime subscription para ofertas
    const offersChannel = supabase
      .channel(`negotiation_offers:${negotiationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'negotiation_offers', filter: `negotiation_id=eq.${negotiationId}` },
        (payload) => {
          console.log('📡 [useNegotiationData] Realtime event for offers:', payload.eventType);
          if (!isMounted) return;

          setData((current) => {
            if (!current) return current;

            const updatedOffers = [...(current.offers || [])];

            if (payload.eventType === 'INSERT') {
              updatedOffers.unshift(payload.new as any);
            } else if (payload.eventType === 'UPDATE') {
              const index = updatedOffers.findIndex(o => o.id === (payload.new as any).id);
              if (index !== -1) {
                updatedOffers[index] = payload.new as any;
              }
            } else if (payload.eventType === 'DELETE') {
              const index = updatedOffers.findIndex(o => o.id === (payload.old as any).id);
              if (index !== -1) {
                updatedOffers.splice(index, 1);
              }
            }

            return {
              ...current,
              offers: updatedOffers
            };
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(offersChannel);
    };
  }, [negotiationId]);

  return { data, loading, error };
}
