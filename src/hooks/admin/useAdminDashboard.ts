import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface AdminStats {
  totalUsers: number;
  registeredUsers: number;
  verifiedUsers: number;
  premiumUsers: number;
  lawyerUsers: number;
  adminUsers: number;
  activeProperties: number;
  pendingProperties: number;
  soldProperties: number;
  totalProperties: number;
  pendingVerifications: number;
  activeVisits: number;
  completedVisits: number;
  activeNegotiations: number;
  completedNegotiations: number;
  pendingReports: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

// Regular Admin Dashboard Hook (limited access)
export const useAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    registeredUsers: 0,
    verifiedUsers: 0,
    premiumUsers: 0,
    lawyerUsers: 0,
    adminUsers: 0,
    activeProperties: 0,
    pendingProperties: 0,
    soldProperties: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    activeVisits: 0,
    completedVisits: 0,
    activeNegotiations: 0,
    completedNegotiations: 0,
    pendingReports: 0,
    totalRevenue: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserStats = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;

    const totalUsers = data?.length || 0;
    const registeredUsers = data?.filter(u => u.role === 'registered').length || 0;
    const verifiedUsers = data?.filter(u => u.verification_status === 'verified').length || 0;
    const premiumUsers = data?.filter(u => u.role === 'premium').length || 0;
    const lawyerUsers = data?.filter(u => u.role === 'lawyer').length || 0;
    const adminUsers = data?.filter(u => u.role === 'admin' || u.role === 'super_admin').length || 0;

    return {
      totalUsers,
      registeredUsers,
      verifiedUsers,
      premiumUsers,
      lawyerUsers,
      adminUsers
    };
  };

  const fetchPropertyStats = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('status');

    if (error) throw error;

    const totalProperties = data?.length || 0;
    const activeProperties = data?.filter(p => p.status === 'published').length || 0;
    const pendingProperties = data?.filter(p => p.status === 'pending').length || 0;
    const soldProperties = data?.filter(p => p.status === 'sold').length || 0;

    return {
      activeProperties,
      pendingProperties,
      soldProperties,
      totalProperties
    };
  };

  const fetchVerificationStats = async () => {
    const { count, error } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;

    return {
      pendingVerifications: count || 0
    };
  };

  const fetchVisitStats = async () => {
    const { data, error } = await supabase
      .from('visits')
      .select('status');

    if (error) throw error;

    const activeVisits = data?.filter(v => v.status === 'scheduled' || v.status === 'completed').length || 0;
    const completedVisits = data?.filter(v => v.status === 'completed').length || 0;

    return {
      activeVisits,
      completedVisits
    };
  };

  const fetchNegotiationStats = async () => {
    const { data, error } = await supabase
      .from('offers')
      .select('status');

    if (error) throw error;

    const activeNegotiations = data?.filter(o => o.status === 'pending' || o.status === 'active').length || 0;
    const completedNegotiations = data?.filter(o => o.status === 'accepted' || o.status === 'completed').length || 0;

    return {
      activeNegotiations,
      completedNegotiations
    };
  };

  const fetchReportStats = async () => {
    const { count, error } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;

    return {
      pendingReports: count || 0
    };
  };

  const fetchRevenueStats = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('price')
        .eq('status', 'completed');

      if (error) {
        console.warn('Contracts table query failed, using 0 for revenue:', error.message);
        return { totalRevenue: 0 };
      }

      const totalRevenue = data?.reduce((sum, contract) => sum + (contract.price || 0), 0) || 0;
      return { totalRevenue };
    } catch (err) {
      console.warn('Error fetching revenue stats:', err);
      return { totalRevenue: 0 };
    }
  };

  const fetchRecentActivity = async () => {
    // This would be a more complex query to get recent activity
    // For now, return some mock data
    return [
      {
        id: '1',
        type: 'user_login',
        title: 'User Login',
        message: 'John Doe logged in successfully',
        timestamp: '2025-10-25 02:40:00',
        status: 'success'
      },
      {
        id: '2',
        type: 'property_published',
        title: 'Property Published',
        message: 'New apartment listed in Chapinero',
        timestamp: '2025-10-25 02:35:00',
        status: 'success'
      }
    ];
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all stats sequentially to avoid resource exhaustion
      const userStats = await fetchUserStats();
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay

      const propertyStats = await fetchPropertyStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const verificationStats = await fetchVerificationStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const visitStats = await fetchVisitStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const negotiationStats = await fetchNegotiationStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const reportStats = await fetchReportStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const revenueStats = await fetchRevenueStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      setStats({
        ...userStats,
        ...propertyStats,
        ...verificationStats,
        ...visitStats,
        ...negotiationStats,
        ...reportStats,
        ...revenueStats
      });

      // Fetch recent activity
      const activity = await fetchRecentActivity();
      setRecentActivity(activity);

    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    recentActivity,
    loading,
    error,
    refetch: fetchStats
  };
};

// SuperAdmin Dashboard Hook (full system access)
export const useSuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    registeredUsers: 0,
    verifiedUsers: 0,
    premiumUsers: 0,
    lawyerUsers: 0,
    adminUsers: 0,
    activeProperties: 0,
    pendingProperties: 0,
    soldProperties: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    activeVisits: 0,
    completedVisits: 0,
    activeNegotiations: 0,
    completedNegotiations: 0,
    pendingReports: 0,
    totalRevenue: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserStats = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;

    const totalUsers = data?.length || 0;
    const registeredUsers = data?.filter(u => u.role === 'registered').length || 0;
    const verifiedUsers = data?.filter(u => u.verification_status === 'verified').length || 0;
    const premiumUsers = data?.filter(u => u.role === 'premium').length || 0;
    const lawyerUsers = data?.filter(u => u.role === 'lawyer').length || 0;
    const adminUsers = data?.filter(u => u.role === 'admin' || u.role === 'super_admin').length || 0;

    return {
      totalUsers,
      registeredUsers,
      verifiedUsers,
      premiumUsers,
      lawyerUsers,
      adminUsers
    };
  };

  const fetchPropertyStats = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('status');

    if (error) throw error;

    const totalProperties = data?.length || 0;
    const activeProperties = data?.filter(p => p.status === 'published').length || 0;
    const pendingProperties = data?.filter(p => p.status === 'pending').length || 0;
    const soldProperties = data?.filter(p => p.status === 'sold').length || 0;

    return {
      activeProperties,
      pendingProperties,
      soldProperties,
      totalProperties
    };
  };

  const fetchVerificationStats = async () => {
    const { count, error } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;

    return {
      pendingVerifications: count || 0
    };
  };

  const fetchVisitStats = async () => {
    const { data, error } = await supabase
      .from('visits')
      .select('status');

    if (error) throw error;

    const activeVisits = data?.filter(v => v.status === 'scheduled' || v.status === 'completed').length || 0;
    const completedVisits = data?.filter(v => v.status === 'completed').length || 0;

    return {
      activeVisits,
      completedVisits
    };
  };

  const fetchNegotiationStats = async () => {
    const { data, error } = await supabase
      .from('offers')
      .select('status');

    if (error) throw error;

    const activeNegotiations = data?.filter(o => o.status === 'pending' || o.status === 'active').length || 0;
    const completedNegotiations = data?.filter(o => o.status === 'accepted' || o.status === 'completed').length || 0;

    return {
      activeNegotiations,
      completedNegotiations
    };
  };

  const fetchReportStats = async () => {
    const { count, error } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;

    return {
      pendingReports: count || 0
    };
  };

  const fetchRevenueStats = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('final_price')
        .eq('status', 'completed');

      if (error) {
        console.warn('SuperAdmin: Contracts table query failed, using 0 for revenue:', error.message);
        return { totalRevenue: 0 };
      }

      const totalRevenue = data?.reduce((sum, contract) => sum + (contract.final_price || 0), 0) || 0;
      return { totalRevenue };
    } catch (err) {
      console.warn('SuperAdmin: Error fetching revenue stats:', err);
      return { totalRevenue: 0 };
    }
  };

  const fetchRecentActivity = async () => {
    // SuperAdmin gets more detailed activity
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('SuperAdmin: Audit logs not available, using mock data:', error.message);
        return [
          {
            id: '1',
            type: 'user_registration',
            title: 'User Registration',
            message: 'New user registered in system',
            timestamp: '2025-10-25 02:40:00',
            status: 'success'
          },
          {
            id: '2',
            type: 'property_published',
            title: 'Property Published',
            message: 'Property approved and published',
            timestamp: '2025-10-25 02:35:00',
            status: 'success'
          }
        ];
      }

      return (data || []).map(log => ({
        id: log.id,
        type: log.action_type,
        title: getActivityTitle(log),
        message: getActivityDescription(log),
        timestamp: log.created_at,
        status: getActivityStatus(log)
      }));
    } catch (err) {
      console.warn('SuperAdmin: Error fetching recent activity:', err);
      return [];
    }
  };

  const getActivityTitle = (log: any): string => {
    switch (log.action_type) {
      case 'user_registration': return 'Nuevo usuario registrado';
      case 'property_created': return 'Nueva propiedad creada';
      case 'property_approved': return 'Propiedad aprobada';
      case 'verification_submitted': return 'Solicitud de verificación';
      case 'offer_created': return 'Nueva oferta enviada';
      case 'negotiation_closed': return 'Negociación cerrada';
      default: return 'Actividad reciente';
    }
  };

  const getActivityDescription = (log: any): string => {
    switch (log.action_type) {
      case 'user_registration': return `Usuario ${log.user_id} se registró`;
      case 'property_created': return `Propiedad creada por ${log.user_id}`;
      case 'property_approved': return `Propiedad ${log.resource_id} aprobada`;
      case 'verification_submitted': return `Verificación enviada por ${log.user_id}`;
      case 'offer_created': return `Oferta enviada para propiedad ${log.changes?.property_id}`;
      case 'negotiation_closed': return `Negociación cerrada para propiedad ${log.resource_id}`;
      default: return 'Actividad en la plataforma';
    }
  };

  const getActivityStatus = (log: any): 'success' | 'warning' | 'error' | 'info' => {
    switch (log.action_type) {
      case 'user_registration':
      case 'property_approved':
      case 'negotiation_closed':
        return 'success';
      case 'property_created':
      case 'verification_submitted':
      case 'offer_created':
        return 'info';
      default:
        return 'info';
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // SuperAdmin: Fetch all stats with full access
      const userStats = await fetchUserStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const propertyStats = await fetchPropertyStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const verificationStats = await fetchVerificationStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const visitStats = await fetchVisitStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const negotiationStats = await fetchNegotiationStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const reportStats = await fetchReportStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      const revenueStats = await fetchRevenueStats();
      await new Promise(resolve => setTimeout(resolve, 50));

      setStats({
        ...userStats,
        ...propertyStats,
        ...verificationStats,
        ...visitStats,
        ...negotiationStats,
        ...reportStats,
        ...revenueStats
      });

      // Fetch recent activity (SuperAdmin gets real audit logs)
      const activity = await fetchRecentActivity();
      setRecentActivity(activity);

    } catch (err: any) {
      console.error('SuperAdmin: Error fetching admin stats:', err);
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    recentActivity,
    loading,
    error,
    refetch: fetchStats
  };
};
