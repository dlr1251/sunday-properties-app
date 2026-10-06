import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  status: string;
  verification_status?: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface SignUpOptions {
  name?: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('useAuth called outside AuthProvider, returning default context');
    // Return a default context to prevent crashes during HMR
    return {
      user: null,
      profile: null,
      loading: true,
      signIn: async () => {
        console.warn('signIn called outside AuthProvider');
      },
      signUp: async () => {
        console.warn('signUp called outside AuthProvider');
      },
      signOut: async () => {
        console.warn('signOut called outside AuthProvider');
      },
      refreshProfile: async () => {
        console.warn('refreshProfile called outside AuthProvider');
      },
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileCache = useRef<Map<string, Profile>>(new Map());

  // Fetch profile data for authenticated user with caching
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    // Check cache first
    if (profileCache.current.has(userId)) {
      return profileCache.current.get(userId)!;
    }

    try {
      // First check if we have a valid session
      const { data: session } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('👤 fetchProfile: Database error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });

        // Handle RLS policy issues gracefully
        if (error.message?.includes('infinite recursion detected') ||
            error.message?.includes('Could not find the table')) {
          console.warn('⚠️ Profiles table access blocked by RLS policies. Using auth user data instead.');
          // Return a basic profile from auth user data
          return {
            id: userId,
            email: session?.user?.email || '',
            full_name: session?.user?.user_metadata?.full_name || session?.user?.email || '',
            phone: session?.user?.phone || '',
            role: 'user',
            status: 'active',
            created_at: session?.user?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }

        return null;
      }

      // 0 rows: user in auth but no profile row (e.g. trigger didn't run, migration gap)
      if (!data) {
        const u = session?.user;
        if (u) {
          const fallback: Profile = {
            id: userId,
            email: u.email ?? '',
            full_name: u.user_metadata?.full_name ?? u.email ?? '',
            phone: u.phone ?? '',
            role: 'user',
            status: 'active',
            created_at: u.created_at ?? new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return fallback;
        }
        return null;
      }

      // Cache the profile
      profileCache.current.set(userId, data);
      return data;
    } catch (error) {
      console.error('👤 fetchProfile: Exception:', error);
      return null;
    }
  }, []);

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ AuthContext: Sign in failed:', error.message);
        throw error;
      }

      // The auth state change handler will manage loading state and profile fetching

    } catch (error) {
      console.error('❌ AuthContext: Sign in error:', error);
      setLoading(false); // Reset loading on error
      throw error;
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, options?: SignUpOptions) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: options?.name ?? '',
            phone: options?.phone ?? '',
            role: options?.role ?? 'user',
          },
        },
      });

      if (error) {
        console.error('❌ AuthContext: Sign up failed:', error.message);
        throw error;
      }

      // Auth state change handler will set user/profile when session is ready
      if (data?.user && !data?.session) {
        // Email confirmation may be required
        setUser(data.user);
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: Sign up error:', error);
      setLoading(false);
      throw error;
    }
  };

  // Sign out function - simplified
  const signOut = async () => {
    try {
      // Call supabase signOut - let auth state change handle cleanup
      await supabase.auth.signOut();

    } catch (error) {
      console.error('❌ AuthContext: Sign out error:', error);
      // Force cleanup even on error
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;
    let currentLoading = true;

    // Initialize auth without clearing existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ AuthContext: Session error:', error);
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id).then(profileData => {
              setProfile(profileData);
              if (mounted) {
                currentLoading = false;
                setLoading(false);
              }
            }).catch(error => {
              console.error('❌ AuthContext: Failed to fetch profile on init:', error);
              setProfile(null);
              if (mounted) {
                currentLoading = false;
                setLoading(false);
              }
            });
          } else {
            setProfile(null);
            currentLoading = false;
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ AuthContext: Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          currentLoading = false;
          setLoading(false);
        }
      }
    };

    // Start initialization
    initializeAuth();

    // Fallback timeout reduced to 3 seconds
    const fallbackTimeout = setTimeout(() => {
      if (mounted && currentLoading) {
        currentLoading = false;
        setLoading(false);
      }
    }, 3000);

    // Listen for auth changes - simplified
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const hasUser = !!session?.user;
        setUser(session?.user ?? null);

        if (hasUser && session?.user) {
          // Fetch profile synchronously to ensure it completes before setting loading to false
          fetchProfile(session.user.id).then(profileData => {
            setProfile(profileData);
            // Only set loading to false after profile is loaded
            currentLoading = false;
            setLoading(false);
          }).catch(error => {
            console.error('❌ AuthContext: Failed to fetch profile in auth state change:', error);
            setProfile(null);
            currentLoading = false;
            setLoading(false);
          });
        } else {
          setProfile(null);
          currentLoading = false;
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]); // Include fetchProfile as dependency

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};