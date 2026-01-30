import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

export const DashboardShell: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  console.log('🏠 [DashboardShell] Initializing dashboard shell');

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    console.log('🔧 [DashboardShell] Loading sidebar state from localStorage');
    const saved = localStorage.getItem('sidebar:collapsed');
    if (saved != null) {
      const isCollapsed = saved === '1';
      setCollapsed(isCollapsed);
      console.log('📱 [DashboardShell] Sidebar state loaded:', isCollapsed ? 'collapsed' : 'expanded');
    } else {
      console.log('📱 [DashboardShell] No saved sidebar state, defaulting to expanded');
    }
  }, []);

  const toggle = () => {
    const next = !collapsed;
    console.log('🔄 [DashboardShell] Toggling sidebar:', collapsed ? 'expanding' : 'collapsing');
    setCollapsed(next);
    localStorage.setItem('sidebar:collapsed', next ? '1' : '0');
    console.log('💾 [DashboardShell] Sidebar state saved to localStorage:', next);
  };

  return (
    <>
      <div className="min-h-screen grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
        <aside aria-label="Sidebar" className={`row-span-2 border-r border-gray-200 bg-white ${collapsed ? 'w-16' : 'w-64'} transition-[width] duration-200 overflow-hidden`}>
          <div className="h-16 flex items-center justify-between px-3 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-900">{collapsed ? 'SP' : 'Sunday'}</span>
            <button aria-pressed={collapsed} onClick={toggle} className="text-gray-600 hover:text-gray-900">
              {collapsed ? '»' : '«'}
            </button>
          </div>
          <nav className="p-2 space-y-1">
            <NavItem to="/dashboard" active={location.pathname === '/dashboard'} collapsed={collapsed} label="Inicio" />
            <NavItem to="/properties" active={location.pathname.startsWith('/properties')} collapsed={collapsed} label="Propiedades" />
            <NavItem to="/negotiations" active={location.pathname.startsWith('/negotiations')} collapsed={collapsed} label="Negociaciones" />
            <NavItem to="/settings" active={location.pathname.startsWith('/settings')} collapsed={collapsed} label="Ajustes" />
          </nav>
        </aside>

        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4 justify-between">
          <div className="text-sm text-gray-700">Dashboard</div>
        </header>

        <main className="col-start-2 row-start-2 min-h-0 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
};

const NavItem: React.FC<{ to: string; label: string; active?: boolean; collapsed: boolean }>= ({ to, label, active, collapsed }) => {
  return (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
      <span className={`${collapsed ? 'block' : 'hidden'}`}>{label.charAt(0)}</span>
      <span className={`${collapsed ? 'hidden' : 'block'}`}>{label}</span>
    </Link>
  );
};

export default DashboardShell;


