import React, { useState } from 'react';
import { NegotiationOffer, NegotiationParticipant } from '../../hooks/negotiations/useNegotiationData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  X,
  User,
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
    <section className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Copiar JSON"
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && (
              <span className="text-xs text-green-600 font-medium">¡Copiado!</span>
            )}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Descargar JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={isExpanded ? "Colapsar" : "Expandir"}
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
            {Object.keys(data).length} propiedades
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
  const [debugMode, setDebugMode] = useState(false);
  
  if (!offer) return null;

  const formatPrice = (price?: number | null) => {
    if (!price && price !== 0) return 'No especificado';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No especificado';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  const formatDateShort = (dateString?: string | null) => {
    if (!dateString) return 'No especificado';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  const getStatusConfig = (status: string, kind: string) => {
    const isCounter = kind === 'counter';
    const config = {
      offer: { label: 'Oferta', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      counter: { label: 'Contraoferta', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800 border-red-200' },
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };

    const statusConfig = config[status as keyof typeof config] || config.pending;
    return {
      label: isCounter ? 'Contraoferta' : statusConfig.label,
      color: statusConfig.color,
      icon: status === 'accepted' ? CheckCircle : status === 'rejected' ? XCircle : AlertCircle
    };
  };

  const getPaymentMethodLabel = (method?: string | null) => {
    const methods: Record<string, string> = {
      cash: 'Efectivo',
      financing: 'Financiamiento',
      crypto: 'Criptomoneda',
      mixed: 'Mixto',
      bank_transfer: 'Transferencia bancaria',
      installments: 'Cuotas'
    };
    return methods[method || ''] || method || 'No especificado';
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
      label: 'Creación de la Oferta',
      description: 'Fecha en que se creó la oferta',
      icon: FileText,
      color: 'blue',
      type: 'creation'
    },
    ...(closingDate ? [{
      date: closingDate,
      label: 'Fecha de Cierre',
      description: 'Fecha acordada para el cierre de la negociación',
      icon: CalendarCheck,
      color: 'green',
      type: 'closing'
    }] : []),
    ...(validUntil ? [{
      date: validUntil,
      label: 'Válida Hasta',
      description: 'Fecha de expiración de la oferta',
      icon: Timer,
      color: 'yellow',
      type: 'expiry'
    }] : []),
    {
      date: offer.updated_at,
      label: 'Última Actualización',
      description: 'Última modificación realizada',
      icon: Zap,
      color: 'gray',
      type: 'update'
    }
  ];

  // Ordenar fechas cronológicamente
  timelineDates.sort((a, b) => 
    new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
  );

  const getTimelineColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 border-blue-600 text-blue-100',
      green: 'bg-green-500 border-green-600 text-green-100',
      yellow: 'bg-yellow-500 border-yellow-600 text-yellow-100',
      gray: 'bg-gray-500 border-gray-600 text-gray-100'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  // Preparar datos JSON estructurados
  const authorData = {
    id: offer.author,
    role: offer.author_role,
    profile: offer.author_profile ? {
      id: offer.author_profile.id,
      name: offer.author_profile.name,
      email: offer.author_profile.email,
      phone: offer.author_profile.phone,
      avatar_url: offer.author_profile.avatar_url
    } : null,
    created_at: offer.created_at,
    updated_at: offer.updated_at
  };

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
    note: 'Información de propiedad no disponible en este contexto'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-screen max-w-[98vw] h-screen max-h-[98vh] overflow-hidden p-0 m-0">
        <DialogHeader className="px-6 pt-4 pb-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-purple-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-base font-semibold text-gray-900">
                  {offer.kind === 'counter' ? 'Contraoferta' : 'Oferta'}
                </DialogTitle>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </span>
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    debugMode 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title="Modo Debug"
                >
                  {debugMode ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  Debug
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-700">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  v{offer.version || 1}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(offer.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <span className="font-mono text-xs">{offer.id.slice(0, 8)}...</span>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Contenido principal con scroll */}
        <div className="overflow-y-auto max-h-[calc(98vh-100px)]">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 p-4">
            {/* Columna principal - Información detallada */}
            <div className="xl:col-span-3 space-y-6">
              {/* Modo Debug: JSON Viewers */}
              {debugMode ? (
                <>
                  <JSONViewer data={authorData} title="Información del Autor" icon={User} />
                  <JSONViewer data={financialData} title="Detalles Financieros" icon={DollarSign} />
                  <JSONViewer data={propertyData} title="Detalles de la Propiedad" icon={Building2} />
                  <JSONViewer data={offerData} title="Detalles Completos de la Oferta" icon={Package} defaultExpanded={false} />
                </>
              ) : (
                <>
                  {/* Vista normal - Información del Autor */}
                  <section className="bg-white rounded-lg p-3 border border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="w-3 h-3 text-blue-600" />
                      Autor
                      <button
                        onClick={() => {
                          console.log('📋 Author Data:', authorData);
                          navigator.clipboard.writeText(JSON.stringify(authorData, null, 2));
                        }}
                        className="ml-auto text-[10px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 font-medium flex items-center gap-0.5"
                        title="Copiar JSON"
                      >
                        <Code className="w-2.5 h-2.5" />
                        JSON
                      </button>
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] text-gray-700 mb-0.5 uppercase font-medium">Nombre</p>
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {offer.author_profile?.name || offer.author_profile?.email || 'N/A'}
                        </p>
                      </div>
                      {offer.author_role && (
                        <div>
                          <p className="text-[10px] text-gray-700 mb-0.5 uppercase font-medium">Rol</p>
                          <p className="text-xs font-medium text-gray-900 capitalize">
                            {offer.author_role === 'buyer' ? 'Comprador' :
                             offer.author_role === 'seller' ? 'Vendedor' :
                             offer.author_role === 'lawyer' ? 'Abogado' :
                             offer.author_role === 'agent' ? 'Agente' : offer.author_role}
                          </p>
                        </div>
                      )}
                      {offer.author_profile?.email && (
                        <div>
                          <p className="text-[10px] text-gray-700 mb-0.5 uppercase font-medium">Email</p>
                          <p className="text-xs font-medium text-gray-900 truncate">{offer.author_profile.email}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Vista normal - Detalles Financieros */}
                  <section className="bg-white rounded-lg p-3 border border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      Financiero
                      <button
                        onClick={() => {
                          console.log('💰 Financial Data:', financialData);
                          navigator.clipboard.writeText(JSON.stringify(financialData, null, 2));
                        }}
                        className="ml-auto text-[10px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 font-medium flex items-center gap-0.5"
                        title="Copiar JSON"
                      >
                        <Code className="w-2.5 h-2.5" />
                        JSON
                      </button>
                    </h3>
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      <div className="bg-blue-50 rounded p-2 border border-blue-200">
                        <p className="text-[10px] text-blue-600 mb-0.5 uppercase">Precio</p>
                        <p className="text-xs font-bold text-blue-900">{formatPrice(price)}</p>
                      </div>
                      {downPayment !== null && (
                        <div className="bg-purple-50 rounded p-2 border border-purple-200">
                          <p className="text-[10px] text-purple-600 mb-0.5 uppercase">Inicial</p>
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
                          <p className="text-[10px] text-green-600 mb-0.5 uppercase">Financiar</p>
                          <p className="text-xs font-bold text-green-900">{formatPrice(price - downPayment)}</p>
                        </div>
                      )}
                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <p className="text-[10px] text-gray-600 mb-0.5 flex items-center gap-0.5">
                          <CreditCard className="w-2.5 h-2.5" />
                          Pago
                        </p>
                        <p className="text-xs font-semibold text-gray-900 truncate">{getPaymentMethodLabel(paymentMethod)}</p>
                      </div>
                      {annualRate !== null && (
                        <div className="bg-gray-50 rounded p-2 border border-gray-200">
                          <p className="text-[10px] text-gray-600 mb-0.5 flex items-center gap-0.5">
                            <Percent className="w-2.5 h-2.5" />
                            Tasa
                          </p>
                          <p className="text-xs font-semibold text-gray-900">{(annualRate * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {termMonths !== null && (
                        <div className="bg-gray-50 rounded p-2 border border-gray-200">
                          <p className="text-[10px] text-gray-600 mb-0.5 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />
                            Plazo
                          </p>
                          <p className="text-xs font-semibold text-gray-900">{termMonths}m</p>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* Mensaje */}
              {message && (
                <section className="bg-white rounded-lg p-3 border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-3 h-3 text-gray-600" />
                    Mensaje
                  </h3>
                  <div className="bg-gray-50 rounded p-2 border border-gray-200">
                    <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{message}</p>
                  </div>
                </section>
              )}

              {/* Condiciones */}
              {conditions && conditions.length > 0 && (
                <section className="bg-white rounded-lg p-3 border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-purple-600" />
                    Condiciones ({conditions.length})
                  </h3>
                  <div className="space-y-1.5">
                    {conditions.map((condition: any, idx: number) => (
                      <div key={idx} className="bg-purple-50 rounded p-2 border border-purple-200">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-900">
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
                <section className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-purple-600" />
                    Adicional
                  </h3>
                  {offer.kind === 'counter' && (
                    <p className="text-[10px] text-gray-600">
                      Contraoferta basada en oferta anterior
                    </p>
                  )}
                  {offer.parent_offer_id && (
                    <p className="text-[10px] text-gray-600 mt-1">
                      Padre: <span className="font-mono text-[9px] bg-white px-1 py-0.5 rounded">{offer.parent_offer_id.slice(0, 8)}...</span>
                    </p>
                  )}
                </section>
              )}
            </div>

            {/* Columna lateral - Línea de Tiempo */}
            <div className="xl:col-span-1">
              <section className="bg-white rounded-lg p-3 border border-gray-200 sticky top-2">
                <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-blue-600" />
                  Timeline
                </h3>
                
                <div className="relative">
                  {/* Línea vertical de la timeline */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-green-200 to-gray-200 rounded-full"></div>
                  
                  <div className="space-y-2">
                    {timelineDates.map((item, index) => {
                      const Icon = item.icon;
                      const colorClass = getTimelineColor(item.color);
                      
                      return (
                        <div key={`${item.type}-${index}`} className="relative flex items-start gap-2">
                          {/* Ícono en la línea de tiempo */}
                          <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow ${colorClass}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          
                          {/* Contenido */}
                          <div className="flex-1 pt-0.5">
                            <div className="bg-gray-50 rounded p-2 border border-gray-200">
                              <h4 className="text-[10px] font-semibold text-gray-900 mb-0.5">{item.label}</h4>
                              <div className="flex items-center gap-1 text-[10px] font-medium text-gray-700">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{formatDateShort(item.date)}</span>
                                <span className="text-gray-700 ml-1">
                                  {format(new Date(item.date || ''), "HH:mm", { locale: es })}
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

        <div className="mt-0 pt-3 pb-3 px-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferDetailsModal;

