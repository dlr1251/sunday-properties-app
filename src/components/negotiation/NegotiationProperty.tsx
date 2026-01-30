import React, { useState } from 'react';
import { NegotiationProperty } from '../../hooks/negotiations/useNegotiationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileText, Home, Wrench } from 'lucide-react';

export type NegotiationPropertyProps = {
  property?: NegotiationProperty;
  className?: string;
};

export const NegotiationProperty: React.FC<NegotiationPropertyProps> = ({
  property,
  className
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  if (!property) {
    return (
      <section className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className ?? ''}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Propiedad</h2>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div className="text-sm font-medium text-gray-900 mt-2">No hay información de propiedad</div>
          <div className="text-sm text-gray-600 mt-1">La información de la propiedad aparecerá aquí cuando esté disponible</div>
        </div>
      </section>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'Apartamento',
      house: 'Casa',
      office: 'Oficina',
      commercial: 'Local comercial',
      land: 'Terreno',
      townhouse: 'Casa adosada'
    };
    return types[type] || type;
  };

  return (
    <section className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className ?? ''}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Propiedad</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Imagen de la propiedad */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[selectedImageIndex]}
                alt={property.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-property.jpg';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
          </div>

          {/* Miniaturas de imágenes */}
          {property.images && property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.images.slice(0, 5).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-property.jpg';
                    }}
                  />
                </button>
              ))}
              {property.images.length > 5 && (
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 border-2 border-gray-200">
                  +{property.images.length - 5}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información básica */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {property.address}, {property.city}
            </div>
          </div>

          {/* Precio */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Precio</div>
            <div className="text-2xl font-bold text-blue-900">{formatPrice(property.price)}</div>
            {property.minimum_offer_price && (
              <div className="text-xs text-blue-700 mt-1">
                Oferta mínima: {formatPrice(property.minimum_offer_price)}
              </div>
            )}
          </div>

          {/* Detalles principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Área</div>
              <div className="text-lg font-semibold text-gray-900">{property.area} m²</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Tipo</div>
              <div className="text-lg font-semibold text-gray-900">{getPropertyTypeLabel(property.property_type)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas con información detallada */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <Home className="w-4 h-4 mr-2" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="technical">
            <Wrench className="w-4 h-4 mr-2" />
            Datos Técnicos
          </TabsTrigger>
        </TabsList>

        {/* Pestaña: Información General */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Habitaciones</span>
              <span className="font-semibold text-gray-900">{property.bedrooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Baños</span>
              <span className="font-semibold text-gray-900">{property.bathrooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Parqueaderos</span>
              <span className="font-semibold text-gray-900">{property.parking_spaces || property.parking || 0}</span>
            </div>
            {property.year_built && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Año construcción</span>
                <span className="font-semibold text-gray-900">{property.year_built}</span>
              </div>
            )}
            {property.strata_fee && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Administración</span>
                <span className="font-semibold text-gray-900">{formatPrice(property.strata_fee)}</span>
              </div>
            )}
            {property.monthly_costs && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Costos mensuales</span>
                <span className="font-semibold text-gray-900">{formatPrice(property.monthly_costs)}</span>
              </div>
            )}
          </div>

          {property.description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Descripción</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {property.features && property.features.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Características</h4>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {property.registration_number && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="text-sm text-yellow-800 font-medium">Matrícula inmobiliaria</div>
                  <div className="text-sm text-yellow-700">{property.registration_number}</div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Pestaña: Documentos */}
        <TabsContent value="documents" className="mt-4">
          {property.legal_documents && property.legal_documents.length > 0 ? (
            <div className="space-y-3">
              {property.legal_documents.map((docUrl, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Documento {index + 1}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {docUrl}
                      </div>
                    </div>
                  </div>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <div className="text-sm font-medium text-gray-900">No hay documentos</div>
              <div className="text-sm text-gray-600 mt-1">Los documentos legales aparecerán aquí cuando estén disponibles</div>
            </div>
          )}
        </TabsContent>

        {/* Pestaña: Datos Técnicos */}
        <TabsContent value="technical" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.neighborhood && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Barrio</span>
                <span className="font-semibold text-gray-900">{property.neighborhood}</span>
              </div>
            )}
            {property.state && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Departamento</span>
                <span className="font-semibold text-gray-900">{property.state}</span>
              </div>
            )}
            {property.floor !== null && property.floor !== undefined && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Piso</span>
                <span className="font-semibold text-gray-900">{property.floor}</span>
              </div>
            )}
            {property.total_floors && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total de pisos</span>
                <span className="font-semibold text-gray-900">{property.total_floors}</span>
              </div>
            )}
            {property.strata && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Estrato</span>
                <span className="font-semibold text-gray-900">{property.strata}</span>
              </div>
            )}
            {property.financing !== null && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Financiación</span>
                <span className="font-semibold text-gray-900">{property.financing ? 'Sí' : 'No'}</span>
              </div>
            )}
            {property.accepts_crypto !== null && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Acepta cripto</span>
                <span className="font-semibold text-gray-900">{property.accepts_crypto ? 'Sí' : 'No'}</span>
              </div>
            )}
            {property.coordinates && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg md:col-span-2">
                <span className="text-sm text-gray-600">Coordenadas</span>
                <span className="font-semibold text-gray-900">
                  {property.coordinates.lat.toFixed(6)}, {property.coordinates.lng.toFixed(6)}
                </span>
              </div>
            )}
            {property.virtual_tour && (
              <div className="md:col-span-2">
                <a
                  href={property.virtual_tour}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">Tour Virtual</span>
                </a>
              </div>
            )}
            {property.video && (
              <div className="md:col-span-2">
                <a
                  href={property.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-900">Video</span>
                </a>
              </div>
            )}
            {property.floor_plan && (
              <div className="md:col-span-2">
                <a
                  href={property.floor_plan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-green-900">Plano</span>
                </a>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default NegotiationProperty;
