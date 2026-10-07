import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface UploadedDocs {
  [key: string]: { path: string; file: File };
}

interface Step4DocumentsProps {
  uploadedDocs: UploadedDocs;
  submitting: boolean;
  onDocUpload: (docType: string, file: File) => void;
}

export const Step4Documents: React.FC<Step4DocumentsProps> = ({
  uploadedDocs,
  submitting,
  onDocUpload,
}) => {
  const { t } = useTranslation();

  const handleFileUpload = useCallback((docType: string, file: File) => {
    onDocUpload(docType, file);
  }, [onDocUpload]);

  const handleFileChange = useCallback((docType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(docType, file);
  }, [handleFileUpload]);

  const getDocumentLabel = (docType: string) => {
    switch (docType) {
      case 'clyt': return t('properties.wizard.documents.clyt');
      case 'escritura': return t('properties.wizard.documents.escritura');
      case 'cedula': return t('properties.wizard.documents.cedula');
      default: return docType.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('properties.wizard.documents.title')}</h3>

        <div className="space-y-4">
          {(['clyt', 'escritura', 'cedula'] as const).map((docType) => (
            <div key={docType} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={docType} className="text-sm font-medium">
                  {getDocumentLabel(docType)}
                </Label>
                {uploadedDocs[docType] && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> {t('properties.wizard.documents.uploaded')}
                  </span>
                )}
              </div>

              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                uploadedDocs[docType]
                  ? 'border-green-200 bg-green-50'
                  : 'border-muted-foreground/25'
              }`}>
                <div className="flex items-center justify-center mb-2">
                  {uploadedDocs[docType] ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <p className="text-sm mb-4">
                  {uploadedDocs[docType]
                    ? `✅ ${uploadedDocs[docType].file.name}`
                    : t('properties.wizard.documents.uploadDocType', { type: docType.toUpperCase() })
                  }
                </p>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id={docType}
                  onChange={handleFileChange(docType)}
                />
                <Button asChild disabled={submitting}>
                  <label htmlFor={docType} className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadedDocs[docType] ? t('properties.wizard.documents.change') : t('properties.wizard.documents.uploadDocument')}
                  </label>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
