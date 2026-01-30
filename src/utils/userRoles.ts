import React from 'react';
import { Crown, Shield, Users, User, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export type AppRole = 'user' | 'agent' | 'admin' | 'super_admin';

export const getRoleLabel = (role: AppRole | string): string => {
  const labels: Record<string, string> = {
    user: 'Usuario',
    agent: 'Agente',
    admin: 'Administrador',
    super_admin: 'Super Administrador'
  };
  return labels[role] || role;
};

export const getRoleDescription = (role: AppRole | string): string => {
  const descriptions: Record<string, string> = {
    user: 'Usuario regular con acceso limitado',
    agent: 'Agente inmobiliario con permisos adicionales',
    admin: 'Administrador con control moderado',
    super_admin: 'Super administrador con control total'
  };
  return descriptions[role] || '';
};

export const getAvailableRoles = () => [
  { value: 'user', label: 'Usuario', description: 'Usuario regular' },
  { value: 'agent', label: 'Agente', description: 'Agente inmobiliario' },
  { value: 'admin', label: 'Administrador', description: 'Administrador del sistema' },
  { value: 'super_admin', label: 'Super Administrador', description: 'Control total del sistema' }
];

export const getRoleIcon = (role: AppRole | string): React.ReactNode => {
  switch (role) {
    case 'super_admin': return <Crown className="h-4 w-4" />;
    case 'admin': return <Shield className="h-4 w-4" />;
    case 'agent': return <Users className="h-4 w-4" />;
    default: return <User className="h-4 w-4" />;
  }
};

export const getRoleBadgeColor = (role: AppRole | string): string => {
  const colors: Record<string, string> = {
    user: 'bg-gray-100 text-gray-800',
    agent: 'bg-blue-100 text-blue-800',
    admin: 'bg-orange-100 text-orange-800',
    super_admin: 'bg-purple-100 text-purple-800'
  };
  return colors[role] || colors.user;
};

export const getVerificationStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
    default: return <XCircle className="h-4 w-4 text-gray-600" />;
  }
};


