import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  Search, 
  Heart, 
  FileText, 
  Home, 
  Menu, 
  X,
  Bell,
  User,
  Settings,
  LogOut,
  Shield,
  Star,
  BarChart3,
  BookOpen,
  MessageSquare,
  Briefcase,
  Users,
  TrendingUp
} from 'lucide-react';
import { PublicNavbar } from './PublicNavbar';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange?: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  // Navigation items for authenticated users
  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { id: 'discover', label: 'Explorar Propiedades', icon: MapPin, href: '/discover' },
      { id: 'favorites', label: 'Favoritos', icon: Heart, href: '/favorites' },
      { id: 'documents', label: 'Documentos', icon: FileText, href: '/documents' },
    ];

    // Add role-specific items
    if (['verified', 'premium', 'lawyer', 'superadmin'].includes(user.user_type)) {
      baseItems.push(
        { id: 'negotiations', label: 'Negociaciones', icon: FileText, href: '/negotiations' },
        { id: 'my-properties', label: 'Mis Propiedades', icon: Home, href: '/my-properties' }
      );
    }

    // Lawyer-specific items
    if (user.user_type === 'lawyer') {
      baseItems.push(
        { id: 'cases', label: 'Mis Casos', icon: Briefcase, href: '/cases' },
        { id: 'chat', label: 'Chat', icon: MessageSquare, href: '/chat' }
      );
    }

    // SuperAdmin items
    if (user.user_type === 'superadmin') {
      baseItems.push(
        { id: 'admin', label: 'Administración', icon: Shield, href: '/admin' },
        { id: 'analytics', label: 'Analíticas', icon: TrendingUp, href: '/analytics' }
      );
    }

    return baseItems;
  };

  const getUserBadge = () => {
    if (!user) return null;
    
    switch (user.user_type) {
      case 'verified':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Verificado</Badge>;
      case 'premium':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Premium</Badge>;
      case 'lawyer':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Abogado</Badge>;
      case 'superadmin':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">SuperAdmin</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Registrado</Badge>;
    }
  };

  const navigationItems = getNavigationItems();

  // If user is not authenticated, show public layout
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar currentView={currentView} onViewChange={onViewChange} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Authenticated user layout with sidebar
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-border pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-lg text-foreground">☀️ Sundap</span>
                <p className="text-xs text-muted-foreground">Properties</p>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="mt-5 flex-grow flex flex-col">
            <div className="px-4 mb-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {getUserBadge()}
                  </div>
                </div>
              </Card>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? 'default' : 'ghost'}
                    onClick={() => onViewChange?.(item.id)}
                    className="w-full justify-start text-base h-12"
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="px-2 mt-4">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base h-12"
                  onClick={() => onViewChange?.('blog')}
                >
                  <BookOpen className="mr-3 h-5 w-5" />
                  Blog
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base h-12"
                  onClick={() => onViewChange?.('notifications')}
                >
                  <Bell className="mr-3 h-5 w-5" />
                  Notificaciones
                  {notifications > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-foreground">☀️ Sundap</span>
                    <p className="text-xs text-muted-foreground">Properties</p>
                  </div>
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentView === item.id ? 'default' : 'ghost'}
                      onClick={() => {
                        onViewChange?.(item.id);
                        setSidebarOpen(false);
                      }}
                      className="w-full justify-start text-base h-12"
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-lg text-foreground">☀️ Sundap</span>
                <p className="text-xs text-muted-foreground">Properties</p>
              </div>
            </div>
            <div className="w-6" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};