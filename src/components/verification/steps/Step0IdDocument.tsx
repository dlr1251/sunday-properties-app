import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Card } from '../../ui/card';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, Eye, X } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';
import { documentAnalysisService, DocumentData } from '../../../services/documentAnalysis';
import { toast } from 'sonner';
import { AiLegalDisclaimer } from '@/components/ai/AiLegalDisclaimer';

export const Step0IdDocument: React.FC = () => {
  const { t } = useTranslation();
  const {
    uploadedIdDoc,
    setUploadedIdDoc,
    idDocPreview,
    setIdDocPreview,
    idDocAnalysis,
    setIdDocAnalysis,
  } = useVerificationForm();

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('verification.documents.invalidFile'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('verification.documents.fileTooLarge'));
      return;
    }

    setUploadedIdDoc(file);
    setAnalysisError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setIdDocPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Start analysis immediately
    setAnalyzing(true);
    try {
      toast.info(t('verification.idDocument.analyzing'), { duration: 2000 });
      
      const analysisResult = await documentAnalysisService.analyzeDocument('cedula', file);
      
      setIdDocAnalysis(analysisResult);
      
      if (analysisResult.confidence > 0.7) {
        toast.success(t('verification.idDocument.analyzedSuccess'), {
          description: t('verification.idDocument.confidence', { value: Math.round(analysisResult.confidence * 100) }),
        });
      } else {
        toast.warning(t('verification.idDocument.lowConfidence'), {
          description: t('verification.idDocument.reviewExtracted'),
        });
      }
    } catch (error: any) {
      console.error('Error analyzing document:', error);
      setAnalysisError(error.message || t('verification.idDocument.analyzeError'));
      toast.error(t('verification.idDocument.analyzeError'), {
        description: t('verification.idDocument.analyzeErrorHint'),
      });
    } finally {
      setAnalyzing(false);
    }
  }, [setUploadedIdDoc, setIdDocPreview, setIdDocAnalysis, t]);

  const removeDocument = () => {
    setUploadedIdDoc(null);
    setIdDocPreview(null);
    setIdDocAnalysis(null);
    setAnalysisError(null);
  };

  const extractedData = idDocAnalysis?.extractedData;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t('verification.idDocument.title')}</h3>
        <p className="text-muted-foreground">
          {t('verification.idDocument.subtitle')}
        </p>
      </div>

      {!uploadedIdDoc ? (
        <Card className="border-2 border-dashed border-muted-foreground/25 p-8">
          <div className="text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="id-doc-upload" className="text-base font-medium cursor-pointer">
              {t('verification.idDocument.selectDocument')}
            </Label>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              {t('verification.idDocument.formats')}
            </p>
            <input
              type="file"
              id="id-doc-upload"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button asChild>
              <label htmlFor="id-doc-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {t('verification.documents.selectFile')}
              </label>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <AiLegalDisclaimer />
          {/* Document Preview */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">{uploadedIdDoc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedIdDoc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {idDocPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(idDocPreview, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('verification.dashboard.view')}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={removeDocument}>
                  <X className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </Button>
              </div>
            </div>

            {/* Analysis Status */}
            {analyzing && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('verification.idDocument.analyzing')}</span>
              </div>
            )}

            {!analyzing && idDocAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {idDocAnalysis.confidence > 0.7 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        {t('verification.idDocument.analysisComplete', { value: Math.round(idDocAnalysis.confidence * 100) })}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">
                        {t('verification.idDocument.analysisWarnings', { value: Math.round(idDocAnalysis.confidence * 100) })}
                      </span>
                    </>
                  )}
                </div>

                {idDocAnalysis.warnings && idDocAnalysis.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-800 mb-1">{t('verification.idDocument.warnings')}</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                      {idDocAnalysis.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Data Preview */}
                {extractedData && (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-sm font-medium mb-2">{t('verification.idDocument.extractedData')}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {extractedData.fullName && (
                        <div>
                          <span className="text-muted-foreground">{t('verification.idDocument.name')}</span>
                          <p className="font-medium">{extractedData.fullName}</p>
                        </div>
                      )}
                      {extractedData.idNumber && (
                        <div>
                          <span className="text-muted-foreground">{t('verification.idDocument.idNumber')}</span>
                          <p className="font-medium">{extractedData.idNumber}</p>
                        </div>
                      )}
                      {extractedData.birthDate && (
                        <div>
                          <span className="text-muted-foreground">{t('verification.idDocument.dateOfBirth')}</span>
                          <p className="font-medium">{extractedData.birthDate}</p>
                        </div>
                      )}
                      {extractedData.nationality && (
                        <div>
                          <span className="text-muted-foreground">{t('verification.idDocument.nationality')}</span>
                          <p className="font-medium">{extractedData.nationality}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('verification.idDocument.prefillHint')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {analysisError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{analysisError}</span>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};



