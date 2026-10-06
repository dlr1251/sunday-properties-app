import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { FileText, Upload, Eye, X } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';

export const Step5Documents: React.FC = () => {
  const { t } = useTranslation();
  const {
    formData,
    uploadedIdDoc,
    setUploadedIdDoc,
    uploadedPoaDoc,
    setUploadedPoaDoc,
    idDocPreview,
    setIdDocPreview,
    poaDocPreview,
    setPoaDocPreview,
  } = useVerificationForm();

  const handleIdDocUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert(t('verification.documents.invalidFile'));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(t('verification.documents.fileTooLarge'));
        return;
      }

      setUploadedIdDoc(file);
      const reader = new FileReader();
      reader.onload = (e) => setIdDocPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePoaDocUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert(t('verification.documents.invalidFile'));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(t('verification.documents.fileTooLarge'));
        return;
      }

      setUploadedPoaDoc(file);
      const reader = new FileReader();
      reader.onload = (e) => setPoaDocPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeIdDoc = () => {
    setUploadedIdDoc(null);
    setIdDocPreview(null);
  };

  const removePoaDoc = () => {
    setUploadedPoaDoc(null);
    setPoaDocPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t('verification.documents.title')}</h3>
        <p className="text-muted-foreground">{t('verification.documents.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* ID Document Upload */}
        <div>
          <Label className="text-base font-medium">{t('verification.documents.idLabel')}</Label>
          <p className="text-sm text-muted-foreground mb-4">
            {t('verification.documents.idHint')}
          </p>

          {!uploadedIdDoc ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">
                {t('verification.documents.dropOrClick')}
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                className="hidden"
                id="id-doc-upload"
                onChange={handleIdDocUpload}
              />
              <Button asChild>
                <label htmlFor="id-doc-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {t('verification.documents.selectFile')}
                </label>
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
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
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeIdDoc}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* POA Document Upload - Only show if not owner and has POA */}
        {!formData.is_owner && formData.has_poa && (
          <div>
            <Label className="text-base font-medium">{t('verification.documents.poaLabel')}</Label>
            <p className="text-sm text-muted-foreground mb-4">
              {t('verification.documents.poaHint')}
            </p>

            {!uploadedPoaDoc ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">
                  {t('verification.documents.dropOrClick')}
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  id="poa-doc-upload"
                  onChange={handlePoaDocUpload}
                />
                <Button asChild>
                  <label htmlFor="poa-doc-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {t('verification.documents.selectFile')}
                  </label>
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{uploadedPoaDoc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedPoaDoc.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {poaDocPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(poaDocPreview, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removePoaDoc}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
