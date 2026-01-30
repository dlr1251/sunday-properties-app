import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Home,
  Info,
  BookOpen,
  Mail,
  Code,
  Users,
  FileText,
  Database,
  Search,
  BarChart3,
  Shield,
  Building,
  Calendar,
  DollarSign,
  ArrowRight,
  MessageSquare,
  Briefcase,
  CheckCircle,
  UserPlus,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSignOutWithRedirect } from '../../utils/auth';
import { AuthModal } from '../auth/AuthModal';

interface MainNavbarProps {
  className?: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
}

export const MainNavbar = ({ className = '' }: MainNavbarProps) => {
  const auth = useAuth();
  const { user, profile, signOut } = auth;
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [devDropdownOpen, setDevDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { signOutAndRedirect } = useSignOutWithRedirect();

  const companyDropdownRef = useRef(null);
  const devDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setCompanyDropdownOpen(false);
      }
      if (devDropdownRef.current && !devDropdownRef.current.contains(event.target as Node)) {
        setDevDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    signOutAndRedirect(signOut, '/testing-users');
  };

  const handleSignOutNavigate = () => {
    signOutAndRedirect(signOut, '/');
  };

  const handleAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Main navigation items
  const mainNavItems = [
    { id: 'home', label: 'Inicio', href: '/', icon: Home },
    { id: 'properties', label: 'Propiedades', href: '/properties', icon: Building },
  ];

  // Role-based navigation items
  const getRoleBasedNavItems = () => {
    if (!profile) return [];
    
    const baseItems = [
      { id: 'messages', label: 'Mensajes', href: '/messages', icon: MessageSquare }
    ];

    switch (profile.role) {
      case 'user':
        return [
          ...baseItems,
          { id: 'upload-property', label: 'Publicar Propiedad', href: '/upload-property', icon: Plus }
        ];
      case 'lawyer':
        return [
          ...baseItems,
          { id: 'cases', label: 'Mis Casos', href: '/dashboard/lawyer', icon: Briefcase },
          { id: 'verifications', label: 'Verificaciones', href: '/dashboard/lawyer', icon: CheckCircle }
        ];
      case 'admin':
      case 'super_admin':
        return [
          ...baseItems,
          { id: 'admin-dashboard', label: 'Admin Dashboard', href: '/dashboard/admin', icon: Shield },
          { id: 'user-management', label: 'Usuarios', href: '/dashboard/admin', icon: UserPlus }
        ];
      default:
        return baseItems;
    }
  };

  // Company/About section
  const companyItems = [
    { id: 'about', label: 'Acerca de', href: '/about', icon: Info },
    { id: 'blog', label: 'Blog', href: '/blog', icon: BookOpen },
    { id: 'contact', label: 'Contacto', href: '/contact', icon: Mail },
  ];

  // Development and documentation links
  const devItems = [
    { id: 'docs', label: 'Documentación', href: '/docs', icon: FileText },
    { id: 'testing-users', label: 'Testing Users', href: '/testing-users', icon: Users },
    { id: 'implementation-review', label: 'Implementation Review', href: '/implementation-review', icon: BarChart3 },
    { id: 'database-schema', label: 'Database Schema', href: '/database-schema', icon: Database },
  ];

  // Debug links (only in development)
  const debugItems = [
    { id: 'debug-profile', label: 'Debug Auth State', href: '/debug-profile', icon: User },
    { id: 'debug-session', label: 'Session Checker', href: '/debug-session', icon: Shield },
  ];

  const showDebugLinks = (import.meta as any).env?.VITE_SHOW_DEBUG_LINKS === 'true';

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-gray-200 shadow-2xl w-full ${className}`}>
        <div className="w-full px-8">
          <div className="flex items-center justify-between h-32">
            {/* Logo/Brand - MASSIVE */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-6 hover:opacity-80 transition-opacity">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-black text-3xl">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-gray-900 tracking-tight">SUNDAY</span>
                  <span className="text-sm font-medium text-gray-700 -mt-1">PROPERTIES</span>
                </div>
              </Link>
            </div>

            {/* Center Navigation - BIG AND BOLD */}
            <div className="flex items-center space-x-4">
              {/* Main Navigation */}
              {mainNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
                    isActiveRoute(item.href)
                      ? 'text-blue-600 bg-blue-50 border-2 border-blue-200 shadow-xl'
                      : 'text-gray-900 hover:text-blue-600 hover:bg-blue-50 hover:shadow-lg'
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Role-based Navigation */}
              {user && getRoleBasedNavItems().map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
                    isActiveRoute(item.href)
                      ? 'text-green-600 bg-green-50 border-2 border-green-200 shadow-xl'
                      : 'text-gray-900 hover:text-green-600 hover:bg-green-50 hover:shadow-lg'
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Company Dropdown - BIG */}
              <div className="relative" ref={companyDropdownRef}>
                <button
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                  className="flex items-center space-x-3 px-8 py-4 text-lg font-bold text-gray-900 hover:text-blue-600 hover:bg-blue-50 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <span>Empresa</span>
                  <ChevronDown className={`h-6 w-6 transition-transform ${companyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {companyDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-gray-200 shadow-2xl rounded-xl py-2">
                    {companyItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-center space-x-4 hover:bg-blue-50 px-6 py-4 text-lg"
                        onClick={() => setCompanyDropdownOpen(false)}
                      >
                        <item.icon className="h-7 w-7 text-blue-600" />
                        <span className="font-semibold">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Development Dropdown - BIG */}
              <div className="relative" ref={devDropdownRef}>
                <button
                  onClick={() => setDevDropdownOpen(!devDropdownOpen)}
                  className="flex items-center space-x-3 px-8 py-4 text-lg font-bold text-gray-900 hover:text-blue-600 hover:bg-blue-50 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <Code className="h-6 w-6" />
                  <span>Desarrollo</span>
                  <ChevronDown className={`h-6 w-6 transition-transform ${devDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {devDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white border-2 border-gray-200 shadow-2xl rounded-xl py-2">
                    {devItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-center space-x-4 hover:bg-blue-50 px-6 py-4 text-lg"
                        onClick={() => setDevDropdownOpen(false)}
                      >
                        <item.icon className="h-7 w-7 text-blue-600" />
                        <span className="font-semibold">{item.label}</span>
                      </Link>
                    ))}
                    {showDebugLinks && (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="text-base text-gray-600 px-6 py-2 font-bold">🛠️ Debug Tools</div>
                        {debugItems.map((item) => (
                          <Link
                            key={item.id}
                            to={item.href}
                            className="flex items-center space-x-4 hover:bg-orange-50 px-6 py-4 text-lg"
                            onClick={() => setDevDropdownOpen(false)}
                          >
                            <item.icon className="h-7 w-7 text-orange-600" />
                            <span className="font-semibold">{item.label}</span>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - MASSIVE */}
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  {/* Dashboard Link - BIG */}
                  <Link
                    to="/dashboard"
                    className={`hidden lg:flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
                      isActiveRoute('/dashboard')
                        ? 'text-green-600 bg-green-50 border-2 border-green-200 shadow-xl'
                        : 'text-gray-900 hover:text-green-600 hover:bg-green-50 hover:shadow-lg'
                    }`}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span>Dashboard</span>
                  </Link>

                  {/* Publish Property CTA */}
                  <Link
                    to="/upload-property"
                    className={`hidden lg:flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
                      isActiveRoute('/upload-property')
                        ? 'text-indigo-700 bg-indigo-50 border-2 border-indigo-200 shadow-xl'
                        : 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl'
                    }`}
                  >
                    <Building className="h-6 w-6" />
                    <span>Publicar propiedad</span>
                    <ArrowRight className="h-6 w-6" />
                  </Link>

                  {/* User Avatar Dropdown - MASSIVE */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-4 px-6 py-4 hover:bg-blue-50 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-xl border-2 border-blue-200">
                        <span className="text-2xl font-black text-blue-700">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-lg font-bold text-gray-900">
                          {profile?.full_name?.split(' ')[0] || 'Usuario'}
                        </span>
                        <ChevronDown className={`h-6 w-6 text-gray-700 ml-6 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {userDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-72 bg-white border-2 border-gray-200 shadow-2xl rounded-xl py-2">
                        <div className="text-xl font-bold px-6 py-4">
                          {profile?.full_name || 'Usuario'}
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-4 hover:bg-blue-50 px-6 py-4 text-lg"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <BarChart3 className="h-7 w-7 text-blue-600" />
                          <span className="font-semibold">Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-4 hover:bg-blue-50 px-6 py-4 text-lg"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User className="h-7 w-7 text-blue-600" />
                          <span className="font-semibold">Mi Perfil</span>
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center space-x-4 hover:bg-blue-50 px-6 py-4 text-lg"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <MessageSquare className="h-7 w-7 text-blue-600" />
                          <span className="font-semibold">Mensajes</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-4 hover:bg-blue-50 px-6 py-4 text-lg"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Settings className="h-7 w-7 text-blue-600" />
                          <span className="font-semibold">Configuración</span>
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          className="w-full flex items-center space-x-4 text-red-600 hover:bg-red-50 px-6 py-4 text-lg"
                          onClick={() => {
                            handleSignOutNavigate();
                            setUserDropdownOpen(false);
                          }}
                        >
                          <LogOut className="h-7 w-7" />
                          <span className="font-bold">Cerrar Sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Auth Buttons - MASSIVE */
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleAuth('login')}
                    className="text-lg font-bold text-gray-900 hover:text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleAuth('register')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};