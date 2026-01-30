import React from 'react';
import { MainNavbar } from './navigation/MainNavbar';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <main style={{ paddingTop: '8rem' }}>
        {children}
      </main>
    </div>
  );
};
