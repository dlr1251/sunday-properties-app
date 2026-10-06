import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  googleMapsNeighborhoodUrl,
  type Coordinates,
} from '@/utils/publicLocation';

interface OpenInGoogleMapsButtonProps {
  neighborhood?: string | null;
  city?: string | null;
  coordinates?: Coordinates | null;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'outline' | 'secondary' | 'ghost' | 'default';
}

export function OpenInGoogleMapsButton({
  neighborhood,
  city,
  coordinates,
  className,
  size = 'sm',
  variant = 'outline',
}: OpenInGoogleMapsButtonProps) {
  const { t } = useTranslation();
  const href = googleMapsNeighborhoodUrl({ neighborhood, city, coordinates });

  return (
    <Button asChild size={size} variant={variant} className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-4 w-4" />
        {t('maps.openInGoogleMaps')}
      </a>
    </Button>
  );
}
