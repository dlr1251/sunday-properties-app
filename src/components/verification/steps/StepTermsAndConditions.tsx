import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { FileText, CheckCircle } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';
import { Button } from '../../ui/button';

export const StepTermsAndConditions: React.FC = () => {
  const { t } = useTranslation();
  const { termsAccepted, setTermsAccepted } = useVerificationForm();
  const [readTerms, setReadTerms] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t('verification.terms.title')}</h3>
        <p className="text-muted-foreground">
          {t('verification.terms.subtitle')}
        </p>
      </div>

      <Card className="p-6 max-h-96 overflow-y-auto border-2">
        <div className="prose prose-sm max-w-none">
          <h4 className="font-semibold mb-4">{t('verification.terms.heading')}</h4>
          
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h5 className="font-semibold mb-2">{t('verification.terms.s1Title')}</h5>
              <p>
                {t('verification.terms.s1Body')}
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">{t('verification.terms.s2Title')}</h5>
              <p>
                {t('verification.terms.s2Body')}
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">{t('verification.terms.s3Title')}</h5>
              <p>
                {t('verification.terms.s3Body')}
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">{t('verification.terms.s4Title')}</h5>
              <p>
                {t('verification.terms.s4Body')}
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">{t('verification.terms.s5Title')}</h5>
              <p>
                {t('verification.terms.s5Body')}
              </p>
            </section>

            <section>
              <h5 className="font-semibold mb-2">{t('verification.terms.s6Title')}</h5>
              <p>
                {t('verification.terms.s6Body')}
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
          <span className="font-medium">{t('verification.terms.haveRead')}</span>
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
            {t('verification.terms.accept')}
          </span>
          <p className="text-sm text-blue-700 mt-1">
            {t('verification.terms.mustReadFirst')}
          </p>
        </Label>
      </div>

      {!readTerms && termsAccepted && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span>{t('verification.terms.markReadFirst')}</span>
        </div>
      )}
    </div>
  );
};



