// src/providers/AppProviders.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { TenantProvider } from '../contexts/TenantContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          {children}
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};