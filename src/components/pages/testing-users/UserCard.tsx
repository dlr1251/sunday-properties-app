import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, Building, Handshake } from 'lucide-react';
import { UserCardProps } from './types';
import { formatRelativeTime, getRoleColor, getVerificationBadge, getRoleCardStyles } from './utils';

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isCurrentUser,
  isLoggingIn,
  onLogin,
  loading,
  variant = 'default'
}) => {
  const styles = getRoleCardStyles(user.role);
  const verification = getVerificationBadge(user.verification_status);
  const avatarSize = variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12';
  const titleSize = variant === 'compact' ? 'text-base' : 'text-lg';
  const descriptionSize = variant === 'compact' ? 'text-xs' : 'text-sm';

  return (
    <Card className={`${styles.card} transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className={`${avatarSize} ring-2 ${styles.avatar}`}>
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className={styles.avatarFallback}>
                {(user.full_name || user.email).charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isCurrentUser && (
              <div className={`absolute -bottom-1 -right-1 ${variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} bg-green-500 rounded-full border-2 border-white flex items-center justify-center`}>
                <div className={`${variant === 'compact' ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-green-300 rounded-full animate-pulse`}></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className={`${titleSize} text-slate-900`}>
                {user.full_name || user.email}
              </CardTitle>
              {isCurrentUser && (
                <span className="text-xs text-green-600 font-medium">(Current)</span>
              )}
            </div>
            <CardDescription className={`${descriptionSize} text-slate-600`}>
              {user.email}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getRoleColor(user.role)}>
              {user.role.replace('_', ' ')}
            </Badge>
            <Badge variant={verification.variant}>
              {verification.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Phone</p>
            <p className="text-slate-900 font-medium">{user.phone || 'Not set'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Location</p>
            <p className="text-slate-900 font-medium">{user.location || 'Not set'}</p>
          </div>
        </div>

        {user.bio && (
          <div>
            <p className="text-slate-500 text-xs mb-1">Bio</p>
            <p className="text-slate-700 text-sm leading-relaxed">{user.bio}</p>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Last login: {user.last_login_at ? formatRelativeTime(user.last_login_at) : 'Never'}</span>
              <span>{user.negotiationsCount || 0} active {user.negotiationsCount === 1 ? 'negotiation' : 'negotiations'}</span>
            </div>
            {(user.activeNegotiations && user.activeNegotiations.length > 0) && (
              <div className="text-xs text-slate-600 space-y-1">
                {user.activeNegotiations.slice(0, 3).map((neg: any) => (
                  <div key={neg.id} className="flex items-center gap-1">
                    <span className="text-slate-500">•</span>
                    <span className="truncate">{neg.property?.title || 'Property'}</span>
                    {neg.latestOffer && (
                      <span className="text-green-600 font-medium">
                        ${neg.latestOffer.offer_price?.toLocaleString() || 'N/A'}
                      </span>
                    )}
                  </div>
                ))}
                {user.activeNegotiations.length > 3 && (
                  <div className="text-slate-400 italic">
                    +{user.activeNegotiations.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building className="h-4 w-4 text-blue-600" />
              <span
                className="cursor-help"
                title={user.properties && user.properties.length > 0
                  ? user.properties.map((p: any) => p.title).join(', ')
                  : 'No properties'
                }
              >
                {user.propertiesCount || 0} {user.propertiesCount === 1 ? 'property' : 'properties'}
              </span>
            </div>
            {(user.negotiationsCount || 0) > 0 && (
              <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                <Handshake className="h-4 w-4 text-green-600" />
                <span>{user.negotiationsCount} active</span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={() => onLogin(user)}
          disabled={loading || isLoggingIn}
          className={`w-full ${styles.button} text-white`}
          size="sm"
        >
          {isLoggingIn ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </Button>
      </CardContent>
    </Card>
  );
};

