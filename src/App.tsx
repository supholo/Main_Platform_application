// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CICDConfig from './pages/CICDConfig';
import LoggingService from './pages/LoggingService';
import MetricsSystem from './pages/MetricsSystem';
import IdentityManagement from './pages/IdentityManagement';
import ConfigurationManagement from './pages/ConfigurationManagement';
import FeatureManagement from './pages/FeatureManagement';
import RoleManagement from './pages/RoleManagement';
import AuditLog from './pages/AuditLog';
import NotificationSettings from './pages/NotificationSettings';
import OnboardingWizard from './components/OnboardingWizard';

const App: React.FC = () => {


  return (
    <AppProviders>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/cicd" element={<CICDConfig />} />
                  <Route path="/logging" element={<LoggingService />} />
                  <Route path="/metrics" element={<MetricsSystem />} />
                  <Route path="/identity" element={<IdentityManagement />} />
                  <Route path="/configurationManagement" element={<ConfigurationManagement />} />
                  <Route path="/featureManagement" element={<FeatureManagement />} />
                  <Route path="/roles" element={<RoleManagement />} />
                  <Route path="/audit-log" element={<AuditLog />} />
                  <Route path="/notifications" element={<NotificationSettings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProviders>
  );
};

export default App;
