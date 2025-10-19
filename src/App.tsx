import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { DiscoveryView } from './components/DiscoveryView';
import { PropertyDetailView } from './components/PropertyDetailView';
import { PropertyUploadWizard } from './components/PropertyUploadWizard';
import { VisitManagementView } from './components/VisitManagementView';
import { NegotiationPanelView } from './components/NegotiationPanelView';
import { FinancialAnalysisView } from './components/FinancialAnalysisView';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BlogList } from './components/blog/BlogList';
import { BlogPost } from './components/blog/BlogPost';
import { FavoritesView } from './components/FavoritesView';
import { LawyerDashboard } from './components/dashboards/LawyerDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { UserDashboard } from './components/dashboards/UserDashboard';
import { Toaster } from './components/ui/sonner';

function App() {
  const [currentView, setCurrentView] = useState('discover');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<string | null>(null);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedProperty(null);
    setSelectedBlogPost(null);
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperty(propertyId);
    setCurrentView('property-detail');
  };

  const handleBlogPostSelect = (postId: string) => {
    setSelectedBlogPost(postId);
    setCurrentView('blog-post');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'discover':
        return <DiscoveryView onPropertySelect={handlePropertySelect} />;
      case 'property-detail':
        return selectedProperty ? (
          <PropertyDetailView 
            propertyId={selectedProperty} 
            onBack={() => setCurrentView('discover')}
          />
        ) : null;
      case 'upload-property':
        return (
          <ProtectedRoute requiredRole="verified">
            <PropertyUploadWizard onComplete={() => setCurrentView('my-properties')} />
          </ProtectedRoute>
        );
      case 'visits':
        return (
          <ProtectedRoute requiredRole="registered">
            <VisitManagementView />
          </ProtectedRoute>
        );
      case 'negotiations':
        return (
          <ProtectedRoute requiredRole="verified">
            <NegotiationPanelView />
          </ProtectedRoute>
        );
      case 'financial-analysis':
        return (
          <ProtectedRoute requiredRole="verified">
            <FinancialAnalysisView />
          </ProtectedRoute>
        );
      case 'blog':
        return <BlogList onPostSelect={handleBlogPostSelect} />;
      case 'blog-post':
        return selectedBlogPost ? (
          <BlogPost 
            postId={selectedBlogPost} 
            onBack={() => setCurrentView('blog')}
          />
        ) : null;
      case 'favorites':
        return (
          <ProtectedRoute requiredRole="registered">
            <FavoritesView />
          </ProtectedRoute>
        );
      case 'cases':
        return (
          <ProtectedRoute requiredRole="lawyer">
            <LawyerDashboard />
          </ProtectedRoute>
        );
      case 'chat':
        return (
          <ProtectedRoute requiredRole="lawyer">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Chat</h1>
              <p className="text-muted-foreground">Sistema de chat en desarrollo...</p>
            </div>
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        );
      case 'analytics':
        return (
          <ProtectedRoute requiredRole="superadmin">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Analíticas</h1>
              <p className="text-muted-foreground">Panel de analíticas en desarrollo...</p>
            </div>
          </ProtectedRoute>
        );
      case 'dashboard':
        return (
          <ProtectedRoute requiredRole="registered">
            <UserDashboard />
          </ProtectedRoute>
        );
      case 'my-properties':
        return (
          <ProtectedRoute requiredRole="verified">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Mis Propiedades</h1>
              <p className="text-muted-foreground">Gestión de propiedades en desarrollo...</p>
            </div>
          </ProtectedRoute>
        );
      case 'documents':
        return (
          <ProtectedRoute requiredRole="registered">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Documentos</h1>
              <p className="text-muted-foreground">Gestión de documentos en desarrollo...</p>
            </div>
          </ProtectedRoute>
        );
      case 'notifications':
        return (
          <ProtectedRoute requiredRole="registered">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Notificaciones</h1>
              <p className="text-muted-foreground">Centro de notificaciones en desarrollo...</p>
            </div>
          </ProtectedRoute>
        );
      default:
        return <DiscoveryView onPropertySelect={handlePropertySelect} />;
    }
  };

  return (
    <AuthProvider>
      <Layout currentView={currentView} onViewChange={handleViewChange}>
        {renderContent()}
        <Toaster />
      </Layout>
    </AuthProvider>
  );
}

export default App;