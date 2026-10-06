import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NegotiationOffer, NegotiationParticipant } from '../../hooks/negotiations/useNegotiationData';
import { format } from 'date-fns';
import { Clock, User, DollarSign, Calendar, Pencil, ExternalLink, CheckCircle, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { OfferDetailsModal } from './OfferDetailsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { formatCurrency, formatRelativeTime } from '../../utils/format';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';

/** Condition row keys for comparison table (minimum negotiation conditions only) */
const CONDITION_ROW_KEYS = [
  'price',
  'escrituraDate',
  'entregaDate',
  'paymentMethod',
  'closing'
] as const;
type ConditionRowKey = typeof CONDITION_ROW_KEYS[number];

const CONDITION_LABEL_KEYS: Record<ConditionRowKey, string> = {
  price: 'negotiations.totalValue',
  escrituraDate: 'negotiations.deedDateShort',
  entregaDate: 'negotiations.deliveryDateShort',
  paymentMethod: 'negotiations.paymentMethodShort',
  closing: 'negotiations.closingOrValidity'
};

export type NegotiationOffersProps = {
  offers?: NegotiationOffer[];
  participants?: {
    buyer?: NegotiationParticipant;
    seller?: NegotiationParticipant;
    lawyer?: NegotiationParticipant;
    agent?: NegotiationParticipant;
  };
  property?: any;
  currentUserId?: string | null;
  className?: string;
};

/** Oferta inicial del vendedor (publicación en venta): valor, fechas, condiciones mínimas. */
type InitialListingRow = {
  id: 'initial-listing';
  type: 'initial';
  price: number;
  sellerName: string;
  paymentMethod?: string | null;
  maxClosingDays?: number | null;
  conditions?: string[] | Record<string, unknown> | null;
  createdAt?: string | null;
  propertyId?: string | null;
  /** Fecha de escrituración (firma de escritura pública). Condición mínima. */
  escrituraDate?: string | null;
  /** Fecha de entrega de la propiedad. Condición mínima. */
  entregaDate?: string | null;
};

/** Get condition value from an offer (for comparison) */
function getOfferConditionValue(offer: NegotiationOffer, key: ConditionRowKey): string | number | null {
  const condList = Array.isArray(offer.conditions) ? offer.conditions : (offer.payload?.conditions ? (Array.isArray(offer.payload.conditions) ? offer.payload.conditions : []) : []);
  const getCondDate = (types: string[]) =>
    condList.find((c: any) => c && typeof c === 'object' && types.includes(c?.type))?.date ?? null;
  switch (key) {
    case 'price':
      return offer.price ?? offer.payload?.price ?? null;
    case 'paymentMethod':
      return offer.payment_method ?? offer.payload?.paymentMethod ?? null;
    case 'closing':
      return offer.closing_date ?? offer.payload?.closingDate ?? null;
    case 'escrituraDate':
      return getCondDate(['escritura_firma', 'escritura']);
    case 'entregaDate':
      return getCondDate(['entrega_inmueble', 'entrega']);
    default:
      return null;
  }
}

export const NegotiationOffers: React.FC<NegotiationOffersProps> = ({
  offers = [],
  participants,
  property,
  currentUserId,
  className
}) => {
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
  const defaultPaymentMethod = t('negotiations.paymentMethods.bank_transfer');
  const [modalOffer, setModalOffer] = useState<NegotiationOffer | null>(null);
  const [initialOfferModalOpen, setInitialOfferModalOpen] = useState(false);
  /** Accepted conditions per offer: offerId -> Set of condition keys (local state; can wire to API later) */
  const [acceptedConditions, setAcceptedConditions] = useState<Record<string, Set<ConditionRowKey>>>({});

  const formatPrice = (price?: number) => {
    if (!price) return t('common.notSpecified');
    return formatCurrency(price);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: dateLocale });
  };

  const getOfferLabel = (offer: NegotiationOffer) => {
    const isFromMe = offer.author === currentUserId;
    const isCounter = offer.kind === 'counter';
    if (isCounter) {
      return isFromMe ? t('negotiations.sentCounter') : t('negotiations.receivedCounter');
    }
    return isFromMe ? t('negotiations.sentOffer') : t('negotiations.receivedOffer');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { labelKey: string; color: string }> = {
      accepted: { labelKey: 'negotiations.status.accepted', color: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { labelKey: 'negotiations.status.rejected', color: 'bg-red-100 text-red-800 border-red-200' },
      pending: { labelKey: 'negotiations.status.pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      expired: { labelKey: 'negotiations.status.expired', color: 'bg-muted text-foreground border-border' },
      offer: { labelKey: 'negotiations.status.pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      counter: { labelKey: 'negotiations.status.pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    };
    const statusConfig = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
        {t(statusConfig.labelKey)}
      </span>
    );
  };

  // Ordenar ofertas por fecha (más antiguas primero para comparación)
  const sortedOffers = [...offers].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Oferta inicial del vendedor (publicación): valor solicitado, fechas, condiciones mínimas
  const nt = property ? (property.negotiation_terms as any) : null;
  const timeline = nt?.offeredTimeline;
  const condList = Array.isArray(nt?.conditions) ? nt.conditions : [];
  const getCondDate = (types: string[]) =>
    condList.find((c: any) => c && typeof c === 'object' && types.includes(c.type))?.date ?? null;
  const initialListing: InitialListingRow | null = property
    ? {
        id: 'initial-listing',
        type: 'initial',
        price: property.price ?? 0,
        sellerName: participants?.seller?.name || participants?.seller?.email || t('negotiations.roles.seller'),
        paymentMethod: (nt?.acceptedPaymentMethods?.length
          ? (Array.isArray(nt.acceptedPaymentMethods) ? nt.acceptedPaymentMethods.join(', ') : String(nt.acceptedPaymentMethods))
          : null) ?? defaultPaymentMethod,
        maxClosingDays: nt?.maxClosingDays ?? null,
        conditions: nt?.conditions ?? (nt ? [nt] : null),
        createdAt: property.created_at ?? null,
        propertyId: property.id ?? null,
        escrituraDate: timeline?.deedSigningDate ?? getCondDate(['escritura_firma', 'escritura']),
        entregaDate: timeline?.propertyDeliveryDate ?? getCondDate(['entrega_inmueble', 'entrega'])
      }
    : null;

  const totalRows = (initialListing ? 1 : 0) + sortedOffers.length;

  /** Condition value from initial listing */
  const getInitialConditionValue = (key: ConditionRowKey): string | number | null => {
    if (!initialListing) return null;
    switch (key) {
      case 'price': return initialListing.price;
      case 'escrituraDate': return initialListing.escrituraDate ?? null;
      case 'entregaDate': return initialListing.entregaDate ?? null;
      case 'paymentMethod': return initialListing.paymentMethod ?? defaultPaymentMethod;
      case 'closing': return initialListing.maxClosingDays != null ? initialListing.maxClosingDays : null; // stored as days
      default: return null;
    }
  };

  /** All columns: [ { type: 'initial' }, { type: 'offer', offer }... ] */
  const columns = useMemo(() => {
    const cols: { type: 'initial' } | { type: 'offer'; offer: NegotiationOffer }[] = [];
    if (initialListing) cols.push({ type: 'initial' });
    sortedOffers.forEach(o => cols.push({ type: 'offer', offer: o }));
    return cols;
  }, [initialListing, sortedOffers]);

  /** Raw value for a cell (for diff calc). Dates as ms, price as number, rest as string. */
  const getRawValue = (col: typeof columns[number], key: ConditionRowKey): number | string | null => {
    const val = col.type === 'initial' ? getInitialConditionValue(key) : getOfferConditionValue(col.offer, key);
    if (val == null) return null;
    if (key === 'price') return typeof val === 'number' ? val : Number(val) || null;
    if (key === 'escrituraDate' || key === 'entregaDate' || key === 'closing') {
      const d = typeof val === 'number' ? (key === 'closing' && col.type === 'initial' ? null : val) : new Date(val).getTime();
      return typeof d === 'number' && !isNaN(d) ? d : (typeof val === 'number' ? val : null);
    }
    return String(val);
  };

  const handleAcceptCondition = (offerId: string, key: ConditionRowKey) => {
    setAcceptedConditions(prev => ({
      ...prev,
      [offerId]: new Set(prev[offerId] || []).add(key)
    }));
    // TODO: optional callback to persist, e.g. onAcceptCondition?.(offerId, key);
  };

  const handleRejectCondition = (offerId: string, key: ConditionRowKey) => {
    setAcceptedConditions(prev => {
      const next = { ...prev };
      const set = next[offerId];
      if (!set) return prev;
      const newSet = new Set(set);
      newSet.delete(key);
      if (newSet.size === 0) {
        delete next[offerId];
      } else {
        next[offerId] = newSet;
      }
      return next;
    });
    // TODO: optional callback to persist rejection
  };

  const isConditionAccepted = (offerId: string, key: ConditionRowKey) =>
    acceptedConditions[offerId]?.has(key) ?? false;

  /** Format condition value for display */
  const formatConditionDisplay = (key: ConditionRowKey, col: typeof columns[number], value: string | number | null): string => {
    if (value == null || value === '') return key === 'paymentMethod' ? defaultPaymentMethod : '—';
    if (key === 'price') return typeof value === 'number' ? formatPrice(value) : '—';
    if (key === 'paymentMethod') {
      const methodKey = String(value).toLowerCase();
      return t(`negotiations.paymentMethods.${methodKey}`, { defaultValue: String(value) });
    }
    if (key === 'escrituraDate' || key === 'entregaDate') {
      const d = typeof value === 'string' ? new Date(value) : new Date(Number(value));
      return isNaN(d.getTime()) ? '—' : format(d, 'dd/MM/yyyy', { locale: dateLocale });
    }
    if (key === 'closing') {
      if (col.type === 'initial' && typeof value === 'number') return t('negotiations.untilDays', { count: value });
      const d = typeof value === 'string' ? new Date(value) : new Date(Number(value));
      return isNaN(d.getTime()) ? '—' : format(d, 'dd/MM/yyyy', { locale: dateLocale });
    }
    return String(value);
  };

  /** Diff from previous column (for display). Skip when comparing initial "closing" (days) vs offer date. */
  const getDiffFromPrev = (colIndex: number, key: ConditionRowKey): { text: string; positive?: boolean } | null => {
    if (colIndex <= 0) return null;
    const col = columns[colIndex];
    const prevCol = columns[colIndex - 1];
    if (key === 'closing' && (col.type === 'initial' || prevCol.type === 'initial')) return null;
    const raw = getRawValue(col, key);
    const prevRaw = getRawValue(prevCol, key);
    if (raw == null && prevRaw == null) return null;
    if (raw == null || prevRaw == null) return { text: raw != null ? t('common.yes') : t('common.no') };
    if (key === 'price') {
      const a = Number(raw);
      const b = Number(prevRaw);
      if (isNaN(a) || isNaN(b)) return null;
      const delta = a - b;
      const pct = b !== 0 ? ((delta / b) * 100).toFixed(1) : '';
      return { text: `${delta >= 0 ? '+' : ''}${formatPrice(delta)}${pct ? ` (${pct}%)` : ''}`, positive: delta >= 0 };
    }
    if (key === 'escrituraDate' || key === 'entregaDate' || key === 'closing') {
      const ta = typeof raw === 'number' ? raw : new Date(raw as string).getTime();
      const tb = typeof prevRaw === 'number' ? prevRaw : new Date(prevRaw as string).getTime();
      if (isNaN(ta) || isNaN(tb)) return null;
      const days = Math.round((ta - tb) / (24 * 60 * 60 * 1000));
      return {
        text: days === 0 ? t('negotiations.same') : t('negotiations.daysDelta', { signed: days > 0 ? '+' : '', count: days }),
        positive: days <= 0
      };
    }
    return { text: String(raw) === String(prevRaw) ? t('negotiations.same') : t('negotiations.different') };
  };

  /** Diff from initial (first column). Skip when initial has "closing" as days (not comparable to offer date). */
  const getDiffFromInitial = (colIndex: number, key: ConditionRowKey): { text: string; positive?: boolean } | null => {
    if (colIndex <= 0 || !columns[0]) return null;
    const col = columns[colIndex];
    if (key === 'closing' && columns[0].type === 'initial') return null;
    const raw = getRawValue(col, key);
    const initRaw = getRawValue(columns[0], key);
    if (raw == null && initRaw == null) return null;
    if (raw == null || initRaw == null) return { text: raw != null ? t('common.yes') : t('common.no') };
    if (key === 'price') {
      const a = Number(raw);
      const b = Number(initRaw);
      if (isNaN(a) || isNaN(b)) return null;
      const delta = a - b;
      const pct = b !== 0 ? ((delta / b) * 100).toFixed(1) : '';
      return { text: `${delta >= 0 ? '+' : ''}${formatPrice(delta)}${pct ? ` (${pct}%)` : ''}`, positive: delta >= 0 };
    }
    if (key === 'escrituraDate' || key === 'entregaDate' || key === 'closing') {
      const ta = typeof raw === 'number' ? raw : new Date(raw as string).getTime();
      const tb = typeof initRaw === 'number' ? initRaw : new Date(initRaw as string).getTime();
      if (isNaN(ta) || isNaN(tb)) return null;
      const days = Math.round((ta - tb) / (24 * 60 * 60 * 1000));
      return {
        text: days === 0 ? t('negotiations.same') : t('negotiations.daysDelta', { signed: days > 0 ? '+' : '', count: days }),
        positive: days <= 0
      };
    }
    return { text: String(raw) === String(initRaw) ? t('negotiations.same') : t('negotiations.different') };
  };

  if (!property && (!offers || offers.length === 0)) {
    return (
      <section className={`bg-card border border-border rounded-xl shadow-sm p-6 ${className ?? ''}`}>
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('negotiations.comparisonTitle')}</h2>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="text-sm font-medium text-foreground mt-2">{t('negotiations.noOffersData')}</div>
          <div className="text-sm text-muted-foreground mt-1">{t('negotiations.noOffersDataHint')}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-card border border-border rounded-xl shadow-sm p-6 lg:p-8 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('negotiations.comparisonTitle')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('negotiations.comparisonSubtitle')}
          </p>
        </div>
        <div className="bg-brand-sky/10 px-4 py-2 rounded-lg border border-brand-sky/20">
          <div className="text-lg font-semibold text-blue-900">{totalRows}</div>
          <div className="text-xs text-blue-600">{t('negotiations.offersCount', { count: totalRows })}</div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground bg-muted/30/80 sticky left-0 z-10 min-w-[160px] border-r border-border">
                {t('negotiations.condition')}
              </th>
              {columns.map((col, colIndex) => {
                if (col.type === 'initial') {
                  return (
                    <th key="initial" className="text-left py-3 px-4 font-semibold text-amber-800 bg-amber-50/80 min-w-[200px] align-top">
                      <div className="flex items-center justify-between gap-2">
                        <span>{t('negotiations.initialOfferShort')}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setInitialOfferModalOpen(true); }}
                          className="p-1 rounded text-amber-700 hover:bg-amber-100"
                          title={t('negotiations.editInitialOffer')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                      {initialListing?.sellerName && (
                        <p className="text-xs font-normal text-muted-foreground mt-1">{initialListing.sellerName}</p>
                      )}
                    </th>
                  );
                }
                const offer = col.offer;
                const isLatest = colIndex === columns.length - 1;
                return (
                  <th
                    key={offer.id}
                    className={`text-left py-3 px-4 font-semibold min-w-[200px] align-top cursor-pointer ${isLatest ? 'bg-brand-sky/15 text-brand-navy' : 'bg-muted/30 text-foreground'}`}
                    onClick={() => setModalOffer(offer)}
                  >
                    <div className="flex items-center gap-2">
                      {isLatest && <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">{t('negotiations.latest')}</span>}
                      <span>{offer.author_profile?.name || offer.author_profile?.email || t('user')}</span>
                    </div>
                    <p className="text-xs font-normal text-muted-foreground mt-1 capitalize">
                      {offer.author_role === 'buyer' ? t('negotiations.roles.buyer') : offer.author_role === 'seller' ? t('negotiations.roles.seller') : offer.author_role || ''}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{formatDateTime(offer.created_at)}</p>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {CONDITION_ROW_KEYS.map(key => (
              <tr key={key} className="border-b border-border hover:bg-muted/30/50">
                <td className="py-2.5 px-3 font-medium text-muted-foreground bg-muted/30/50 sticky left-0 z-10 border-r border-border">
                  {t(CONDITION_LABEL_KEYS[key])}
                </td>
                {columns.map((col, colIndex) => {
                  const value = col.type === 'initial' ? getInitialConditionValue(key) : getOfferConditionValue(col.offer, key);
                  const display = formatConditionDisplay(key, col, value);
                  const diffPrev = getDiffFromPrev(colIndex, key);
                  const diffInitial = getDiffFromInitial(colIndex, key);
                  const isOfferCol = col.type === 'offer';
                  const offerId = isOfferCol ? col.offer.id : '';
                  const isOwnOffer = isOfferCol && col.offer.author === currentUserId;
                  const canAcceptOffer = isOfferCol && !isOwnOffer;
                  const accepted = canAcceptOffer && isConditionAccepted(offerId, key);

                  return (
                    <td
                      key={col.type === 'initial' ? 'initial' : col.offer.id}
                      className={`py-2.5 px-4 align-top ${col.type === 'initial' ? 'bg-amber-50/30' : 'bg-card cursor-pointer'}`}
                      onClick={isOfferCol ? () => setModalOffer(col.offer) : undefined}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{display}</p>
                        {diffPrev && isOfferCol && (
                          <p className="text-xs text-muted-foreground">
                            {t('negotiations.vsPrevious')} <span className={diffPrev.positive === false ? 'text-red-600' : diffPrev.positive === true ? 'text-green-600' : ''}>{diffPrev.text}</span>
                          </p>
                        )}
                        {diffInitial && isOfferCol && (
                          <p className="text-xs text-muted-foreground">
                            {t('negotiations.vsInitial')} <span className={diffInitial.positive === false ? 'text-red-600' : diffInitial.positive === true ? 'text-green-600' : ''}>{diffInitial.text}</span>
                          </p>
                        )}
                        {canAcceptOffer && (
                          <div className="pt-1.5 flex flex-wrap items-center gap-1">
                            {accepted ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" /> {t('negotiations.status.accepted')}
                              </span>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 min-w-0 px-1.5 text-[10px] text-muted-foreground hover:text-green-700 hover:bg-green-50"
                                  onClick={(e) => { e.stopPropagation(); handleAcceptCondition(offerId, key); }}
                                >
                                  <ThumbsUp className="w-2.5 h-2.5 mr-0.5" />
                                  {t('negotiations.actions.accept')}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 min-w-0 px-1.5 text-[10px] text-muted-foreground hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => { e.stopPropagation(); handleRejectCondition(offerId, key); }}
                                >
                                  <ThumbsDown className="w-2.5 h-2.5 mr-0.5" />
                                  {t('negotiations.actions.reject')}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 min-w-0 px-1.5 text-[10px] text-muted-foreground hover:text-blue-700 hover:bg-blue-50"
                                  onClick={(e) => { e.stopPropagation(); setModalOffer(col.offer); }}
                                >
                                  <MessageSquare className="w-2.5 h-2.5 mr-0.5" />
                                  {t('negotiations.actions.counter')}
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                        {isOwnOffer && (
                          <p className="pt-1.5 text-[10px] text-muted-foreground/70">{t('negotiations.yourOffer')}</p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles de Oferta */}
      <OfferDetailsModal
        open={modalOffer !== null}
        onClose={() => setModalOffer(null)}
        offer={modalOffer}
        participants={participants}
        property={property}
      />

      {/* Modal Oferta Inicial: ver detalles y editar propiedad */}
      {initialListing && (
        <Dialog open={initialOfferModalOpen} onOpenChange={setInitialOfferModalOpen}>
          <DialogContent
            className="max-w-md sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto"
            onClose={() => setInitialOfferModalOpen(false)}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                <span className="uppercase tracking-wider">{t('negotiations.initialOfferShort')}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {initialListing.createdAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{format(new Date(initialListing.createdAt), 'PP p', { locale: dateLocale })}</span>
                  <span className="text-muted-foreground/70">·</span>
                  <span className="text-amber-700">{formatRelativeTime(initialListing.createdAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200">
                <User className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{initialListing.sellerName}</p>
                  <p className="text-xs text-muted-foreground">{t('negotiations.roles.seller')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <DollarSign className="w-5 h-5 text-green-600 shrink-0" />
                <span className="text-xl font-bold text-foreground">{formatPrice(initialListing.price)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">{t('negotiations.paymentMethod')}</p>
                  <p className="text-muted-foreground">{initialListing.paymentMethod || '—'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">{t('negotiations.closing')}</p>
                  <p className="text-muted-foreground">{initialListing.maxClosingDays != null ? t('negotiations.untilDays', { count: initialListing.maxClosingDays }) : '—'}</p>
                </div>
              </div>
              {/* Condiciones mínimas: valor total, fecha de escrituración, fecha de entrega */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <h3 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                  {t('negotiations.minConditions')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground font-medium">{t('negotiations.totalValue')}</span>
                    <span className="text-foreground font-semibold">{formatPrice(initialListing.price)}</span>
                  </li>
                  <li className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground font-medium">{t('negotiations.deedDate')}</span>
                    <span className="text-foreground">
                      {initialListing.escrituraDate
                        ? format(new Date(initialListing.escrituraDate), 'dd/MM/yyyy', { locale: dateLocale })
                        : '—'}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground font-medium">{t('negotiations.deliveryDate')}</span>
                    <span className="text-foreground">
                      {initialListing.entregaDate
                        ? format(new Date(initialListing.entregaDate), 'dd/MM/yyyy', { locale: dateLocale })
                        : '—'}
                    </span>
                  </li>
                </ul>
              </div>
              {initialListing.propertyId && (
                <Link
                  to={`/dashboard?tab=properties&action=edit&property=${initialListing.propertyId}`}
                  className="inline-flex items-center gap-2 w-full justify-center sm:w-auto px-4 py-2.5 rounded-lg bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 transition-colors"
                  onClick={() => setInitialOfferModalOpen(false)}
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('negotiations.editProperty')}
                </Link>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default NegotiationOffers;
