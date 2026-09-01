import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Link as LinkIcon,
  QrCode,
  Mail,
  FileText,
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

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  propertyTitle,
  propertyId,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const emailLink = typeof window !== 'undefined' ? window.location.href : '';
  const propertyUrl = emailLink;

  const shareTitle = t('properties.detail.share.lookAt', { title: propertyTitle });
  const shareDescription = t('properties.detail.share.mightInterest', { title: propertyTitle });

  useEffect(() => {
    if (isOpen) {
      // Generate QR code URL (you can use a service like qrcode.tec-it.com or similar)
      setQrCodeUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          propertyUrl
        )}`
      );
    }
  }, [isOpen, propertyUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      toast.success(t('properties.detail.share.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('properties.detail.share.copyError'));
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(propertyUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${propertyUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(
      t('properties.detail.share.emailBody', { description: shareDescription, url: propertyUrl })
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const downloadPDF = () => {
    toast.info(t('properties.detail.share.pdfComingSoon'));
    // You can integrate PDF generation library here
  };

  const socialButtons = [
    { icon: Facebook, label: 'Facebook', onClick: shareToFacebook, color: 'bg-blue-600' },
    { icon: Twitter, label: 'Twitter', onClick: shareToTwitter, color: 'bg-sky-500' },
    { icon: Linkedin, label: 'LinkedIn', onClick: shareToLinkedIn, color: 'bg-blue-800' },
    { icon: MessageCircle, label: 'WhatsApp', onClick: shareToWhatsApp, color: 'bg-green-600' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t('properties.detail.share.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Social Media Shares */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('properties.detail.share.socialTitle')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {socialButtons.map(({ icon: Icon, label, onClick, color }) => (
                <Button
                  key={label}
                  variant="outline"
                  onClick={onClick}
                  className="h-20 flex-col gap-2 hover:shadow-md transition-shadow"
                >
                  <Icon className={`h-6 w-6 text-white p-2 rounded ${color}`} />
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('properties.detail.share.copyLink')}</h3>
            <div className="flex gap-2">
              <Input
                value={propertyUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant={copied ? 'default' : 'outline'}
                onClick={handleCopyLink}
                size="icon"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('properties.detail.share.qrTitle')}</h3>
            <div className="flex items-center justify-center p-4 border rounded-lg">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {t('properties.detail.share.qrHint')}
            </p>
          </div>

          {/* Other Options */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <Button
              variant="outline"
              onClick={shareViaEmail}
              className="h-16 flex-col gap-2"
            >
              <Mail className="h-5 w-5" />
              <span className="text-sm">{t('properties.detail.contact.email')}</span>
            </Button>
            <Button
              variant="outline"
              onClick={downloadPDF}
              className="h-16 flex-col gap-2"
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm">{t('properties.detail.share.downloadPdf')}</span>
            </Button>
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

