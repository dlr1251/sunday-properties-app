import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Code, FileText, Users, BarChart3, Database, ChevronDown, LogOut, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { getSidebarConfig, isSidebarItemActive } from '@/features/dashboard/config/sidebarConfig';

const isProd = import.meta.env.PROD;

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [devDropdownOpen, setDevDropdownOpen] = useState(false);
  const devDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dashboardTab = searchParams.get('tab');
  const { profile, signOut } = useAuth();
  const showDevManagement = profile?.role === 'admin' || profile?.role === 'super_admin';

  const { defaultTab, sections } = useMemo(() => getSidebarConfig(profile?.role), [profile?.role]);

  const headerDevItems = [
    { id: 'docs', label: t('nav.docs'), href: '/docs', icon: FileText },
    { id: 'testing-users', label: t('nav.testingUsers'), href: '/testing-users', icon: Users },
    { id: 'implementation-review', label: t('nav.implementationReview'), href: '/implementation-review', icon: BarChart3 },
    { id: 'database-schema', label: t('nav.databaseSchema'), href: '/database-schema', icon: Database },
    ...(showDevManagement ? [{ id: 'dev-management', label: t('nav.dev'), href: '/dev-management', icon: Code }] : []),
  ];

  useEffect(() => {
    const saved = localStorage.getItem('sidebar:collapsed');
    if (saved != null) {
      setCollapsed(saved === '1');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (devDropdownRef.current && !devDropdownRef.current.contains(event.target as Node)) {
        setDevDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar:collapsed', next ? '1' : '0');
  };

  const pathname = location.pathname;
  const breadcrumbs: { label: string; href: string | null }[] = [];
  breadcrumbs.push({ label: t('nav.dashboard'), href: '/dashboard' });
  if (pathname === '/dashboard') {
    const allItems = sections.flatMap((section) => section.items);
    const current = dashboardTab
      ? allItems.find((item) => item.tab === dashboardTab)
      : undefined;
    if (current) {
      breadcrumbs.push({ label: t(current.label), href: null });
    }
  } else if (pathname.startsWith('/negotiations')) {
    breadcrumbs.push({ label: t('nav.myNegotiations'), href: '/negotiations' });
    if (pathname !== '/negotiations') {
      breadcrumbs.push({ label: t('negotiations.detail'), href: null });
    }
  } else if (pathname.startsWith('/dev-management')) {
    breadcrumbs.push({ label: t('nav.dev'), href: null });
  }

  return (
    <>
      <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-hidden">
        <aside
          aria-label="Sidebar"
          className={`row-span-2 border-r border-border bg-card ${collapsed ? 'w-16' : 'w-64'} transition-[width] duration-200 flex flex-col overflow-hidden`}
        >
          <div className="h-16 flex items-center justify-between px-3 border-b border-border gap-2 shrink-0">
            {!collapsed && <BrandLogo heightClassName="h-10" />}
            <button aria-pressed={collapsed} onClick={toggle} className="text-muted-foreground hover:text-foreground">
              {collapsed ? '»' : '«'}
            </button>
          </div>
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.id} className={section.label ? 'pt-2 first:pt-0' : undefined}>
                {section.label && !collapsed && (
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(section.label)}
                  </p>
                )}
                {section.items.map((item) => (
                  <NavItem
                    key={item.id}
                    to={item.to}
                    active={isSidebarItemActive(item, pathname, dashboardTab, defaultTab)}
                    collapsed={collapsed}
                    label={t(item.label)}
                    icon={item.icon}
                  />
                ))}
              </div>
            ))}
            {showDevManagement && (
              <NavItem
                to="/dev-management"
                active={pathname.startsWith('/dev-management')}
                collapsed={collapsed}
                label={t('nav.dev')}
                icon={Code}
              />
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left text-muted-foreground hover:bg-muted hover:text-foreground ${collapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={collapsed ? 'sr-only' : 'block'}>{t('nav.signOut')}</span>
            </button>
          </nav>
        </aside>

        <header className="h-16 border-b border-border bg-card flex items-center px-4 justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />}
                {crumb.href != null ? (
                  <Link to={crumb.href} className="hover:text-foreground font-medium transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          {!isProd && (
            <div className="flex items-center gap-2">
              <div className="relative" ref={devDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDevDropdownOpen(!devDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Code className="h-4 w-4" />
                  <span>{t('nav.dev')}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${devDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {devDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-popover py-1 shadow-elevated z-50">
                    {headerDevItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => setDevDropdownOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="col-start-2 row-start-2 min-h-0 overflow-auto bg-background flex flex-col">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
};

const NavItem: React.FC<{
  to: string;
  label: string;
  active?: boolean;
  collapsed: boolean;
  icon: LucideIcon;
}> = ({ to, label, active, collapsed, icon: Icon }) => {
  return (
    <Link
      to={to}
      className={[
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        collapsed ? 'justify-center' : '',
        active
          ? 'bg-brand-navy/10 text-brand-navy border-l-2 border-brand-gold pl-[10px]'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={collapsed ? 'sr-only' : 'block'}>{label}</span>
    </Link>
  );
};

export default DashboardShell;
