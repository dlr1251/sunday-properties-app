import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AiLegalDisclaimerProps = {
  className?: string;
};

export function AiLegalDisclaimer({ className = '' }: AiLegalDisclaimerProps) {
  const { t } = useTranslation();

  return (
    <Alert className={`border-brand-sky/30 bg-brand-sky/5 ${className}`}>
      <Scale className="h-4 w-4 text-brand-sky" />
      <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
        {t('ai.disclaimer.ui')}
      </AlertDescription>
    </Alert>
  );
}
