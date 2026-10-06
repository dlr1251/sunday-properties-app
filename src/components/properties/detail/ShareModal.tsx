import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Share2,
  Facebook,
  Linkedin,
  Check,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyId: string;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  propertyTitle,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const propertyUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = t('properties.detail.share.lookAt', { title: propertyTitle });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      toast.success(t('properties.detail.share.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('properties.detail.share.copyError'));
    }
  };

  const openShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const socialButtons = [
    {
      label: 'WhatsApp',
      onClick: () =>
        openShare(`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${propertyUrl}`)}`),
      color: 'bg-[#25D366]',
      icon: WhatsAppIcon,
    },
    {
      label: 'Facebook',
      onClick: () =>
        openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`),
      color: 'bg-[#1877F2]',
      icon: Facebook,
    },
    {
      label: 'X',
      onClick: () =>
        openShare(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(propertyUrl)}`
        ),
      color: 'bg-foreground',
      icon: XIcon,
    },
    {
      label: 'LinkedIn',
      onClick: () =>
        openShare(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}`
        ),
      color: 'bg-[#0A66C2]',
      icon: Linkedin,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Share2 className="h-5 w-5" />
            {t('properties.detail.share.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              {t('properties.detail.share.socialTitle')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {socialButtons.map(({ icon: Icon, label, onClick, color }) => (
                <Button
                  key={label}
                  variant="outline"
                  onClick={onClick}
                  className="h-20 flex-col gap-2 hover:shadow-md"
                >
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-white ${color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-foreground">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              {t('properties.detail.share.copyLink')}
            </h3>
            <div className="flex gap-2">
              <Input value={propertyUrl} readOnly className="flex-1" />
              <Button variant={copied ? 'default' : 'outline'} onClick={handleCopyLink} size="icon">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
