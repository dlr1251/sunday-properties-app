import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { StorageInitializer } from './components/StorageInitializer';

// Page imports
import { HomePage } from './components/pages/HomePage';
import { PropertiesView } from './components/properties/PropertiesView';
import { ProfilePage } from './components/profile/ProfilePage';
import { SuperAdminProfilePage } from './components/profile/SuperAdminProfilePage';
import { AboutPage } from './components/pages/AboutPage';
import { BlogPage } from './components/pages/BlogPage';
import { ContactPage } from './components/pages/ContactPage';
import { DocumentationPage } from './components/pages/DocumentationPage';
import { DocumentationViewer } from './components/documentation/DocumentationViewer';
import { TestingUsersPage } from './components/pages/TestingUsersPage';
import { ImplementationReviewPage } from './components/pages/ImplementationReviewPage';
import { DatabaseSchemaPage } from './components/pages/DatabaseSchemaPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { PropertyUploadWizardModal } from './components/properties/PropertyUploadWizardModal';
import LawyerApprovalPanel from './components/dashboards/LawyerApprovalPanel';

// Property Upload Page Component - wraps the wizard modal for the /upload-property route
const PropertyUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = React.useState(true);

  const handleComplete = () => {
    navigate('/dashboard?tab=properties');
  };

  const handleClose = () => {
    navigate('/dashboard?tab=properties');
  };

  return (
    <PropertyUploadWizardModal
      open={showWizard}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
};

// Dashboard genérico configurable
import { Dashboard, adminConfig } from './features/dashboard';
import { superAdminConfig } from './features/dashboard/config/superAdminConfig';
import { lawyerConfig } from './features/dashboard/config/lawyerConfig';
import { userConfig } from './features/dashboard/config/userConfig';
import { VerificationWizard } from './components/verification/VerificationWizard';
import { VerificationPage } from './components/verification/VerificationPage';
import { UserVerificationDashboard } from './components/verification/UserVerificationDashboard';
import { AdminVerificationDashboard } from './components/verification/AdminVerificationDashboard';
import { LawyerVerificationPanel } from './components/dashboards/LawyerVerificationPanel';
import { ChatWindow } from './components/chat/ChatWindow';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { PropertyDetailView } from './components/properties/PropertyDetailView';
import { PropertyEditPage } from './components/properties/PropertyEditPage';
import { NegotiationPage } from './components/negotiation/NegotiationPage';
import { NegotiationsList } from './components/negotiation/NegotiationsList';
import { DashboardShell } from './components/layout/DashboardShell';
import { useNegotiationPermissions } from './hooks/useNegotiationPermissions';

// Role-based Dashboard Component
const RoleBasedDashboard: React.FC = () => {
  const { profile, user } = useAuth();

  // Show loading while profile is being fetched
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando dashboard...</h1>
          <p className="text-gray-600">Estamos cargando tu información del dashboard.</p>
        </div>
      </div>
    );
  }

  // If profile is not loaded yet, show loading
  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Log complete user structure and relations for debugging
  console.log('🎯 Dashboard Access - Complete User Structure:');
  console.log('  User (Auth) - All Properties:', user);
  console.log('  Profile (Database) - All Properties:', profile);
  console.log('  Relations:', {
    hasAuthUser: !!user,
    hasProfile: !!profile,
    roleMatch: user.role === profile.role,
    emailMatch: user.email === profile.email
  });

  // Prefer dashboard configurable; fallback a legacy si algo falta
  try {
    const role = profile.role;
    if (role === 'super_admin') return <Dashboard config={superAdminConfig} />;
    if (role === 'admin') return <Dashboard config={adminConfig} />;
    if (role === 'lawyer') return <Dashboard config={lawyerConfig} />;
    // agent/registered/verified/premium/visitor → user dashboard config
    return <Dashboard config={userConfig} />;
  } catch (e) {
    console.warn('Falling back to legacy dashboards due to error:', e);
    switch (profile.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'lawyer':
        return <LawyerDashboard />;
      default:
        return <UserDashboard />;
    }
  }
};

// Debug pages removed (development only)

// Dashboard components (role-based) - only import existing ones
import { UserDashboard } from './components/dashboards/UserDashboard';
import { LawyerDashboard } from './components/dashboards/LawyerDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';

// Protected Route component
const ProtectedRoute = ({ children }: { children: any }) => {
  return <>{children}</>;
};

// Property Detail Page Router Component
const PropertiesPageRouter: React.FC = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/properties');
  };

  return <PropertyDetailView propertyId={propertyId || ''} onBack={handleBack} />;
};

// Negotiation Page Router Component with Permissions
const NegotiationPageRouter: React.FC = () => {
  const { negotiationId } = useParams();
  console.log('🛣️ [NegotiationPageRouter] Routing to negotiation:', negotiationId);

  const { canAccess, loading, error } = useNegotiationPermissions(negotiationId || '');
  console.log('🔐 [NegotiationPageRouter] Permission check result:', { canAccess, loading, error });

  if (!negotiationId) {
    console.warn('🚫 [NegotiationPageRouter] No negotiation ID provided');
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Negociación no encontrada</h1>
          <p className="text-lg text-gray-600">El ID de negociación no es válido.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('⏳ [NegotiationPageRouter] Permissions still loading...');
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verificando permisos...</h1>
          <p className="text-lg text-gray-600">Estamos verificando si tienes acceso a esta negociación.</p>
        </div>
      </div>
    );
  }

  if (error || !canAccess) {
    console.warn('🚫 [NegotiationPageRouter] Access denied:', { error, canAccess });
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Acceso denegado</h1>
          <p className="text-lg text-gray-600">
            {error || 'No tienes permisos para acceder a esta negociación.'}
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ [NegotiationPageRouter] Access granted, rendering NegotiationPage');
  return <NegotiationPage negotiationId={negotiationId} />;
};

// User-only Route component (for verification routes)
const UserOnlyRoute = ({ children }) => {
  const { profile, user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Only allow regular users to access verification routes (not admins, lawyers, or agents)
  if (profile.role !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StorageInitializer />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout children={<HomePage />} />} />
          <Route path="/properties" element={<Layout children={<PropertiesView />} />} />
          <Route 
            path="/properties/:propertyId" 
            element={
              <PropertiesPageRouter />
            } 
          />
          <Route 
            path="/properties/:propertyId/edit" 
            element={
              <ProtectedRoute>
                <Layout>
                  <PropertyEditPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route path="/about" element={<Layout children={<AboutPage />} />} />
          <Route path="/blog" element={<Layout children={<BlogPage />} />} />
          <Route path="/contact" element={<Layout children={<ContactPage />} />} />
          <Route path="/docs" element={<Layout children={<DocumentationViewer />} />} />
          <Route path="/docs/:docId" element={<Layout children={<DocumentationViewer />} />} />
          <Route path="/testing-users" element={<Layout children={<TestingUsersPage />} />} />
          <Route path="/implementation-review" element={<Layout children={<ImplementationReviewPage />} />} />
          <Route path="/database-schema" element={<Layout children={<DatabaseSchemaPage />} />} />

          {/* Negotiations */}
          <Route
            path="/negotiations"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <NegotiationsList />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/negotiations/:negotiationId"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <NegotiationPageRouter />
                </DashboardShell>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute children={<Layout children={<ProfilePage />} />} />} />
          <Route path="/settings" element={<ProtectedRoute children={<Layout children={<SettingsPage />} />} />} />
          <Route 
            path="/upload-property" 
            element={
              <ProtectedRoute>
                <Layout>
                  <PropertyUploadPage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* User-only verification routes (only normal users can verify) */}
          <Route path="/verification" element={<UserOnlyRoute children={<Layout children={<VerificationPage />} />} />} />
          <Route path="/verification/status" element={<UserOnlyRoute children={<Layout children={<UserVerificationDashboard />} />} />} />
          <Route path="/verify-profile" element={<UserOnlyRoute children={<Layout children={<VerificationWizard onComplete={() => {}} onCancel={() => {}} />} />} />} />

          {/* Chat Routes */}
          <Route path="/messages" element={<ProtectedRoute children={<Layout children={<ChatWindow />} />} />} />
          <Route path="/messages/:conversationId" element={<ProtectedRoute children={<Layout children={<ChatWindow />} />} />} />

          {/* Dashboard Routes (role-based) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardShell>
                <RoleBasedDashboard />
              </DashboardShell>
            </ProtectedRoute>
          } />

          {/* Legacy routes for backward compatibility (redirect to main dashboard) */}
          <Route path="/dashboard/lawyer" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/verifications" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
