import { supabase } from './supabase';

/**
 * Feature flags for gradual rollout of new features
 */
export enum FeatureFlag {
  STRUCTURED_CONDITIONS = 'structured_conditions',
  NPV_CALCULATION = 'npv_calculation',
  ENHANCED_LAWYER_WORKFLOW = 'enhanced_lawyer_workflow',
  LEGAL_DATA_EXTRACTION = 'legal_data_extraction'
}

export interface FeatureFlagConfig {
  id: string;
  flag_name: string;
  enabled_globally: boolean;
  enabled_for_users: string[];
  enabled_for_roles: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Service for managing and checking feature flags
 */
export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private cache: Map<string, { enabled: boolean; expires: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Check if a feature flag is enabled
   * Uses caching to reduce database queries
   */
  async isEnabled(flag: FeatureFlag | string, userId?: string): Promise<boolean> {
    const cacheKey = `${flag}:${userId || 'anonymous'}`;
    const cached = this.cache.get(cacheKey);

    // Return cached value if still valid
    if (cached && cached.expires > Date.now()) {
      return cached.enabled;
    }

    try {
      // Check via database function for better performance
      const { data, error } = await supabase.rpc('is_feature_enabled', {
        p_flag_name: flag,
        p_user_id: userId || null
      });

      if (error) {
        console.error('Error checking feature flag:', error);
        // Fail gracefully - assume feature is disabled on error
        this.cache.set(cacheKey, { enabled: false, expires: Date.now() + this.CACHE_TTL });
        return false;
      }

      const enabled = data === true;
      
      // Cache the result
      this.cache.set(cacheKey, { 
        enabled, 
        expires: Date.now() + this.CACHE_TTL 
      });

      return enabled;
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  }

  /**
   * Enable a feature for a specific user
   * Admin only
   */
  async enableForUser(flag: FeatureFlag | string, userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('add_user_to_feature_flag', {
        p_flag_name: flag,
        p_user_id: userId
      });

      if (error) {
        throw new Error(`Failed to enable feature for user: ${error.message}`);
      }

      // Clear cache for this flag
      this.clearCache(flag);
    } catch (error) {
      console.error('Error enabling feature for user:', error);
      throw error;
    }
  }

  /**
   * Enable a feature globally
   * Admin only
   */
  async enableGlobally(flag: FeatureFlag | string): Promise<void> {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled_globally: true })
        .eq('flag_name', flag);

      if (error) {
        throw new Error(`Failed to enable feature globally: ${error.message}`);
      }

      // Clear cache for this flag
      this.clearCache(flag);
    } catch (error) {
      console.error('Error enabling feature globally:', error);
      throw error;
    }
  }

  /**
   * Disable a feature globally
   * Admin only
   */
  async disableGlobally(flag: FeatureFlag | string): Promise<void> {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ 
          enabled_globally: false,
          enabled_for_users: [],
          enabled_for_roles: []
        })
        .eq('flag_name', flag);

      if (error) {
        throw new Error(`Failed to disable feature: ${error.message}`);
      }

      // Clear cache for this flag
      this.clearCache(flag);
    } catch (error) {
      console.error('Error disabling feature:', error);
      throw error;
    }
  }

  /**
   * Get configuration for a specific feature flag
   */
  async getConfig(flag: FeatureFlag | string): Promise<FeatureFlagConfig | null> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('flag_name', flag)
        .single();

      if (error) {
        console.error('Error getting feature flag config:', error);
        return null;
      }

      return data as FeatureFlagConfig;
    } catch (error) {
      console.error('Error getting feature flag config:', error);
      return null;
    }
  }

  /**
   * Get all feature flags (admin only)
   */
  async getAllFlags(): Promise<FeatureFlagConfig[]> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to get feature flags: ${error.message}`);
      }

      return data as FeatureFlagConfig[];
    } catch (error) {
      console.error('Error getting all feature flags:', error);
      return [];
    }
  }

  /**
   * Clear cache for a specific flag or all flags
   */
  clearCache(flag?: FeatureFlag | string): void {
    if (flag) {
      // Clear specific flag from all user contexts
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${flag}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Batch check multiple flags at once
   */
  async checkMultiple(flags: (FeatureFlag | string)[], userId?: string): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Use Promise.all for parallel execution
    const promises = flags.map(async (flag) => {
      const enabled = await this.isEnabled(flag, userId);
      return { flag, enabled };
    });

    const resolved = await Promise.all(promises);
    
    for (const { flag, enabled } of resolved) {
      results[flag] = enabled;
    }

    return results;
  }
}

// Export singleton instance
export const featureFlagService = FeatureFlagService.getInstance();

// Helper function for easy access in components
export const isFeatureEnabled = async (flag: FeatureFlag | string, userId?: string): Promise<boolean> => {
  return featureFlagService.isEnabled(flag, userId);
};
