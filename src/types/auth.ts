export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  user_type: 'visitor' | 'registered' | 'verified' | 'premium' | 'admin' | 'lawyer' | 'superadmin';
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

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}
