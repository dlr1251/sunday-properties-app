import React from 'react';
import { Button } from '../../../ui/button';
import { PropertyFormData } from '../PropertyWizard';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewStepProps {
  data: PropertyFormData;
  onComplete: () => void;
  isDarkMode?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  onComplete,
  isDarkMode = true
}) => {
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'Apartamento',
      house: 'Casa',
      townhouse: 'Casa de ciudad',
      office: 'Oficina',
      commercial: 'Local comercial'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-950 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center">
          <CheckCircle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`font-semibold ${textPrimary}`}>¡Listo para publicar!</h3>
        </div>
        <p className={`text-sm mt-1 ${textSecondary}`}>
          Revise toda la información antes de enviar su propiedad para revisión.
        </p>
      </div>

      {/* Property Summary */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${cardClasses} p-6 rounded-lg`}>
        <div>
          <h4 className={`font-semibold mb-4 ${textPrimary}`}>Detalles de la Propiedad</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={textSecondary}>Título:</span>
              <span className={textPrimary}>{data.title}</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>Tipo:</span>
              <span className={textPrimary}>{getPropertyTypeLabel(data.property_type)}</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>Precio:</span>
              <span className={`font-semibold ${textPrimary}`}>{formatCurrency(data.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>Habitaciones:</span>
              <span className={textPrimary}>{data.bedrooms}</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>Baños:</span>
              <span className={textPrimary}>{data.bathrooms}</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>Área:</span>
              <span className={textPrimary}>{data.area} m²</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className={`font-semibold mb-4 ${textPrimary}`}>Ubicación</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className={textSecondary}>Dirección:</span>
              <p className={textPrimary}>{data.address}</p>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>Barrio:</span>
              <span className={textPrimary}>{data.neighborhood}</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>Ciudad:</span>
              <span className={textPrimary}>{data.city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Media Summary */}
      <div className={`${cardClasses} p-6 rounded-lg`}>
        <h4 className={`font-semibold mb-4 ${textPrimary}`}>Archivos Multimedia</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className={textSecondary}>Fotos:</span>
            <span className={textPrimary}>{data.images.length} archivos</span>
          </div>
          <div className="flex justify-between">
            <span className={textSecondary}>Videos:</span>
            <span className={textPrimary}>{data.videos.length} archivos</span>
          </div>
          <div className="flex justify-between">
            <span className={textSecondary}>Tour Virtual:</span>
            <span className={textPrimary}>{data.virtual_tour ? 'Sí' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Documents Summary */}
      <div className={`${cardClasses} p-6 rounded-lg`}>
        <h4 className={`font-semibold mb-4 ${textPrimary}`}>Documentos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className={textSecondary}>Propiedad:</span>
            <span className={textPrimary}>{data.ownership_documents.length} archivos</span>
          </div>
          <div className="flex justify-between">
            <span className={textSecondary}>Legales:</span>
            <span className={textPrimary}>{data.legal_documents.length} archivos</span>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className={`${cardClasses} p-6 rounded-lg`}>
        <h4 className={`font-semibold mb-4 ${textPrimary}`}>Opciones de Pago</h4>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center">
            <span className={textSecondary}>Cripto:</span>
            <span className={`ml-2 ${textPrimary}`}>{data.accepts_crypto ? '✅' : '❌'}</span>
          </div>
          <div className="flex items-center">
            <span className={textSecondary}>Financiamiento:</span>
            <span className={`ml-2 ${textPrimary}`}>{data.financing ? '✅' : '❌'}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-start">
          <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <div>
            <h4 className={`font-semibold mb-2 ${textPrimary}`}>Términos y Condiciones</h4>
            <p className={`text-sm ${textSecondary} mb-4`}>
              Al publicar esta propiedad, acepto que:
            </p>
            <ul className={`text-sm space-y-1 ${textSecondary} ml-4`}>
              <li>• Todos los documentos serán verificados por nuestros abogados</li>
              <li>• La propiedad se publicará solo después de la aprobación</li>
              <li>• Me comprometo a proporcionar información veraz y actualizada</li>
              <li>• Los costos de transacción serán responsabilidad del comprador</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onComplete}
          className={`px-8 py-3 text-lg ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Enviar para Revisión
        </Button>
      </div>
    </div>
  );
};
