import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  MessageCircle,
  Phone,
  Video,
  Mail,
  User,
  Shield,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getAvatarUrl } from '../../../utils/avatar';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { toast } from 'sonner';

interface ContactPanelProps {
  owner: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    verification_status?: string;
    response_time?: string;
    properties_count?: number;
  };
  propertyId: string;
  propertyTitle: string;
}

export const ContactPanel: React.FC<ContactPanelProps> = ({
  owner,
  propertyId,
  propertyTitle,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(t('properties.detail.contact.emailSubject', { title: propertyTitle }));
  const [emailMessage, setEmailMessage] = useState('');

  const handleMessage = () => {
    if (!user) {
      toast.error(t('properties.detail.contact.mustLoginMessage'));
      return;
    }

    // Navigate to chat with this owner
    navigate(`/messages?propertyId=${propertyId}&ownerId=${owner.id}`);
  };

  const handleVideoCall = () => {
    if (!user) {
      toast.error(t('properties.detail.contact.mustLoginVideo'));
      return;
    }
    
    toast.info(t('properties.detail.contact.videoComingSoon'));
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      t('properties.detail.contact.whatsappMessage', { name: owner.full_name, title: propertyTitle })
    );
    const whatsappUrl = `https://wa.me/${owner.phone?.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhone = () => {
    if (owner.phone) {
      window.location.href = `tel:${owner.phone}`;
    } else {
      toast.error(t('properties.detail.contact.phoneUnavailable'));
    }
  };

  const handleEmailSubmit = () => {
    if (!emailMessage.trim()) {
      toast.error(t('properties.detail.contact.writeMessage'));
      return;
    }

    const mailto = `mailto:${owner.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
    window.location.href = mailto;
    setShowEmailModal(false);
    setEmailMessage('');
  };

  const isVerified = owner.verification_status === 'verified';

  return (
    <>
      <Card className="p-4 sm:p-6 space-y-4">
        {/* Owner Info */}
        <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-lg sm:text-xl font-bold">
            <img
              src={getAvatarUrl(owner)}
              alt={owner.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg truncate">{owner.full_name}</h3>
              {isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  {t('properties.verified')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <User className="h-3 w-3" />
              <span>{t('properties.detail.contact.owner')}</span>
            </div>
            {owner.response_time && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="h-3 w-3" />
                <span>{t('properties.detail.contact.responseTime', { time: owner.response_time })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Actions */}
        <div className="space-y-2">
          <Button onClick={handleMessage} className="w-full h-10 sm:h-11 text-sm sm:text-base min-w-0" size="lg">
            <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">{t('properties.detail.contact.sendMessage')}</span>
          </Button>

          <div className="grid grid-cols-2 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleVideoCall}
              className="w-full min-w-0 text-xs sm:text-sm"
              size="sm"
            >
              <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 shrink-0" />
              <span className="truncate">{t('properties.detail.contact.videoCall')}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              className="w-full min-w-0 text-xs sm:text-sm"
              size="sm"
              disabled={!owner.phone}
            >
              <span className="truncate">{t('properties.detail.contact.whatsapp')}</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handlePhone}
              className="w-full min-w-0 text-xs sm:text-sm"
              size="sm"
              disabled={!owner.phone}
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 shrink-0" />
              <span className="truncate">{t('properties.detail.contact.call')}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(true)}
              className="w-full min-w-0 text-xs sm:text-sm"
              size="sm"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 shrink-0" />
              <span className="truncate">{t('properties.detail.contact.email')}</span>
            </Button>
          </div>
        </div>

        {/* Owner Stats */}
        {owner.properties_count !== undefined && (
          <div className="pt-4 border-t text-center text-sm text-gray-600">
            <p>
              {t('properties.detail.contact.publishedCount', { count: owner.properties_count })}
            </p>
          </div>
        )}
      </Card>

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('properties.detail.contact.emailTitle', { name: owner.full_name })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('properties.detail.contact.subject')}
              </label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('properties.detail.contact.message')}
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full min-h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('properties.detail.contact.messagePlaceholder')}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEmailModal(false)} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button onClick={handleEmailSubmit} className="flex-1">
                {t('properties.detail.contact.sendEmail')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

