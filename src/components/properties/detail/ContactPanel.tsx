import React, { useState } from 'react';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(`Consulta sobre ${propertyTitle}`);
  const [emailMessage, setEmailMessage] = useState('');

  const handleMessage = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para enviar un mensaje');
      return;
    }

    // Navigate to chat with this owner
    navigate(`/messages?propertyId=${propertyId}&ownerId=${owner.id}`);
  };

  const handleVideoCall = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para agendar una videollamada');
      return;
    }
    
    toast.info('Función de videollamada próximamente disponible');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola ${owner.full_name}, tengo interés en la propiedad "${propertyTitle}"`
    );
    const whatsappUrl = `https://wa.me/${owner.phone?.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhone = () => {
    if (owner.phone) {
      window.location.href = `tel:${owner.phone}`;
    } else {
      toast.error('Número de teléfono no disponible');
    }
  };

  const handleEmailSubmit = () => {
    if (!emailMessage.trim()) {
      toast.error('Por favor escribe un mensaje');
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
      <Card className="p-6 space-y-4">
        {/* Owner Info */}
        <div className="flex items-start gap-4 pb-4 border-b">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {owner.avatar_url ? (
              <img
                src={owner.avatar_url}
                alt={owner.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              owner.full_name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{owner.full_name}</h3>
              {isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <User className="h-3 w-3" />
              <span>Propietario</span>
            </div>
            {owner.response_time && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="h-3 w-3" />
                <span>Respuesta: {owner.response_time}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Actions */}
        <div className="space-y-2">
          <Button onClick={handleMessage} className="w-full" size="lg">
            <MessageCircle className="h-4 w-4 mr-2" />
            Enviar Mensaje
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleVideoCall}
              className="w-full"
              size="sm"
            >
              <Video className="h-4 w-4 mr-1" />
              Videollamada
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              className="w-full"
              size="sm"
              disabled={!owner.phone}
            >
              WhatsApp
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handlePhone}
              className="w-full"
              size="sm"
              disabled={!owner.phone}
            >
              <Phone className="h-4 w-4 mr-1" />
              Llamar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(true)}
              className="w-full"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
          </div>
        </div>

        {/* Owner Stats */}
        {owner.properties_count !== undefined && (
          <div className="pt-4 border-t text-center text-sm text-gray-600">
            <p>
              <span className="font-semibold">{owner.properties_count}</span> propiedad
              {owner.properties_count !== 1 ? 'es' : ''} publicadas
            </p>
          </div>
        )}
      </Card>

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Correo a {owner.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Asunto
              </label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Mensaje
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full min-h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEmailModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleEmailSubmit} className="flex-1">
                Enviar Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

