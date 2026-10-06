import { getIntlLocale } from '../../i18n';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  CreditCard,
  Settings,
  Info,
  Lightbulb
} from 'lucide-react';
import { NegotiationRules } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface NegotiationRulesConfigProps {
  propertyId: string;
  onRulesSaved?: (rules: NegotiationRules) => void;
  initialRules?: NegotiationRules;
}

export const NegotiationRulesConfig: React.FC<NegotiationRulesConfigProps> = ({
  propertyId,
  onRulesSaved,
  initialRules
}) => {
  const [rules, setRules] = useState<Partial<NegotiationRules>>({
    propertyId,
    minPrice: undefined,
    maxClosingDays: undefined,
    requiredPaymentMethods: [],
    autoRejectEnabled: true,
    manualReviewThreshold: false,
    specialConditions: []
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load existing rules
  useEffect(() => {
    if (initialRules) {
      setRules(initialRules);
    } else {
      loadExistingRules();
    }
  }, [propertyId, initialRules]);

  const loadExistingRules = async () => {
    try {
      const { data, error } = await supabase
        .from('negotiation_rules')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error loading rules:', error);
        return;
      }

      if (data) {
        setRules(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('negotiation_rules')
        .upsert({
          ...rules,
          property_id: propertyId,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving rules:', error);
        return;
      }

      if (onRulesSaved && data) {
        onRulesSaved(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const currentMethods = rules.requiredPaymentMethods || [];
    if (checked) {
      setRules({
        ...rules,
        requiredPaymentMethods: [...currentMethods, method]
      });
    } else {
      setRules({
        ...rules,
        requiredPaymentMethods: currentMethods.filter(m => m !== method)
      });
    }
  };

  const addSpecialCondition = () => {
    const newCondition = prompt('Ingresa una condición especial:');
    if (newCondition) {
      setRules({
        ...rules,
        specialConditions: [...(rules.specialConditions || []), newCondition]
      });
    }
  };

  const removeSpecialCondition = (index: number) => {
    setRules({
      ...rules,
      specialConditions: rules.specialConditions?.filter((_, i) => i !== index) || []
    });
  };

  const generatePreviewMessage = () => {
    const messages = [];
    
    if (rules.minPrice) {
      messages.push(`Ofertas menores a $${rules.minPrice.toLocaleString(getIntlLocale())} serán rechazadas automáticamente`);
    }
    
    if (rules.maxClosingDays) {
      messages.push(`Solo se aceptan cierres en máximo ${rules.maxClosingDays} días`);
    }
    
    if (rules.requiredPaymentMethods && rules.requiredPaymentMethods.length > 0) {
      messages.push(`Métodos de pago aceptados: ${rules.requiredPaymentMethods.join(', ')}`);
    }
    
    if (rules.specialConditions && rules.specialConditions.length > 0) {
      messages.push(`Condiciones especiales: ${rules.specialConditions.join(', ')}`);
    }

    return messages;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Condiciones de Negociación</h2>
          <p className="text-muted-foreground">Configura reglas automáticas para filtrar ofertas</p>
        </div>
      </div>

      {/* Auto-reject toggle */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Checkbox
            id="auto-reject"
            checked={rules.autoRejectEnabled}
            onCheckedChange={(checked) => setRules({...rules, autoRejectEnabled: !!checked})}
          />
          <Label htmlFor="auto-reject" className="text-base font-medium">
            Habilitar rechazo automático de ofertas
          </Label>
        </div>
        <p className="text-sm text-muted-foreground ml-6">
          Las ofertas que no cumplan tus condiciones serán rechazadas automáticamente con una explicación educativa para el comprador.
        </p>
      </Card>

      {rules.autoRejectEnabled && (
        <div className="space-y-6">
          {/* Price Rules */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Precio Mínimo</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="min-price">Precio mínimo aceptable (COP)</Label>
                <Input
                  id="min-price"
                  type="number"
                  value={rules.minPrice || ''}
                  onChange={(e) => setRules({...rules, minPrice: e.target.value ? parseInt(e.target.value) : undefined})}
                  placeholder="Ej: 450000000"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Las ofertas por debajo de este monto serán rechazadas automáticamente
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Method Rules */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Métodos de Pago Aceptados</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Selecciona los métodos de pago que aceptas. Las ofertas con otros métodos serán rechazadas.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'cash', label: 'Contado' },
                  { value: 'financing', label: 'Financiación' },
                  { value: 'crypto', label: 'Criptomonedas' },
                  { value: 'mixed', label: 'Mixto' }
                ].map((method) => (
                  <div key={method.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={method.value}
                      checked={rules.requiredPaymentMethods?.includes(method.value) || false}
                      onCheckedChange={(checked) => handlePaymentMethodChange(method.value, !!checked)}
                    />
                    <Label htmlFor={method.value} className="text-sm">
                      {method.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Closing Time Rules */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Tiempo de Cierre</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="max-closing-days">Máximo días para cierre</Label>
                <Input
                  id="max-closing-days"
                  type="number"
                  value={rules.maxClosingDays || ''}
                  onChange={(e) => setRules({...rules, maxClosingDays: e.target.value ? parseInt(e.target.value) : undefined})}
                  placeholder="Ej: 30"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ofertas que propongan cierres en más días serán rechazadas
                </p>
              </div>
            </div>
          </Card>

          {/* Special Conditions */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Condiciones Especiales</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Define condiciones específicas que deben cumplir las ofertas
              </p>
              
              <div className="space-y-2">
                {rules.specialConditions?.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm flex-1">{condition}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecialCondition(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={addSpecialCondition}
                className="w-full"
              >
                + Agregar Condición Especial
              </Button>
            </div>
          </Card>

          {/* Manual Review Threshold */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Checkbox
                id="manual-review"
                checked={rules.manualReviewThreshold}
                onCheckedChange={(checked) => setRules({...rules, manualReviewThreshold: !!checked})}
              />
              <Label htmlFor="manual-review" className="text-base font-medium">
                Revisión manual para ofertas cercanas al límite
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              Las ofertas que estén cerca de tus límites (ej: 95% del precio mínimo) serán enviadas para tu revisión en lugar de ser rechazadas automáticamente.
            </p>
          </Card>

          {/* Preview */}
          <Card className="p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Vista Previa</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Los compradores verán este mensaje si su oferta no cumple tus condiciones:
              </p>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Gracias por tu interés en esta propiedad.</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Sin embargo, tu oferta no cumple una de las condiciones mínimas establecidas por el vendedor:
                </p>
                <ul className="text-sm space-y-1">
                  {generatePreviewMessage().map((message, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-500">•</span>
                      <span>{message}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Te invitamos a enviar una nueva oferta ajustada.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? 'Ocultar' : 'Mostrar'} Vista Previa
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? 'Guardando...' : 'Guardar Reglas'}
        </Button>
      </div>
    </div>
  );
};
