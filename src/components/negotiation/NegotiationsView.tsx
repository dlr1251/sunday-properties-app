import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  User,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scale,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';
import { formatCurrency } from '../../utils/format';
import { CounterOfferForm } from './CounterOfferForm';
import { OfferComparison } from './OfferComparison';
import { useNavigate } from 'react-router-dom';

interface Negotiation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  lawyer_id: string | null;
  agent_id: string | null;
  status: string;
  current_price: number;
  original_price: number;
  price_difference: number;
  price_change_percentage: number;
  negotiation_progress: number;
  offer_count: number;
  counter_offer_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
  };
  buyer: {
    id: string;
    full_name: string;
    email: string;
  };
  seller: {
    id: string;
    full_name: string;
    email: string;
  };
  lawyer: {
    id: string;
    full_name: string;
  } | null;
  offers: Offer[];
}

interface Offer {
  id: string;
  offer_price: number;
  original_price: number;
  payment_method: string;
  closing_date: string;
  status: string;
  conditions: string[];
  created_at: string;
  buyer_id: string;
  seller_id: string;
}

export const NegotiationsView: React.FC = () => {
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchNegotiations();
    }
  }, [user?.id]);

  const fetchNegotiations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch negotiations where user is buyer, seller, lawyer, or agent
      const { data, error } = await supabase
        .from('negotiations')
        .select(`
          *,
          property:properties(id, title, address, price),
          buyer:profiles!negotiations_buyer_id_fkey(id, full_name, email),
          seller:profiles!negotiations_seller_id_fkey(id, full_name, email),
          lawyer:profiles!negotiations_lawyer_id_fkey(id, full_name),
          offers:offers(
            id,
            offer_price,
            original_price,
            payment_method,
            closing_date,
            status,
            conditions,
            created_at,
            buyer_id,
            seller_id
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id},lawyer_id.eq.${user.id},agent_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNegotiations(data || []);
    } catch (error: any) {
      console.error('Error fetching negotiations:', error);
      toast.error(t('negotiations.loadListError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { labelKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { labelKey: 'negotiations.status.active', variant: 'default' },
      pending_lawyer: { labelKey: 'negotiations.status.pendingLawyer', variant: 'secondary' },
      pending_documents: { labelKey: 'negotiations.status.pendingDocuments', variant: 'secondary' },
      completed: { labelKey: 'negotiations.status.completed', variant: 'default' },
      cancelled: { labelKey: 'negotiations.status.cancelled', variant: 'destructive' },
      expired: { labelKey: 'negotiations.status.expired', variant: 'outline' },
    };

    const config = statusConfig[status] || { labelKey: status, variant: 'outline' };
    return <Badge variant={config.variant}>{t(config.labelKey, { defaultValue: status })}</Badge>;
  };

  const getUserRole = (negotiation: Negotiation): 'buyer' | 'seller' | 'lawyer' | 'agent' => {
    if (negotiation.buyer_id === user?.id) return 'buyer';
    if (negotiation.seller_id === user?.id) return 'seller';
    if (negotiation.lawyer_id === user?.id) return 'lawyer';
    if (negotiation.agent_id === user?.id) return 'agent';
    return 'buyer';
  };

  const filteredNegotiations = negotiations.filter(neg => {
    if (activeTab === 'all') return true;
    return neg.status === activeTab;
  });

  const handleCounterOffer = (negotiation: Negotiation) => {
    setSelectedNegotiation(negotiation);
    setShowCounterOffer(true);
  };

  const handleViewNegotiation = (negotiation: Negotiation) => {
    navigate(`/negotiations/${negotiation.id}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('negotiations.loading')}</p>
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
            <MessageSquare className="w-5 h-5" />
            {t('dashboard.myNegotiations')}
          </CardTitle>
          <CardDescription>
            {t('negotiations.viewAllSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">{t('negotiations.all')}</TabsTrigger>
              <TabsTrigger value="active">{t('negotiations.activePlural')}</TabsTrigger>
              <TabsTrigger value="pending_lawyer">{t('negotiations.pendingLawyer')}</TabsTrigger>
              <TabsTrigger value="pending_documents">{t('negotiations.pendingDocsShort')}</TabsTrigger>
              <TabsTrigger value="completed">{t('negotiations.completedPlural')}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {filteredNegotiations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/70 mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('negotiations.emptyCategory')}</p>
                </div>
              ) : (
                filteredNegotiations.map((negotiation) => {
                  const userRole = getUserRole(negotiation);
                  const isBuyer = userRole === 'buyer';
                  const isSeller = userRole === 'seller';
                  const latestOffer = negotiation.offers?.[negotiation.offers.length - 1];
                  const priceTrend = negotiation.price_difference > 0 ? 'up' : negotiation.price_difference < 0 ? 'down' : 'neutral';

                  return (
                    <Card key={negotiation.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 className="w-5 h-5 text-muted-foreground/70" />
                              <CardTitle className="text-lg">{negotiation.property?.title}</CardTitle>
                              {getStatusBadge(negotiation.status)}
                            </div>
                            <CardDescription className="flex items-center gap-4 mt-2">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {isBuyer ? t('negotiations.roles.seller') : t('negotiations.roles.buyer')}: {isBuyer ? negotiation.seller?.full_name : negotiation.buyer?.full_name}
                              </span>
                              {negotiation.lawyer && (
                                <span className="flex items-center gap-1">
                                  <Scale className="w-4 h-4" />
                                  {t('negotiations.roles.lawyer')}: {negotiation.lawyer.full_name}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Financial Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{t('negotiations.currentPrice')}</p>
                            <p className="text-xl font-bold">{formatCurrency(negotiation.current_price)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{t('negotiations.originalPrice')}</p>
                            <p className="text-lg">{formatCurrency(negotiation.original_price)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{t('negotiations.difference')}</p>
                            <div className="flex items-center gap-2">
                              {priceTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                              {priceTrend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                              <p className={`text-lg font-semibold ${priceTrend === 'up' ? 'text-green-600' : priceTrend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                                {priceTrend === 'up' ? '+' : ''}{formatCurrency(Math.abs(negotiation.price_difference))}
                              </p>
                              <span className={`text-sm ${priceTrend === 'up' ? 'text-green-600' : priceTrend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                                ({negotiation.price_change_percentage > 0 ? '+' : ''}{negotiation.price_change_percentage.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Negotiation Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('negotiations.offers')}</p>
                            <p className="text-lg font-semibold">{negotiation.offer_count}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('negotiations.counters')}</p>
                            <p className="text-lg font-semibold">{negotiation.counter_offer_count}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('negotiations.progress')}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${negotiation.negotiation_progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{negotiation.negotiation_progress}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('negotiations.details.lastUpdate')}</p>
                            <p className="text-sm">
                              {format(new Date(negotiation.updated_at), 'd MMM yyyy', { locale: dateLocale })}
                            </p>
                          </div>
                        </div>

                        {/* Latest Offer Info */}
                        {latestOffer && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">{t('negotiations.lastOffer')}</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{formatCurrency(latestOffer.offer_price)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t('negotiations.closingDateLabel', { date: format(new Date(latestOffer.closing_date), 'd MMM yyyy', { locale: dateLocale }) })}
                                </p>
                              </div>
                              <Badge variant={latestOffer.status === 'pending' ? 'secondary' : 'default'}>
                                {t(`negotiations.status.${latestOffer.status}`, { defaultValue: latestOffer.status })}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewNegotiation(negotiation)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t('negotiations.viewDetails')}
                          </Button>
                          {isSeller && negotiation.status === 'active' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCounterOffer(negotiation)}
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              {t('negotiations.makeCounter')}
                            </Button>
                          )}
                          {isBuyer && negotiation.status === 'active' && latestOffer?.status === 'countered' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCounterOffer(negotiation)}
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              {t('negotiations.respondCounter')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Counter Offer Dialog */}
      {selectedNegotiation && showCounterOffer && (
        <CounterOfferForm
          originalOffer={selectedNegotiation.offers?.[selectedNegotiation.offers.length - 1]}
          property={selectedNegotiation.property}
          negotiationRules={{}}
          isOpen={showCounterOffer}
          onOpenChange={setShowCounterOffer}
          onSubmit={async (counterOffer) => {
            await fetchNegotiations();
            setShowCounterOffer(false);
            setSelectedNegotiation(null);
          }}
        />
      )}
    </div>
  );
};

