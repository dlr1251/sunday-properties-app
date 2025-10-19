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
  BarChart3
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'discover' | 'negotiations' | 'favorites' | 'documents' | 'my-properties';
  userType: 'visitor' | 'registered' | 'verified' | 'premium' | 'admin';
  onUploadProperty?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, userType, onUploadProperty }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  const navigationItems = [
    { id: 'discover', label: 'Descubrir', icon: MapPin, href: '/discover' },
    { id: 'negotiations', label: 'Negociaciones', icon: FileText, href: '/negotiations' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, href: '/favorites' },
    { id: 'documents', label: 'Documentos', icon: FileText, href: '/documents' },
    { id: 'my-properties', label: 'Mis Propiedades', icon: Home, href: '/my-properties' },
  ];

  const getUserBadge = () => {
    switch (userType) {
      case 'verified':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Verificado</Badge>;
      case 'premium':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Premium</Badge>;
      case 'admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Admin</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-foreground">Sunday</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {userType === 'verified' || userType === 'premium' || userType === 'admin' ? (
            <Button 
              size="sm" 
              onClick={onUploadProperty}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Publicar</span>
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white">
                {notifications}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-border lg:flex lg:flex-col">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-lg text-foreground">Sunday</span>
              <p className="text-xs text-muted-foreground">Properties</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start h-12 px-3 text-left ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="font-medium text-base">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 px-3 text-left mb-3"
              onClick={onUploadProperty}
            >
              <Home className="mr-3 h-5 w-5" />
              <span className="font-medium text-base">Publicar Propiedad</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 px-3 text-left"
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              <span className="font-medium text-base">Análisis Financiero</span>
            </Button>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Juan Pérez
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {getUserBadge()}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-3">
            <Button variant="ghost" size="sm" className="flex-1 h-9">
              <Settings className="h-4 w-4 mr-2" />
              <span className="text-sm">Config</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 h-9">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">Salir</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border">
            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-foreground">Sunday</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="px-3 py-6 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start h-12 px-3 text-left ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="font-medium text-base">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Juan Pérez
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getUserBadge()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="min-h-screen">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-2">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`flex flex-col items-center space-y-1 p-2 h-auto ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
