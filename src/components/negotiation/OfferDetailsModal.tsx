import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NegotiationOffer, NegotiationParticipant } from '../../hooks/negotiations/useNegotiationData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { format } from 'date-fns';
import { formatCurrency, formatDate as formatDateUtil, formatDateTime } from '../../utils/format';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';
import {
  X,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Percent,
  TrendingUp,
  CalendarCheck,
  Timer,
  Zap,
  Copy,
  ChevronDown,
  ChevronUp,
  Code,
  Building2,
  Package,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

export type OfferDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  offer: NegotiationOffer | null;
  participants?: {
    buyer?: NegotiationParticipant;
    seller?: NegotiationParticipant;
    lawyer?: NegotiationParticipant;
    agent?: NegotiationParticipant;
  };
  property?: any; // Propiedad asociada a la oferta
};

// Componente JSON Viewer reutilizable
const JSONViewer: React.FC<{
  data: any;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultExpanded?: boolean;
}> = ({ data, title, icon: Icon, defaultExpanded = true }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-card rounded-xl border-2 border-border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={t('negotiations.details.copyJson')}
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && (
              <span className="text-xs text-green-600 font-medium">{t('negotiations.details.copied')}</span>
            )}
            <button
              onClick={handleDownload}
              className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title={t('negotiations.details.downloadJson')}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title={isExpanded ? t('negotiations.details.collapse') : t('negotiations.details.expand')}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="relative">
          <pre className="text-xs font-mono bg-gray-900 text-gray-100 p-6 overflow-x-auto max-h-96 overflow-y-auto">
            <code>{jsonString}</code>
          </pre>
          <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-gray-300 text-xs px-2 py-1 rounded">
            {t('negotiations.details.propertiesCount', { count: Object.keys(data).length })}
          </div>
        </div>
      )}
    </section>
  );
};

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  open,
  onClose,
  offer,
  participants,
  property
}) => {
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
  const [debugMode, setDebugMode] = useState(false);
  
  if (!offer) return null;

  const formatPrice = (price?: number | null) => {
    if (!price && price !== 0) return t('common.notSpecified');
    return formatCurrency(price);
  };

  const formatDateLong = (dateString?: string | null) => {
    if (!dateString) return t('common.notSpecified');
    return formatDateTime(dateString);
  };

  const formatDateShort = (dateString?: string | null) => {
    if (!dateString) return t('common.notSpecified');
    return formatDateUtil(dateString);
  };

  const getStatusConfig = (status: string, kind: string) => {
    const isCounter = kind === 'counter';
    const config = {
      offer: { labelKey: 'negotiations.status.offer', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      counter: { labelKey: 'negotiations.status.counter', color: 'bg-brand-sky/15 text-brand-sky border-brand-sky/20' },
      accepted: { labelKey: 'negotiations.status.accepted', color: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { labelKey: 'negotiations.status.rejected', color: 'bg-red-100 text-red-800 border-red-200' },
      pending: { labelKey: 'negotiations.status.pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      expired: { labelKey: 'negotiations.status.expired', color: 'bg-muted text-foreground border-border' }
    };

    const statusConfig = config[status as keyof typeof config] || config.pending;
    return {
      label: isCounter ? t('negotiations.counterOffer') : t(statusConfig.labelKey),
      color: statusConfig.color,
      icon: status === 'accepted' ? CheckCircle : status === 'rejected' ? XCircle : AlertCircle
    };
  };

  const getPaymentMethodLabel = (method?: string | null) => {
    if (!method) return t('common.notSpecified');
    return t(`negotiations.paymentMethods.${method}`, { defaultValue: method });
  };

  const price = offer.price ?? offer.payload?.price ?? null;
  const downPayment = offer.down_payment ?? offer.payload?.downPayment ?? null;
  const paymentMethod = offer.payment_method ?? offer.payload?.paymentMethod ?? null;
  const closingDate = offer.closing_date ?? offer.payload?.closingDate ?? null;
  const conditions = offer.conditions ?? offer.payload?.conditions ?? [];
  const message = offer.message ?? offer.payload?.message ?? null;
  const validUntil = offer.valid_until ?? null;
  const annualRate = offer.payload?.annualRate ?? null;
  const termMonths = offer.payload?.termMonths ?? null;
  const statusConfig = getStatusConfig(offer.status, offer.kind || 'offer');
  const StatusIcon = statusConfig.icon;

  // Preparar fechas para la línea de tiempo
  type TimelineItem = {
    date: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    type: string;
  };

  const timelineDates: TimelineItem[] = [
    {
      date: offer.created_at,
      label: t('negotiations.details.createdLabel'),
      description: t('negotiations.details.createdHint'),
      icon: FileText,
      color: 'blue',
      type: 'creation'
    },
    ...(closingDate ? [{
      date: closingDate,
      label: t('negotiations.details.closingDate'),
      description: t('negotiations.details.closingHint'),
      icon: CalendarCheck,
      color: 'green',
      type: 'closing'
    }] : []),
    ...(validUntil ? [{
      date: validUntil,
      label: t('negotiations.offer.validUntil'),
      description: t('negotiations.details.validUntilHint'),
      icon: Timer,
      color: 'yellow',
      type: 'expiry'
    }] : []),
    {
      date: offer.updated_at,
      label: t('negotiations.details.lastUpdate'),
      description: t('negotiations.details.lastUpdateHint'),
      icon: Zap,
      color: 'gray',
      type: 'update'
    }
  ];

  // Ordenar fechas cronológicamente
  timelineDates.sort((a, b) => 
    new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
  );

  // Cronograma ofrecido: pagos, entrega inmueble, firma escritura
  const paymentSchedule = offer.payload?.payment_schedule ?? offer.payload?.paymentSchedule ?? [];
  const conditionsList = Array.isArray(conditions) ? conditions : [];
  const conditionWithDate = (c: any) => typeof c === 'object' && c?.date;
  const escrituraCondition = conditionsList.find((c: any) => conditionWithDate(c) && (c.type === 'escritura_firma' || c.type === 'escritura'));
  const entregaCondition = conditionsList.find((c: any) => conditionWithDate(c) && (c.type === 'entrega_inmueble' || c.type === 'entrega'));

  type OfferedTimelineItem = { date: string; label: string; sublabel?: string; icon: React.ComponentType<{ className?: string }>; color: string };
  const offeredTimelineItems: OfferedTimelineItem[] = [];

  // Pagos del cronograma (prioridad si existe)
  (Array.isArray(paymentSchedule) ? paymentSchedule : []).forEach((p: any, i: number) => {
    if (p?.date) {
      offeredTimelineItems.push({
        date: p.date,
        label: p.description || t('negotiations.details.paymentN', { n: i + 1 }),
        sublabel: p.amount ? formatPrice(p.amount) : undefined,
        icon: DollarSign,
        color: 'green'
      });
    }
  });

  // Cuota inicial (solo si no hay cronograma explícito y hay closing)
  if (downPayment && downPayment > 0 && closingDate && offeredTimelineItems.length === 0) {
    offeredTimelineItems.push({
      date: closingDate,
      label: t('negotiations.details.downPaymentLabel'),
      sublabel: formatPrice(downPayment),
      icon: DollarSign,
      color: 'purple'
    });
  }

  // Firma de escritura pública (escritura_firma o closing_date)
  const escrituraDate = escrituraCondition?.date || closingDate;
  if (escrituraDate) {
    offeredTimelineItems.push({
      date: escrituraDate,
      label: t('negotiations.details.publicDeedSigning'),
      icon: FileText,
      color: 'blue'
    });
  }

  // Entrega del inmueble
  if (entregaCondition?.date) {
    offeredTimelineItems.push({
      date: entregaCondition.date,
      label: t('negotiations.details.propertyDelivery'),
      icon: Building2,
      color: 'green'
    });
  }

  // Si no hay nada específico, usar closing date como referencia
  if (offeredTimelineItems.length === 0 && closingDate) {
    offeredTimelineItems.push({
      date: closingDate,
      label: t('negotiations.details.closingDate'),
      sublabel: t('negotiations.details.closingDateHint'),
      icon: CalendarCheck,
      color: 'blue'
    });
  }

  offeredTimelineItems.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getTimelineColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 border-blue-600 text-blue-100',
      green: 'bg-green-500 border-green-600 text-green-100',
      yellow: 'bg-yellow-500 border-yellow-600 text-yellow-100',
      gray: 'bg-muted/300 border-gray-600 text-gray-100',
      purple: 'bg-purple-500 border-purple-600 text-gray-100'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  // Preparar datos JSON estructurados
  const financialData = {
    price: {
      value: price,
      formatted: formatPrice(price),
      source: price !== null ? (offer.price !== null ? 'direct' : 'payload') : null
    },
    down_payment: {
      value: downPayment,
      formatted: formatPrice(downPayment),
      percentage: price && downPayment ? ((downPayment / price) * 100).toFixed(2) + '%' : null,
      source: downPayment !== null ? (offer.down_payment !== null ? 'direct' : 'payload') : null
    },
    financing_amount: price && downPayment !== null ? {
      value: price - downPayment,
      formatted: formatPrice(price - downPayment)
    } : null,
    payment_method: {
      value: paymentMethod,
      label: getPaymentMethodLabel(paymentMethod),
      source: paymentMethod !== null ? (offer.payment_method !== null ? 'direct' : 'payload') : null
    },
    annual_rate: annualRate !== null ? {
      value: annualRate,
      percentage: (annualRate * 100).toFixed(2) + '%',
      source: 'payload'
    } : null,
    term_months: termMonths !== null ? {
      value: termMonths,
      source: 'payload'
    } : null,
    calculations: price && downPayment !== null && annualRate !== null && termMonths !== null ? {
      principal: price - downPayment,
      monthly_rate: annualRate / 12,
      monthly_payment: (() => {
        const principal = price - downPayment;
        const monthlyRate = annualRate / 12;
        if (monthlyRate === 0 || termMonths === 0) return principal / Math.max(termMonths, 1);
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
        const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
        return principal * (numerator / denominator);
      })(),
      total_payment: (() => {
        const principal = price - downPayment;
        const monthlyRate = annualRate / 12;
        if (monthlyRate === 0 || termMonths === 0) return principal;
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
        const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
        const monthly = principal * (numerator / denominator);
        return monthly * termMonths;
      })()
    } : null
  };

  const offerData = {
    id: offer.id,
    negotiation_id: offer.negotiation_id,
    kind: offer.kind,
    version: offer.version,
    parent_offer_id: offer.parent_offer_id,
    status: offer.status,
    created_at: offer.created_at,
    updated_at: offer.updated_at,
    valid_until: offer.valid_until,
    closing_date: closingDate,
    message: message,
    conditions: conditions,
    raw: {
      price: offer.price,
      down_payment: offer.down_payment,
      payment_method: offer.payment_method,
      closing_date: offer.closing_date,
      conditions: offer.conditions,
      message: offer.message
    },
    payload: offer.payload
  };

  const propertyData = property || {
    note: t('negotiations.details.propertyUnavailable')
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] w-[95vw] sm:!max-w-[90vw] sm:w-[90vw] md:!max-w-4xl lg:!max-w-5xl xl:!max-w-6xl 2xl:!max-w-7xl h-[90vh] sm:h-[92vh] max-h-[95vh] overflow-hidden p-0 m-0 flex flex-col">
        <DialogHeader className="px-6 pt-4 pb-3 border-b border-border bg-gradient-to-r from-brand-sky/10 via-card to-brand-gold/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-base font-semibold text-foreground">
                  {offer.kind === 'counter' ? t('negotiations.counterOffer') : t('negotiations.offer.title')}
                </DialogTitle>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </span>
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    debugMode 
                      ? 'bg-brand-navy text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  title={t('negotiations.details.debugMode')}
                >
                  {debugMode ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  Debug
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  v{offer.version || 1}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateLong(offer.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <span className="font-mono text-xs">{offer.id.slice(0, 8)}...</span>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Contenido principal con scroll */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 sm:p-6">
            {/* Columna principal - Información detallada */}
            <div className="lg:col-span-3 space-y-6">
              {/* Modo Debug: JSON Viewers */}
              {debugMode ? (
                <>
                  <JSONViewer data={financialData} title={t('negotiations.details.financialDetails')} icon={DollarSign} />
                  <JSONViewer data={propertyData} title={t('negotiations.details.propertyDetails')} icon={Building2} />
                  <JSONViewer data={offerData} title={t('negotiations.details.offerDetails')} icon={Package} defaultExpanded={false} />
                </>
              ) : (
                <>
                  {/* Vista normal - Detalles Financieros */}
                  <section className="bg-card rounded-lg p-3 border border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      {t('negotiations.details.financial')}
                      <button
                        onClick={() => {
                          console.log('💰 Financial Data:', financialData);
                          navigator.clipboard.writeText(JSON.stringify(financialData, null, 2));
                        }}
                        className="ml-auto text-[10px] px-1.5 py-0.5 bg-muted hover:bg-muted rounded text-muted-foreground font-medium flex items-center gap-0.5"
                        title={t('negotiations.details.copyJson')}
                      >
                        <Code className="w-2.5 h-2.5" />
                        JSON
                      </button>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                      <div className="bg-blue-50 rounded p-2 border border-blue-200">
                        <p className="text-[10px] text-blue-600 mb-0.5 uppercase">{t('negotiations.details.price')}</p>
                        <p className="text-xs font-bold text-blue-900">{formatPrice(price)}</p>
                      </div>
                      {downPayment !== null && (
                        <div className="bg-purple-50 rounded p-2 border border-purple-200">
                          <p className="text-[10px] text-purple-600 mb-0.5 uppercase">{t('negotiations.details.downPayment')}</p>
                          <p className="text-xs font-bold text-purple-900">{formatPrice(downPayment)}</p>
                          {price && downPayment && (
                            <p className="text-[9px] text-purple-600 mt-0.5">
                              {((downPayment / price) * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      )}
                      {price && downPayment !== null && (
                        <div className="bg-green-50 rounded p-2 border border-green-200">
                          <p className="text-[10px] text-green-600 mb-0.5 uppercase">{t('negotiations.details.toFinance')}</p>
                          <p className="text-xs font-bold text-green-900">{formatPrice(price - downPayment)}</p>
                        </div>
                      )}
                      <div className="bg-muted/30 rounded p-2 border border-border">
                        <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-0.5">
                          <CreditCard className="w-2.5 h-2.5" />
                          {t('negotiations.details.payment')}
                        </p>
                        <p className="text-xs font-semibold text-foreground truncate">{getPaymentMethodLabel(paymentMethod)}</p>
                      </div>
                      {annualRate !== null && (
                        <div className="bg-muted/30 rounded p-2 border border-border">
                          <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-0.5">
                            <Percent className="w-2.5 h-2.5" />
                            {t('negotiations.details.rate')}
                          </p>
                          <p className="text-xs font-semibold text-foreground">{(annualRate * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {termMonths !== null && (
                        <div className="bg-muted/30 rounded p-2 border border-border">
                          <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />
                            {t('negotiations.details.term')}
                          </p>
                          <p className="text-xs font-semibold text-foreground">{t('negotiations.details.termMonthsShort', { count: termMonths })}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Cronograma ofrecido: pagos, entrega, escritura */}
                  {offeredTimelineItems.length > 0 && (
                    <section className="bg-card rounded-lg p-3 border border-border">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <CalendarCheck className="w-3 h-3 text-green-600" />
                        {t('negotiations.details.offeredSchedule')}
                      </h3>
                      
                      <div className="relative">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 via-purple-200 to-blue-200 rounded-full"></div>
                        
                        <div className="space-y-2">
                          {offeredTimelineItems.map((item, index) => {
                            const Icon = item.icon;
                            const colorClass = getTimelineColor(item.color);
                            
                            return (
                              <div key={`offered-${index}`} className="relative flex items-start gap-2">
                                <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow ${colorClass}`}>
                                  <Icon className="w-3 h-3" />
                                </div>
                                
                                <div className="flex-1 pt-0.5">
                                  <div className="bg-muted/30 rounded p-2 border border-border">
                                    <h4 className="text-[10px] font-semibold text-foreground mb-0.5">{item.label}</h4>
                                    {item.sublabel && (
                                      <p className="text-[9px] text-muted-foreground mb-1">{item.sublabel}</p>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                      <Calendar className="w-2.5 h-2.5" />
                                      <span>{formatDateShort(item.date)}</span>
                                      <span className="text-muted-foreground ml-1">
                                        {format(new Date(item.date), 'HH:mm', { locale: dateLocale })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Mensaje */}
              {message && (
                <section className="bg-card rounded-lg p-3 border border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    {t('negotiations.offer.message')}
                  </h3>
                  <div className="bg-muted/30 rounded p-2 border border-border">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{message}</p>
                  </div>
                </section>
              )}

              {/* Condiciones */}
              {conditions && conditions.length > 0 && (
                <section className="bg-card rounded-lg p-3 border border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-purple-600" />
                    {t('negotiations.details.conditionsCount', { count: conditions.length })}
                  </h3>
                  <div className="space-y-1.5">
                    {conditions.map((condition: any, idx: number) => (
                      <div key={idx} className="bg-purple-50 rounded p-2 border border-purple-200">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">
                              {typeof condition === 'string' ? condition : JSON.stringify(condition)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Información Adicional */}
              {(offer.kind === 'counter' || offer.parent_offer_id) && (
                <section className="bg-muted/30 rounded-lg p-2 border border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-purple-600" />
                    {t('negotiations.details.additional')}
                  </h3>
                  {offer.kind === 'counter' && (
                    <p className="text-[10px] text-muted-foreground">
                      {t('negotiations.details.basedOnPrevious')}
                    </p>
                  )}
                  {offer.parent_offer_id && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {t('negotiations.details.parent')} <span className="font-mono text-[9px] bg-card px-1 py-0.5 rounded">{offer.parent_offer_id.slice(0, 8)}...</span>
                    </p>
                  )}
                </section>
              )}
            </div>

            {/* Columna lateral - Líneas de Tiempo */}
            <div className="lg:col-span-1 space-y-4">
              <section className="bg-card rounded-lg p-3 border border-border sticky top-2">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-blue-600" />
                  {t('negotiations.details.timeline')}
                </h3>
                
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-green-200 to-gray-200 rounded-full"></div>
                  
                  <div className="space-y-2">
                    {timelineDates.map((item, index) => {
                      const Icon = item.icon;
                      const colorClass = getTimelineColor(item.color);
                      
                      return (
                        <div key={`${item.type}-${index}`} className="relative flex items-start gap-2">
                          <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow ${colorClass}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          
                          <div className="flex-1 pt-0.5">
                            <div className="bg-muted/30 rounded p-2 border border-border">
                              <h4 className="text-[10px] font-semibold text-foreground mb-0.5">{item.label}</h4>
                              <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{formatDateShort(item.date)}</span>
                                <span className="text-muted-foreground ml-1">
                                  {format(new Date(item.date || ''), 'HH:mm', { locale: dateLocale })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="mt-0 pt-3 pb-3 px-4 border-t border-border bg-muted/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferDetailsModal;

