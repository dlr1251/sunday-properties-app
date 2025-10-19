import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  BookOpen, 
  Menu, 
  X,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface PublicNavbarProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

  return (
    <>
      <nav className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Button
                variant={currentView === 'discover' ? 'default' : 'ghost'}
                onClick={() => onViewChange?.('discover')}
                className="text-base"
              >
                Explorar Propiedades
              </Button>
              <Button
                variant={currentView === 'blog' ? 'default' : 'ghost'}
                onClick={() => onViewChange?.('blog')}
                className="text-base"
              >
                Blog
              </Button>
            </div>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {getUserBadge()}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewChange?.('dashboard')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-border">
              <Button
                variant={currentView === 'discover' ? 'default' : 'ghost'}
                onClick={() => {
                  onViewChange?.('discover');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Explorar Propiedades
              </Button>
              <Button
                variant={currentView === 'blog' ? 'default' : 'ghost'}
                onClick={() => {
                  onViewChange?.('blog');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Blog
              </Button>
              
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {getUserBadge()}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onViewChange?.('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};
