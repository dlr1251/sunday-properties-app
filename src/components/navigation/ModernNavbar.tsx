import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  BarChart3,
  Building,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSignOutWithRedirect } from '../../utils/auth';
import { AuthModal } from '../auth/AuthModal';
import { Button } from '@/components/ui/button';
import { useTheme } from '../ThemeProvider';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface ModernNavbarProps {
  className?: string;
}

export const ModernNavbar = ({ className = '' }: ModernNavbarProps) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { user, profile, signOut } = auth;
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [devDropdownOpen, setDevDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOutAndRedirect } = useSignOutWithRedirect();

  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const devDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSignOutNavigate = () => {
    signOutAndRedirect(signOut, '/');
  };

  const handleAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Main navigation items
  const mainNavItems = [
    { id: 'home', label: t('nav.home'), href: '/', icon: Home },
    { id: 'properties', label: t('nav.properties'), href: '/properties', icon: Building },
  ];

  // Company/About section
  const companyItems = [
    { id: 'about', label: t('nav.about'), href: '/about', icon: Info },
    { id: 'blog', label: t('nav.blog'), href: '/blog', icon: BookOpen },
    { id: 'contact', label: t('nav.contact'), href: '/contact', icon: Mail },
  ];

  // Development and documentation links
  const devItems = [
    { id: 'docs', label: t('nav.docs'), href: '/docs', icon: FileText },
    { id: 'testing-users', label: t('nav.testingUsers'), href: '/testing-users', icon: Users },
    { id: 'implementation-review', label: t('nav.implementationReview'), href: '/implementation-review', icon: BarChart3 },
    { id: 'database-schema', label: t('nav.databaseSchema'), href: '/database-schema', icon: Database },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { 
      opacity: 0, 
      y: -4, 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
              >
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                  <span className="text-primary-foreground font-bold text-base">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-foreground tracking-tight">Sunday</span>
                  <span className="text-[10px] text-muted-foreground font-medium -mt-0.5 tracking-wide uppercase">Properties</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Main Navigation */}
              {mainNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={[
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                    'transition-all duration-200',
                    isActiveRoute(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  ].join(' ')}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Company Dropdown */}
              <div className="relative" ref={companyDropdownRef}>
                <button
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                  className={[
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg',
                    'text-muted-foreground hover:text-foreground hover:bg-accent',
                    'transition-all duration-200',
                  ].join(' ')}
                >
                  <span>{t('nav.company')}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${companyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {companyDropdownOpen && (
                    <motion.div 
                      className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="p-1">
                        {companyItems.map((item) => (
                          <Link
                            key={item.id}
                            to={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            onClick={() => setCompanyDropdownOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Development Dropdown */}
              <div className="relative" ref={devDropdownRef}>
                <button
                  onClick={() => setDevDropdownOpen(!devDropdownOpen)}
                  className={[
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg',
                    'text-muted-foreground hover:text-foreground hover:bg-accent',
                    'transition-all duration-200',
                  ].join(' ')}
                >
                  <Code className="h-4 w-4" />
                  <span>Dev</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${devDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {devDropdownOpen && (
                    <motion.div 
                      className="absolute top-full left-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="p-1">
                        {devItems.map((item) => (
                          <Link
                            key={item.id}
                            to={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            onClick={() => setDevDropdownOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label={t('toggleTheme')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {user ? (
                <>
                  {/* Dashboard Link */}
                  <Link
                    to="/dashboard"
                    className={[
                      'hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                      'transition-all duration-200',
                      isActiveRoute('/dashboard')
                        ? 'text-success bg-success/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    ].join(' ')}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>{t('nav.dashboard')}</span>
                  </Link>

                  {/* User Avatar Dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-background">
                        <span className="text-sm font-semibold text-primary">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {userDropdownOpen && (
                        <motion.div 
                          className="absolute top-full right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden"
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <div className="px-3 py-3 border-b border-border">
                            <p className="text-sm font-medium text-foreground">
                              {profile?.full_name || t('user')}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <div className="p-1">
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              onClick={() => setUserDropdownOpen(false)}
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span>{t('nav.dashboard')}</span>
                            </Link>
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              onClick={() => setUserDropdownOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>{t('nav.profile')}</span>
                            </Link>
                            <Link
                              to="/settings"
                              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              onClick={() => setUserDropdownOpen(false)}
                            >
                              <Settings className="h-4 w-4" />
                              <span>{t('nav.settings')}</span>
                            </Link>
                          </div>
                          <div className="border-t border-border p-1">
                            <button
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => {
                                handleSignOutNavigate();
                                setUserDropdownOpen(false);
                              }}
                            >
                              <LogOut className="h-4 w-4" />
                              <span>{t('nav.signOut')}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* Auth Buttons */
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    onClick={() => handleAuth('login')}
                    variant="ghost"
                    size="sm"
                  >
                    {t('auth.login')}
                  </Button>
                  <Button
                    onClick={() => handleAuth('register')}
                    size="sm"
                  >
                    {t('auth.register')}
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-foreground hover:bg-accent transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-2 pt-2 pb-4 space-y-1">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={[
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium',
                        'transition-colors duration-200',
                        isActiveRoute(item.href)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                      ].join(' ')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  <div className="pt-2 border-t border-border mt-2">
                    <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('nav.company')}</p>
                    {companyItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border mt-2">
                    <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('nav.development')}</p>
                    {devItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  {!user && (
                    <div className="pt-4 border-t border-border mt-2 space-y-2">
                      <Button
                        onClick={() => {
                          handleAuth('login');
                          setMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        {t('auth.login')}
                      </Button>
                      <Button
                        onClick={() => {
                          handleAuth('register');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full"
                      >
                        {t('auth.register')}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
