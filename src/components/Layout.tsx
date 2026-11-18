import React from 'react';
import { ModernNavbar } from './navigation/ModernNavbar';
import { Footer } from './navigation/Footer';
import { SunnyChatWidget } from './sunny/SunnyChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <ModernNavbar />
      <main className="pt-16 animate-fade-in flex-1">
        {children}
      </main>
      <Footer />
      <SunnyChatWidget />
    </div>
  );
};