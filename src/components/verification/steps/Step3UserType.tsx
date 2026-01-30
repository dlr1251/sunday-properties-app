import React from 'react';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { User, FileText } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';

export const Step3UserType: React.FC = () => {
  const { formData, setFormData } = useVerificationForm();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Tipo de Usuario</h3>
        <p className="text-muted-foreground">¿Eres dueño directo o intermediario?</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">¿Eres el dueño directo de la propiedad?</Label>
          <div className="space-y-3 mt-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="owner-yes"
                name="is_owner"
                checked={formData.is_owner}
                onChange={() => setFormData(prev => ({ ...prev, is_owner: true }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="owner-yes" className="text-sm">
                Sí, soy el dueño directo
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="owner-no"
                name="is_owner"
                checked={!formData.is_owner}
                onChange={() => setFormData(prev => ({ ...prev, is_owner: false }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="owner-no" className="text-sm">
                No, soy intermediario/agente
              </Label>
            </div>
          </div>
        </div>

        {!formData.is_owner && (
          <div className="border-t pt-6">
            <Label className="flex items-center gap-2 text-base font-medium">
              <FileText className="h-4 w-4" />
              Documentación adicional requerida
            </Label>
            <div className="mt-3 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_poa"
                  checked={formData.has_poa}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_poa: checked }))}
                />
                <Label htmlFor="has_poa" className="text-sm">
                  Tengo poder notarial para representar al propietario
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Si no tienes poder notarial, necesitarás que el propietario realice la verificación directamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
