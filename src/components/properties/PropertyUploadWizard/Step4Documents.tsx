import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedDocs {
  [key: string]: { path: string; file: File };
}

interface Step4DocumentsProps {
  uploadedDocs: UploadedDocs;
  submitting: boolean;
  onDocUpload: (docType: string, file: File) => void;
}

// PDFs de prueba en public/ai_food (ejecutar: node scripts/copy-ai-food-to-public.mjs)
const SAMPLE_DOCS: Record<string, string> = {
  clyt: '/ai_food/CLYT_APTO_POBLADO_MI_001-1429919_17_OCT_2025_ANGELA_LAMBARRI.pdf',
  escritura: '/ai_food/EP_COMPRAVENTA_ZOCALO_04_FEB_2013_DOLF_ANDRINGA.pdf',
  cedula: '/ai_food/CC_JOSEFINA_GOMEZ_DOLF_ANDRINGA.pdf',
};

export const Step4Documents: React.FC<Step4DocumentsProps> = ({
  uploadedDocs,
  submitting,
  onDocUpload,
}) => {
  const { t } = useTranslation();
  const [loadingSampleDocs, setLoadingSampleDocs] = useState(false);

  const handleFileUpload = useCallback((docType: string, file: File) => {
    onDocUpload(docType, file);
  }, [onDocUpload]);

  const loadSampleDocs = useCallback(async () => {
    setLoadingSampleDocs(true);
    try {
      for (const [docType, url] of Object.entries(SAMPLE_DOCS)) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(t('properties.wizard.documents.sampleMissing', { url }));
        const blob = await res.blob();
        const filename = url.split('/').pop() || `${docType}.pdf`;
        const file = new File([blob], filename, { type: 'application/pdf' });
        onDocUpload(docType, file);
      }
      toast.success(t('properties.wizard.documents.sampleLoaded'));
    } catch (err: any) {
      console.error('Error loading sample docs:', err);
      toast.error(err.message || t('properties.wizard.documents.sampleError'));
    } finally {
      setLoadingSampleDocs(false);
    }
  }, [onDocUpload, t]);

  const handleFileChange = useCallback((docType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(docType, file);
  }, [handleFileUpload]);

  const allSamplesLoaded = Object.keys(SAMPLE_DOCS).every((k) => uploadedDocs[k]);

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('properties.wizard.documents.title')}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadSampleDocs}
            disabled={loadingSampleDocs || allSamplesLoaded}
            className="text-xs"
          >
            {loadingSampleDocs ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1" />
                {t('properties.wizard.documents.useSample')}
              </>
            )}
          </Button>
        </div>

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
