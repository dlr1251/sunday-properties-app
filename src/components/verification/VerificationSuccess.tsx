import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';

interface VerificationSuccessProps {
  onContinue: () => void;
}

export const VerificationSuccess: React.FC<VerificationSuccessProps> = ({ onContinue }) => {
  const { t } = useTranslation();
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-900">
            {t('verification.success.title')}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-green-800 mb-4">
              {t('verification.success.body')}
            </p>
            <p className="text-green-700">
              {t('verification.success.reviewTime')}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('verification.success.whatNow')}
            </h3>
            <div className="space-y-3 text-sm text-green-800">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">{t('verification.success.step1Title')}</p>
                  <p className="text-green-700">{t('verification.success.step1Body')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">{t('verification.success.step2Title')}</p>
                  <p className="text-green-700">{t('verification.success.step2Body')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">{t('verification.success.step3Title')}</p>
                  <p className="text-green-700">{t('verification.success.step3Body')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">{t('verification.success.statusPrompt')}</h4>
                <p className="text-blue-700 text-sm mt-1">
                  {t('verification.success.statusHint')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={onContinue}
              className="bg-green-600 hover:bg-green-700"
            >
              {t('verification.success.viewStatus')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="text-center text-sm text-green-600">
            {t('verification.success.redirecting')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
