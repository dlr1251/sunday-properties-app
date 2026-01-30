import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { featureFlagService, FeatureFlag } from '../lib/featureFlags';
import { useAuth } from './AuthContext';

interface FeatureFlagsContextType {
  flags: Record<string, boolean>;
  loading: boolean;
  isEnabled: (flag: FeatureFlag | string) => boolean;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

/**
 * Hook to access feature flags in components
 */
export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    console.warn('useFeatureFlags called outside FeatureFlagsProvider, returning default context');
    return {
      flags: {},
      loading: true,
      isEnabled: () => false,
      refreshFlags: async () => {}
    };
  }
  return context;
};

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider for feature flags context
 * Manages feature flag state and provides access to all components
 */
export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  /**
   * Refresh all feature flags
   */
  const refreshFlags = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Check all feature flags at once for performance
      const allFlags = await featureFlagService.checkMultiple(
        Object.values(FeatureFlag),
        user?.id
      );
      
      setFlags(allFlags);
    } catch (error) {
      console.error('Error refreshing feature flags:', error);
      // Set all flags to false on error
      setFlags(Object.values(FeatureFlag).reduce((acc, flag) => {
        acc[flag] = false;
        return acc;
      }, {} as Record<string, boolean>));
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  /**
   * Initialize flags when user changes or on mount
   */
  useEffect(() => {
    refreshFlags();
  }, [user?.id]); // Only re-fetch when user ID changes

  /**
   * Check if a specific flag is enabled
   */
  const isEnabled = useCallback((flag: FeatureFlag | string): boolean => {
    return flags[flag] || false;
  }, [flags]);

  /**
   * Periodically refresh flags (every 5 minutes)
   * This ensures users get updated feature flag status without page refresh
   */
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFlags();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshFlags]);

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, isEnabled, refreshFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

/**
 * Higher-order component to wrap components that require specific feature flags
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  requiredFlag: FeatureFlag | string
) {
  return function WithFeatureFlag(props: P) {
    const { isEnabled, loading } = useFeatureFlags();

    if (loading) {
      return null; // Or a loading spinner
    }

    if (!isEnabled(requiredFlag)) {
      return null; // Feature not enabled, don't render
    }

    return <Component {...props} />;
  };
}

/**
 * Hook to get a single feature flag value
 */
export function useFeatureFlag(flag: FeatureFlag | string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}

