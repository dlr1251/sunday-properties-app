import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Eye, Download } from 'lucide-react';
import { documentAnalysisService, DocumentData } from '../../../services/documentAnalysis';

interface UploadedDocs {
  [key: string]: { path: string; file: File };
}

interface AnalyzedDocs {
  [key: string]: DocumentData;
}

interface Step4DocumentsProps {
  uploadedDocs: UploadedDocs;
  submitting: boolean;
  onDocUpload: (docType: string, file: File) => void;
  onDocumentAnalyzed?: (docType: string, data: DocumentData) => void;
}

// Helper function to download an image
const downloadImage = (base64DataUrl: string, filename: string) => {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = base64DataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

export const Step4Documents: React.FC<Step4DocumentsProps> = ({
  uploadedDocs,
  submitting,
  onDocUpload,
  onDocumentAnalyzed,
}) => {
  const [analyzingDocs, setAnalyzingDocs] = useState<Set<string>>(new Set());
  const [analyzedDocs, setAnalyzedDocs] = useState<AnalyzedDocs>({});
  const [testingVision, setTestingVision] = useState(false);

  console.log('📄 Step4Documents rendering with docs:', uploadedDocs);

  const testVisionCapabilities = useCallback(async () => {
    setTestingVision(true);
    try {
      console.log('🧪 Testing Grok vision capabilities...');
      const result = await documentAnalysisService.testVisionCapabilities();
      console.log('✅ Vision test result:', result);
      alert('Vision test completed! Check console for results.');
    } catch (error) {
      console.error('❌ Vision test failed:', error);
      alert('Vision test failed! Check console for details.');
    } finally {
      setTestingVision(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (docType: string, file: File) => {
    console.log(`📎 Uploading ${docType}:`, file.name);
    onDocUpload(docType, file);

    // Start analysis immediately after upload
    setAnalyzingDocs(prev => new Set(prev).add(docType));

    try {
      console.log(`🤖 Starting AI analysis for ${docType}...`);
      const analysisResult = await documentAnalysisService.analyzeDocument(
        docType as 'clyt' | 'escritura' | 'cedula',
        file
      );

      setAnalyzedDocs(prev => ({
        ...prev,
        [docType]: analysisResult
      }));

      // Notify parent component
      onDocumentAnalyzed?.(docType, analysisResult);

      console.log(`✅ Analysis complete for ${docType}:`, analysisResult);
    } catch (error) {
      console.error(`❌ Analysis failed for ${docType}:`, error);
    } finally {
      setAnalyzingDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(docType);
        return newSet;
      });
    }
  }, [onDocUpload, onDocumentAnalyzed]);

  const handleFileChange = useCallback((docType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(docType, file);
    }
  }, [handleFileUpload]);

  const getDocumentLabel = (docType: string) => {
    switch (docType) {
      case 'clyt': return 'Libertad y Tradición *';
      case 'escritura': return 'Escrituras Públicas';
      case 'cedula': return 'Cédula del Propietario';
      default: return docType.toUpperCase();
    }
  };

  const isAnalyzing = (docType: string) => analyzingDocs.has(docType);
  const isAnalyzed = (docType: string) => !!analyzedDocs[docType];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Documentos Legales</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={testVisionCapabilities}
            disabled={testingVision}
            className="text-xs"
          >
            {testingVision ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Probando...
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Probar IA
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
                <div className="flex items-center gap-2">
                  {isAnalyzing(docType) && (
                    <Badge variant="secondary" className="text-xs">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Analizando...
                    </Badge>
                  )}
                  {isAnalyzed(docType) && !isAnalyzing(docType) && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Analizado
                    </Badge>
                  )}
                </div>
              </div>

              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                uploadedDocs[docType]
                  ? 'border-green-200 bg-green-50'
                  : 'border-muted-foreground/25'
              }`}>
                <div className="flex items-center justify-center mb-2">
                  {isAnalyzing(docType) ? (
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  ) : isAnalyzed(docType) ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <p className="text-sm mb-4">
                  {uploadedDocs[docType]
                    ? `✅ ${uploadedDocs[docType].file.name}`
                    : `Sube el documento de ${docType.toUpperCase()}`
                  }
                </p>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id={docType}
                  onChange={handleFileChange(docType)}
                  disabled={isAnalyzing(docType)}
                />
                <Button asChild disabled={submitting || isAnalyzing(docType)}>
                  <label htmlFor={docType} className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadedDocs[docType] ? 'Cambiar' : 'Subir Documento'}
                  </label>
                </Button>
              </div>

              {/* Mostrar datos extraídos */}
              {isAnalyzed(docType) && analyzedDocs[docType] && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900 text-sm">
                          Datos Extraídos por IA
                        </h4>
                        {analyzedDocs[docType].processedImages && analyzedDocs[docType].processedImages.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              analyzedDocs[docType].processedImages?.forEach((img, idx) => {
                                downloadImage(img, `${docType}-page-${idx + 1}.jpg`);
                              });
                            }}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Descargar Imágenes Procesadas
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        {Object.entries(analyzedDocs[docType].extractedData)
                          .filter(([key, value]) => value !== undefined && value !== null && value !== '')
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-blue-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                              </span>
                              <span className="text-blue-900 font-medium">
                                {typeof value === 'number' && key.includes('area')
                                  ? `${value} m²`
                                  : typeof value === 'number' && key.includes('Value')
                                  ? `$${value.toLocaleString()}`
                                  : key === 'annotations' && Array.isArray(value)
                                  ? `${value.length} anotación(es)`
                                  : typeof value === 'object' && value !== null
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                      </div>
                      
                      {/* Show annotations separately if they exist */}
                      {analyzedDocs[docType].extractedData.annotations && 
                       Array.isArray(analyzedDocs[docType].extractedData.annotations) &&
                       analyzedDocs[docType].extractedData.annotations.length > 0 && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <h5 className="font-medium text-green-900 text-xs mb-2">
                            Anotaciones Encontradas ({analyzedDocs[docType].extractedData.annotations.length})
                          </h5>
                          <div className="space-y-1 text-xs">
                            {analyzedDocs[docType].extractedData.annotations.map((annotation: any, idx: number) => (
                              <div key={idx} className="p-2 bg-white border border-green-200 rounded">
                                {Object.entries(annotation).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-green-700 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                    </span>
                                    <span className="text-green-900 font-medium">
                                      {String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {analyzedDocs[docType].warnings.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                          <strong className="text-yellow-800">Advertencias:</strong>
                          <ul className="text-yellow-700 mt-1">
                            {analyzedDocs[docType].warnings.map((warning, idx) => (
                              <li key={idx}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Extracción Automática de Datos</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Nuestro sistema extraerá automáticamente la información legal del documento para acelerar el proceso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
