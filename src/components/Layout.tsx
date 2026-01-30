import React from 'react';
import { ModernNavbar } from './navigation/ModernNavbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <ModernNavbar />
      <main className="pt-16 animate-fade-in">
        {children}
      </main>
    </div>
  );
};