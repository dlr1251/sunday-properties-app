import React, { useRef } from 'react';
import { Label } from '../../../ui/label';
import { PropertyFormData } from '../PropertyWizard';
import { Upload, X, FileText } from 'lucide-react';

interface DocumentsStepProps {
  data: PropertyFormData;
  onUpdate: (updates: Partial<PropertyFormData>) => void;
  isDarkMode?: boolean;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({
  data,
  onUpdate,
  isDarkMode = true
}) => {
  const ownershipInputRef = useRef<HTMLInputElement>(null);
  const legalInputRef = useRef<HTMLInputElement>(null);

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const handleOwnershipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onUpdate({ ownership_documents: [...data.ownership_documents, ...files] });
  };

  const handleLegalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onUpdate({ legal_documents: [...data.legal_documents, ...files] });
  };

  const removeOwnershipDoc = (index: number) => {
    onUpdate({ ownership_documents: data.ownership_documents.filter((_, i) => i !== index) });
  };

  const removeLegalDoc = (index: number) => {
    onUpdate({ legal_documents: data.legal_documents.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      {/* Ownership Documents */}
      <div>
        <Label className={textPrimary}>Documentos de Propiedad *</Label>
        <p className={`text-sm mt-1 ${textSecondary}`}>Certificado de libertad y tradición, escrituras, etc.</p>

        <div className="mt-4 space-y-2">
          {data.ownership_documents.map((file, index) => (
            <div key={index} className={`flex items-center justify-between ${cardClasses} p-3 rounded-lg`}>
              <div className="flex items-center">
                <FileText className={`w-5 h-5 mr-3 ${textSecondary}`} />
                <span className={textPrimary}>{file.name}</span>
              </div>
              <button
                onClick={() => removeOwnershipDoc(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div
            onClick={() => ownershipInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors ${cardClasses}`}
          >
            <Upload className={`w-8 h-8 mb-2 ${textSecondary}`} />
            <span className={`text-sm ${textPrimary}`}>Agregar Documentos de Propiedad</span>
          </div>
        </div>

        <input
          ref={ownershipInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          onChange={handleOwnershipUpload}
          className="hidden"
        />
      </div>

      {/* Legal Documents */}
      <div>
        <Label className={textPrimary}>Documentos Legales (Opcional)</Label>
        <p className={`text-sm mt-1 ${textSecondary}`}>Certificaciones, permisos, planos, etc.</p>

        <div className="mt-4 space-y-2">
          {data.legal_documents.map((file, index) => (
            <div key={index} className={`flex items-center justify-between ${cardClasses} p-3 rounded-lg`}>
              <div className="flex items-center">
                <FileText className={`w-5 h-5 mr-3 ${textSecondary}`} />
                <span className={textPrimary}>{file.name}</span>
              </div>
              <button
                onClick={() => removeLegalDoc(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div
            onClick={() => legalInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors ${cardClasses}`}
          >
            <Upload className={`w-8 h-8 mb-2 ${textSecondary}`} />
            <span className={`text-sm ${textPrimary}`}>Agregar Documentos Legales</span>
          </div>
        </div>

        <input
          ref={legalInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          onChange={handleLegalUpload}
          className="hidden"
        />
      </div>

      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-950 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
        <h4 className={`font-semibold mb-2 ${textPrimary}`}>⚠️ Importante</h4>
        <ul className={`text-sm space-y-1 ${textSecondary}`}>
          <li>• Todos los documentos serán revisados por nuestros abogados</li>
          <li>• Asegúrese de que los documentos estén actualizados y sean legibles</li>
          <li>• Los documentos fraudulentos resultarán en la suspensión de la cuenta</li>
        </ul>
      </div>
    </div>
  );
};
