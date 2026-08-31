import React from 'react';
import { useTranslation } from 'react-i18next';
import { NegotiationParticipant } from '../../hooks/negotiations/useNegotiationData';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { getAvatarUrl } from '../../utils/avatar';
import { CheckCircle } from 'lucide-react';

export type NegotiationParticipantsProps = {
  buyer?: NegotiationParticipant;
  seller?: NegotiationParticipant;
  lawyer?: NegotiationParticipant;
  agent?: NegotiationParticipant;
  currentUserId?: string | null;
  className?: string;
};

const ParticipantRow: React.FC<{
  participant: NegotiationParticipant;
  roleLabel: string;
}> = ({ participant, roleLabel }) => {
  const { t } = useTranslation();
  const isVerified = participant.verification_status === 'verified' || participant.email_confirmed_at !== null;

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
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 border-b border-border last:border-b-0">
      <div className="flex-shrink-0 relative">
        <Avatar className="w-9 h-9 ring-2 ring-gray-100">
          <AvatarImage src={getAvatarUrl(participant)} alt={participant.name || participant.email} />
          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <CheckCircle className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">{participant.name || t('negotiations.unnamed')}</span>
          {isVerified && (
            <span className="inline-flex items-center rounded-full text-xs font-medium bg-green-100 text-green-800 px-1.5 py-0.5">
              <CheckCircle className="w-3 h-3 mr-0.5" />
              {t('profile.verified')}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{roleLabel} · {participant.email}</p>
      </div>
    </div>
  );
};

export const NegotiationParticipants: React.FC<NegotiationParticipantsProps> = ({
  buyer,
  seller,
  lawyer,
  agent,
  currentUserId,
  className
}) => {
  const { t } = useTranslation();
  const participants = [
    buyer && { participant: buyer, role: 'buyer', roleLabel: t('negotiations.roles.buyer') },
    seller && currentUserId !== seller.id && { participant: seller, role: 'seller', roleLabel: t('negotiations.roles.seller') },
    lawyer && { participant: lawyer, role: 'lawyer', roleLabel: t('negotiations.roles.lawyer') },
    agent && { participant: agent, role: 'agent', roleLabel: t('negotiations.roles.agent') }
  ].filter(Boolean);

  return (
    <section className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden ${className ?? ''}`}>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-left font-medium text-foreground hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-xl [&::-webkit-details-marker]:hidden">
          <span className="text-base sm:text-lg font-semibold">{t('negotiations.participantsTitle')}</span>
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            {t('negotiations.participantCount', { count: participants.length })}
          </span>
          <svg className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-border">
          {participants.length === 0 ? (
            <div className="text-center py-8 px-4">
              <svg className="mx-auto h-10 w-10 text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium text-foreground mt-2">{t('negotiations.noParticipants')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('negotiations.noParticipantsHint')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {participants.map(({ participant, roleLabel }) => (
                <li key={participant.id}>
                  <ParticipantRow participant={participant} roleLabel={roleLabel} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
};

export default NegotiationParticipants;
