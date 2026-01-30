export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  user_type: 'visitor' | 'registered' | 'verified' | 'premium' | 'admin' | 'lawyer' | 'superadmin';
  email_verified?: boolean;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  created_at: string;
  updated_at: string;
  preferences?: Record<string, any>;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    avatar?: string;
  };
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string;
  user_type?: 'registered' | 'verified' | 'premium';
}

// AuthContextType is defined in AuthContext.tsx to avoid duplication
