import React from 'react';
import { Crown, Briefcase, Gavel, Award, User } from 'lucide-react';

export const formatRelativeTime = (dateString: string | null) => {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

export const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin':
      return <Crown className="h-5 w-5" />;
    case 'admin':
      return <Briefcase className="h-5 w-5" />;
    case 'lawyer':
      return <Gavel className="h-5 w-5" />;
    case 'agent':
      return <Award className="h-5 w-5" />;
    case 'user':
      return <User className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-800';
    case 'admin':
      return 'bg-orange-100 text-orange-800';
    case 'lawyer':
      return 'bg-purple-100 text-purple-800';
    case 'agent':
      return 'bg-blue-100 text-blue-800';
    case 'user':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getVerificationBadge = (status: string | null | undefined) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'success' | 'warning' }> = {
    verified: { label: 'Verified', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    rejected: { label: 'Rejected', variant: 'outline' },
    unverified: { label: 'Unverified', variant: 'secondary' },
    premium: { label: 'Premium', variant: 'default' }
  };
  
  const config = statusMap[status || 'unverified'] || statusMap.unverified;
  return config;
};

export const getRoleCardStyles = (role: string) => {
  switch (role) {
    case 'super_admin':
      return {
        card: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
        avatar: 'ring-slate-300',
        avatarFallback: 'bg-slate-200 text-slate-700',
        button: 'bg-slate-800 hover:bg-slate-900'
      };
    case 'admin':
      return {
        card: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
        avatar: 'ring-orange-300',
        avatarFallback: 'bg-orange-200 text-orange-700',
        button: 'bg-orange-700 hover:bg-orange-800'
      };
    case 'lawyer':
      return {
        card: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
        avatar: 'ring-purple-300',
        avatarFallback: 'bg-purple-200 text-purple-700',
        button: 'bg-purple-700 hover:bg-purple-800'
      };
    case 'agent':
      return {
        card: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
        avatar: 'ring-blue-300',
        avatarFallback: 'bg-blue-200 text-blue-700',
        button: 'bg-blue-700 hover:bg-blue-800'
      };
    case 'user':
      return {
        card: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
        avatar: 'ring-gray-300',
        avatarFallback: 'bg-gray-200 text-gray-700',
        button: 'bg-gray-700 hover:bg-gray-800'
      };
    default:
      return {
        card: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
        avatar: 'ring-gray-300',
        avatarFallback: 'bg-gray-200 text-gray-700',
        button: 'bg-gray-700 hover:bg-gray-800'
      };
  }
};

