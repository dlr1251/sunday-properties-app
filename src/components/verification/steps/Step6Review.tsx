import React from 'react';
import { Check, User, Search, Camera, FileText } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';

const valueToDisplayText: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  google: 'Google Search',
  real_estate_website: 'Sitio web inmobiliario',
  friend_referral: 'Referencia de amigo',
  agent_referral: 'Referencia de agente',
  other: 'Otro',
  buy: 'Comprar propiedades',
  sell: 'Vender propiedades',
  invest: 'Invertir en propiedades',
  represent: 'Representar a otros',
  consult: 'Consultar información',
};

export const Step6Review: React.FC = () => {
  const {
    formData,
    capturedSelfie,
    uploadedIdDoc,
    uploadedPoaDoc,
  } = useVerificationForm();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Revisión Final</h3>
        <p className="text-muted-foreground">Revisa tu información antes de enviar la solicitud</p>
      </div>

      <div className="space-y-6">
        {/* Personal Data */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">Datos Personales</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
            <div><span className="text-muted-foreground">Teléfono:</span> {formData.phone}</div>
            <div><span className="text-muted-foreground">Ubicación:</span> {formData.location}</div>
            <div><span className="text-muted-foreground">Fecha de nacimiento:</span> {formData.date_of_birth}</div>
            <div><span className="text-muted-foreground">Nacionalidad:</span> {formData.nationality}</div>
          </div>
        </div>

        {/* Discovery */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">Descubrimiento</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
            <div><span className="text-muted-foreground">Cómo nos encontraste:</span> {formData.how_did_you_find_us?.map(v => valueToDisplayText[v] || v).join(', ')}</div>
            <div><span className="text-muted-foreground">Qué quieres hacer:</span> {formData.what_do_you_want_to_do?.map(v => valueToDisplayText[v] || v).join(', ')}</div>
          </div>
        </div>

        {/* User Type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">Tipo de Usuario</h4>
          </div>
          <div className="text-sm bg-gray-50 rounded-lg p-4">
            <p className="text-muted-foreground mb-2">Tipo:</p>
            <p>{formData.is_owner ? 'Dueño directo' : `Intermediario ${formData.has_poa ? '(con poder notarial)' : '(sin poder notarial)'}`}</p>
          </div>
        </div>

        {/* Selfie */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">Foto de Rostro</h4>
          </div>
          <div className="text-sm bg-gray-50 rounded-lg p-4">
            {capturedSelfie ? (
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Foto capturada correctamente</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-red-600">Foto no capturada</span>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">Documentos</h4>
          </div>
          <div className="space-y-3">
            <div className="text-sm bg-gray-50 rounded-lg p-4">
              <p className="text-muted-foreground mb-2">Cédula de ciudadanía:</p>
              {uploadedIdDoc ? (
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>{uploadedIdDoc.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-red-600">No subida</span>
                </div>
              )}
            </div>

            {!formData.is_owner && formData.has_poa && (
              <div className="text-sm bg-gray-50 rounded-lg p-4">
                <p className="text-muted-foreground mb-2">Poder notarial:</p>
                {uploadedPoaDoc ? (
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>{uploadedPoaDoc.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-red-600">No subida</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Una vez enviada la solicitud, será revisada por nuestro equipo.
          Te notificaremos por email cuando se complete el proceso de verificación.
        </p>
      </div>
    </div>
  );
};
