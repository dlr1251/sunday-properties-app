import React from 'react';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Search } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';

export const Step2Discovery: React.FC = () => {
  const { formData, setFormData } = useVerificationForm();

  const discoveryOptions = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'google', label: 'Google Search' },
    { value: 'real_estate_website', label: 'Sitio web inmobiliario' },
    { value: 'friend_referral', label: 'Referencia de amigo' },
    { value: 'agent_referral', label: 'Referencia de agente' },
    { value: 'other', label: 'Otro' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Search className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">¿Cómo nos encontraste?</h3>
        <p className="text-muted-foreground">Ayúdanos a conocerte mejor</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            ¿Cómo nos encontraste? *
          </Label>
          <div className="space-y-2 mt-2">
            {discoveryOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`discovery-${option.value}`}
                  checked={formData.how_did_you_find_us?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = formData.how_did_you_find_us || [];
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        how_did_you_find_us: [...currentValues, option.value]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        how_did_you_find_us: currentValues.filter(v => v !== option.value)
                      }));
                    }
                  }}
                />
                <Label htmlFor={`discovery-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            ¿Qué quieres hacer? * (puedes seleccionar varias opciones)
          </Label>
          <div className="space-y-2 mt-2">
            {[
              { value: 'buy', label: 'Comprar propiedades' },
              { value: 'sell', label: 'Vender propiedades' },
              { value: 'invest', label: 'Invertir en propiedades' },
              { value: 'represent', label: 'Representar a otros' },
              { value: 'consult', label: 'Consultar información' },
              { value: 'other', label: 'Otro' },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`purpose-${option.value}`}
                  checked={formData.what_do_you_want_to_do?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = formData.what_do_you_want_to_do || [];
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        what_do_you_want_to_do: [...currentValues, option.value]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        what_do_you_want_to_do: currentValues.filter(v => v !== option.value)
                      }));
                    }
                  }}
                />
                <Label htmlFor={`purpose-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
