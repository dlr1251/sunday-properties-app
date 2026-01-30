import React, { useState } from 'react';
import { NegotiationOffer, NegotiationParticipant } from '../../hooks/negotiations/useNegotiationData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, Clock, User, DollarSign, FileText, Calendar } from 'lucide-react';
import { OfferDetailsModal } from './OfferDetailsModal';

export type NegotiationOffersProps = {
  offers?: NegotiationOffer[];
  participants?: {
    buyer?: NegotiationParticipant;
    seller?: NegotiationParticipant;
    lawyer?: NegotiationParticipant;
    agent?: NegotiationParticipant;
  };
  property?: any;
  className?: string;
};

export const NegotiationOffers: React.FC<NegotiationOffersProps> = ({
  offers = [],
  participants,
  property,
  className
}) => {
  const [modalOffer, setModalOffer] = useState<NegotiationOffer | null>(null);

  const formatPrice = (price?: number) => {
    if (!price) return 'No especificado';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return `Hace ${Math.floor(diffInDays / 30)} meses`;
  };

  const getStatusBadge = (status: string, kind: string) => {
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
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
        {isCounter ? 'Contraoferta' : statusConfig.label}
      </span>
    );
  };

  // Ordenar ofertas por fecha (más antiguas primero para timeline)
  const sortedOffers = [...offers].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (!offers || offers.length === 0) {
    return (
      <section className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className ?? ''}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ofertas y contraofertas</h2>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="text-sm font-medium text-gray-900 mt-2">No hay ofertas todavía</div>
          <div className="text-sm text-gray-600 mt-1">Las ofertas aparecerán aquí cuando se envíen</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-8 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ofertas y contraofertas</h2>
          <p className="text-sm text-gray-500 mt-1">Historial completo de ofertas y negociaciones</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <div className="text-lg font-semibold text-blue-900">{offers.length}</div>
          <div className="text-xs text-blue-600">oferta{offers.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Datatable con Timeline - Maximizado */}
      <div className="overflow-x-auto -mx-6 lg:-mx-8">
        <div className="inline-block min-w-full align-middle px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Autor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Cuota Inicial</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Método Pago</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Fecha Cierre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Condiciones</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOffers.map((offer, index) => {
                const price = offer.price ?? offer.payload?.price ?? null;
                const downPayment = offer.down_payment ?? offer.payload?.downPayment ?? null;
                const paymentMethod = offer.payment_method ?? offer.payload?.paymentMethod ?? null;
                const closingDate = offer.closing_date ?? offer.payload?.closingDate ?? null;
                const conditions = offer.conditions ?? offer.payload?.conditions ?? [];
                const isLatest = index === sortedOffers.length - 1;

                return (
                  <React.Fragment key={offer.id}>
                    <tr
                      className={`hover:bg-gray-50 cursor-pointer transition-all ${isLatest ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50/30' : ''}`}
                      onClick={() => setModalOffer(offer)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isLatest && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Última
                          </span>
                        )}
                        <div>
                          <div className="text-sm text-gray-900">{formatDate(offer.created_at)}</div>
                          <div className="text-xs text-gray-500">{getRelativeTime(offer.created_at)}</div>
                        </div>
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {offer.author_profile?.name || offer.author_profile?.email || 'Usuario desconocido'}
                            </div>
                            {offer.author_role && (
                              <div className="text-xs text-gray-500 capitalize">
                                {offer.author_role === 'buyer' ? 'Comprador' : 
                                 offer.author_role === 'seller' ? 'Vendedor' : 
                                 offer.author_role === 'lawyer' ? 'Abogado' : 
                                 offer.author_role === 'agent' ? 'Agente' : offer.author_role}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-500">v{offer.version || 1}</span>
                          {offer.kind === 'counter' && (
                            <ArrowRight className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-bold text-gray-900">{formatPrice(price)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{downPayment ? formatPrice(downPayment) : '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 capitalize">{paymentMethod || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {closingDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(closingDate).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {conditions && conditions.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{conditions.length} condición{conditions.length !== 1 ? 'es' : ''}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(offer.status, offer.kind || 'offer')}
                      </td>
                  </tr>
                    {/* Línea de timeline */}
                    {index < sortedOffers.length - 1 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-0">
                          <div className="flex items-center justify-center h-6">
                            <div className="w-px h-full bg-gray-300"></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles de Oferta */}
      <OfferDetailsModal
        open={modalOffer !== null}
        onClose={() => setModalOffer(null)}
        offer={modalOffer}
        participants={participants}
        property={property}
      />
    </section>
  );
};

export default NegotiationOffers;
