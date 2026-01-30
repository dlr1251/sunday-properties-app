import React from 'react';
import { NegotiationParticipant } from '../../hooks/negotiations/useNegotiationData';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { CheckCircle } from 'lucide-react';

export type NegotiationParticipantsProps = {
  buyer?: NegotiationParticipant;
  seller?: NegotiationParticipant;
  lawyer?: NegotiationParticipant;
  agent?: NegotiationParticipant;
  className?: string;
};

const ParticipantCard: React.FC<{
  participant: NegotiationParticipant;
  role: string;
  roleLabel: string;
}> = ({ participant, role, roleLabel }) => {

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No verificado';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'hoy';
    if (diffInDays === 1) return 'ayer';
    if (diffInDays < 7) return `hace ${diffInDays} días`;
    if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} semanas`;
    return `hace ${Math.floor(diffInDays / 30)} meses`;
  };

  // Si está en una negociación, está verificado
  const isVerified = participant.verification_status === 'verified' || participant.email_confirmed_at !== null;
  const verificationDate = participant.email_confirmed_at || participant.created_at;

  // Obtener iniciales para el fallback del avatar
  const getInitials = () => {
    if (participant.name) {
      const names = participant.name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return participant.name.substring(0, 2).toUpperCase();
    }
    return participant.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 relative">
          <Avatar className="w-12 h-12 ring-2 ring-gray-100">
            <AvatarImage 
              src={participant.avatar_url || undefined} 
              alt={participant.name || participant.email} 
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {participant.name || 'Sin nombre'}
            </h3>
            {isVerified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificado
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">{roleLabel}</p>

          <div className="mb-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Email:</span> {participant.email}
            </p>
          </div>

          {isVerified && verificationDate && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">Fecha de verificación:</span>
                <span className="text-gray-500">{getRelativeTime(verificationDate)}</span>
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(verificationDate)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const NegotiationParticipants: React.FC<NegotiationParticipantsProps> = ({
  buyer,
  seller,
  lawyer,
  agent,
  className
}) => {
  const participants = [
    buyer && { participant: buyer, role: 'buyer', roleLabel: 'Comprador' },
    seller && { participant: seller, role: 'seller', roleLabel: 'Vendedor' },
    lawyer && { participant: lawyer, role: 'lawyer', roleLabel: 'Abogado' },
    agent && { participant: agent, role: 'agent', roleLabel: 'Agente' }
  ].filter(Boolean);

  if (participants.length === 0) {
    return (
      <section className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className ?? ''}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Partes involucradas</h2>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="text-sm font-medium text-gray-900 mt-2">No hay participantes definidos</div>
          <div className="text-sm text-gray-600 mt-1">Los participantes aparecerán aquí cuando se asignen a la negociación</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className ?? ''}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Partes involucradas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.map(({ participant, role, roleLabel }) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            role={role}
            roleLabel={roleLabel}
          />
        ))}
      </div>
    </section>
  );
};

export default NegotiationParticipants;
