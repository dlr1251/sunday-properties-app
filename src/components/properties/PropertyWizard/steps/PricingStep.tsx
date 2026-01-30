import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Checkbox } from '../../../ui/checkbox';
import { Textarea } from '../../../ui/textarea';
import { PropertyFormData } from '../PropertyWizard';

interface PricingStepProps {
  data: PropertyFormData;
  onUpdate: (updates: Partial<PropertyFormData>) => void;
  isDarkMode?: boolean;
}

export const PricingStep: React.FC<PricingStepProps> = ({
  data,
  onUpdate,
  isDarkMode = true
}) => {
  const inputClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : '';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Price */}
        <div>
          <Label htmlFor="price" className={textPrimary}>Precio Principal (COP) *</Label>
          <Input
            id="price"
            type="number"
            value={data.price || ''}
            onChange={(e) => onUpdate({ price: parseInt(e.target.value) || 0 })}
            placeholder="Ej: 350000000"
            className={`mt-1 ${inputClasses}`}
            required
          />
        </div>

        {/* Minimum Offer Price */}
        <div>
          <Label htmlFor="minimum_offer_price" className={textPrimary}>Precio Mínimo de Oferta (COP)</Label>
          <Input
            id="minimum_offer_price"
            type="number"
            value={data.minimum_offer_price || ''}
            onChange={(e) => onUpdate({ minimum_offer_price: parseInt(e.target.value) || undefined })}
            placeholder="Opcional: precio mínimo aceptable"
            className={`mt-1 ${inputClasses}`}
          />
        </div>

        {/* Monthly Costs */}
        <div>
          <Label htmlFor="monthly_costs" className={textPrimary}>Costos Mensuales (COP)</Label>
          <Input
            id="monthly_costs"
            type="number"
            value={data.monthly_costs || ''}
            onChange={(e) => onUpdate({ monthly_costs: parseInt(e.target.value) || undefined })}
            placeholder="Ej: administración, predial"
            className={`mt-1 ${inputClasses}`}
          />
        </div>

        {/* Visit Price */}
        <div>
          <Label htmlFor="visit_price" className={textPrimary}>Precio de Visita (COP)</Label>
          <Input
            id="visit_price"
            type="number"
            value={data.visit_price}
            onChange={(e) => onUpdate({ visit_price: parseInt(e.target.value) || 49000 })}
            placeholder="Ej: 49000"
            className={`mt-1 ${inputClasses}`}
          />
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${textPrimary}`}>Opciones de Pago</h3>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="accepts_crypto"
            checked={data.accepts_crypto}
            onCheckedChange={(checked) => onUpdate({ accepts_crypto: !!checked })}
          />
          <Label htmlFor="accepts_crypto" className={textPrimary}>Acepta criptomonedas</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="financing"
            checked={data.financing}
            onCheckedChange={(checked) => onUpdate({ financing: !!checked })}
          />
          <Label htmlFor="financing" className={textPrimary}>Financiamiento disponible</Label>
        </div>
      </div>

      {/* Negotiation Conditions */}
      <div>
        <Label htmlFor="conditions" className={textPrimary}>Condiciones de Negociación</Label>
        <Textarea
          id="conditions"
          value={data.conditions.join('\n')}
          onChange={(e) => onUpdate({ conditions: e.target.value.split('\n').filter(c => c.trim()) })}
          placeholder="Condiciones especiales para la negociación (una por línea):
- Solo ofertas en efectivo
- Negociable con muebles incluidos
- Documentos al día"
          className={`mt-1 min-h-24 ${inputClasses}`}
        />
        <p className={`text-sm mt-1 ${textSecondary}`}>
          Especifique cualquier condición especial para la negociación
        </p>
      </div>
    </div>
  );
};
