import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { FileText, CheckCircle } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';
import { Button } from '../../ui/button';

export const StepTermsAndConditions: React.FC = () => {
  const { termsAccepted, setTermsAccepted } = useVerificationForm();
  const [readTerms, setReadTerms] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Términos y Condiciones</h3>
        <p className="text-muted-foreground">
          Por favor lee y acepta los términos y condiciones de la plataforma
        </p>
      </div>

      <Card className="p-6 max-h-96 overflow-y-auto border-2">
        <div className="prose prose-sm max-w-none">
          <h4 className="font-semibold mb-4">Términos y Condiciones de Uso</h4>
          
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h5 className="font-semibold mb-2">1. Aceptación de Términos</h5>
              <p>
                Al utilizar esta plataforma, aceptas cumplir con estos términos y condiciones. 
                Si no estás de acuerdo con alguno de estos términos, no debes usar nuestros servicios.
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">2. Verificación de Identidad</h5>
              <p>
                Proporcionas información precisa y completa durante el proceso de verificación. 
                La información proporcionada será utilizada únicamente para fines de verificación 
                y seguridad de la plataforma.
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">3. Uso de Datos Personales</h5>
              <p>
                Tus datos personales serán tratados de acuerdo con nuestra Política de Privacidad. 
                No compartiremos tu información con terceros sin tu consentimiento explícito, 
                excepto cuando sea requerido por ley.
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">4. Responsabilidades del Usuario</h5>
              <p>
                Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. 
                Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">5. Limitación de Responsabilidad</h5>
              <p>
                La plataforma no se hace responsable por pérdidas o daños derivados del uso 
                de nuestros servicios, excepto en casos de negligencia grave o dolo.
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">6. Modificaciones</h5>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Los cambios serán notificados a través de la plataforma.
              </p>
            </section>
          </div>
        </div>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
        <Checkbox
          id="read-terms"
          checked={readTerms}
          onCheckedChange={(checked) => setReadTerms(checked === true)}
          className="mt-1"
        />
        <Label htmlFor="read-terms" className="flex-1 cursor-pointer">
          <span className="font-medium">He leído y entendido los términos y condiciones</span>
        </Label>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Checkbox
          id="accept-terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          disabled={!readTerms}
          className="mt-1"
        />
        <Label htmlFor="accept-terms" className="flex-1 cursor-pointer">
          <span className="font-medium text-blue-900">
            Acepto los términos y condiciones de la plataforma *
          </span>
          <p className="text-sm text-blue-700 mt-1">
            Debes leer los términos antes de aceptarlos
          </p>
        </Label>
      </div>

      {!readTerms && termsAccepted && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span>Por favor marca que has leído los términos antes de aceptarlos</span>
        </div>
      )}
    </div>
  );
};



