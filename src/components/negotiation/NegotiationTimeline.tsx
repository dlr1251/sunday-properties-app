import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  DollarSign, 
  Calendar, 
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { OfferHistory } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface NegotiationTimelineProps {
  offerId: string;
  onHistoryLoaded?: (history: OfferHistory[]) => void;
}

export const NegotiationTimeline: React.FC<NegotiationTimelineProps> = ({
  offerId,
  onHistoryLoaded
}) => {
  const [history, setHistory] = useState<OfferHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('offer_history')
          .select(`
            *,
            actor:users!offer_history_actor_id_fkey(*)
          `)
          .eq('offer_id', offerId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading offer history:', error);
          return;
        }

        setHistory(data || []);
        if (onHistoryLoaded) {
          onHistoryLoaded(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [offerId, onHistoryLoaded]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'countered':
        return <ArrowRight className="h-4 w-4 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'countered':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Oferta creada';
      case 'countered':
        return 'Contraoferta';
      case 'accepted':
        return 'Oferta aceptada';
      case 'rejected':
        return 'Oferta rechazada';
      case 'expired':
        return 'Oferta expirada';
      default:
        return action;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'buyer':
        return 'Comprador';
      case 'seller':
        return 'Vendedor';
      case 'agent':
        return 'Agente';
      case 'lawyer':
        return 'Abogado';
      default:
        return role;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangesSummary = (changes: any) => {
    if (!changes) return null;

    const changesList = [];
    if (changes.offerPrice) changesList.push('Precio');
    if (changes.paymentMethod) changesList.push('Método de pago');
    if (changes.closingDate) changesList.push('Fecha de cierre');
    if (changes.conditions) changesList.push('Condiciones');

    return changesList.length > 0 ? changesList.join(', ') : 'Sin cambios específicos';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No hay historial de negociación
          </h3>
          <p className="text-muted-foreground">
            El historial de ofertas y contraofertas aparecerá aquí
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historial de Negociación</h3>
        <Badge variant="secondary">
          {history.length} eventos
        </Badge>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

        {history.map((item, index) => {
          const isExpanded = expandedItems.has(item.id);
          const isLast = index === history.length - 1;

          return (
            <div key={item.id} className="relative flex items-start space-x-4 pb-6">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background ${
                isLast ? 'border-primary' : 'border-border'
              }`}>
                {getActionIcon(item.action)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Card className={`p-4 ${isLast ? 'border-primary shadow-md' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getActionColor(item.action)}>
                          {getActionLabel(item.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          v{item.version}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{item.actor?.name || 'Usuario'}</span>
                          <span>({require('../../utils/userRoles').getRoleLabel(item.actor_role)})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </div>

                      {/* Offer details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{formatPrice(item.offer_price)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-blue-500" />
                          <span className="capitalize">{item.payment_method}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span>{new Date(item.closing_date).toLocaleDateString('es-CO')}</span>
                        </div>
                      </div>

                      {/* Conditions */}
                      {item.conditions && item.conditions.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-muted-foreground">Condiciones:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.conditions.map((condition, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Changes summary */}
                      {item.changes && Object.keys(item.changes).length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-muted-foreground">Cambios:</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getChangesSummary(item.changes)}
                          </p>
                        </div>
                      )}

                      {/* Reason */}
                      {item.reason && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-muted-foreground">Razón:</span>
                          <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                        </div>
                      )}

                      {/* Expandable details */}
                      {(item.changes || item.reason) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(item.id)}
                          className="p-0 h-auto text-primary hover:text-primary/80"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Ver detalles
                            </>
                          )}
                        </Button>
                      )}

                      {/* Expanded details */}
                      {isExpanded && item.changes && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Detalles de los cambios:</h4>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {JSON.stringify(item.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
