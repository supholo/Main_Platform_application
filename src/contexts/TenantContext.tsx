// src/contexts/TenantContext.tsx
  import React, { createContext, useContext, useReducer, useEffect } from 'react';
  import { Tenant, TenantConfig } from '../types/tenant';
  import { useAuth } from './AuthContext';
  
  interface TenantState {
    currentTenant: Tenant | null;
    loading: boolean;
    error: Error | null;
  }
  
  type TenantAction =
    | { type: 'TENANT_LOADING' }
    | { type: 'TENANT_LOADED'; payload: Tenant }
    | { type: 'TENANT_ERROR'; payload: Error }
    | { type: 'TENANT_UPDATED'; payload: Tenant }
    | { type: 'TENANT_CONFIG_UPDATED'; payload: TenantConfig }
    | { type: 'TENANT_RESET' };
  
  interface TenantContextType extends TenantState {
    setCurrentTenant: (tenant: Tenant) => void;
    updateTenantConfig: (config: Partial<TenantConfig>) => Promise<void>;
    resetTenant: () => void;
  }
  
  const TenantContext = createContext<TenantContextType | undefined>(undefined);
  
  const tenantReducer = (state: TenantState, action: TenantAction): TenantState => {
    switch (action.type) {
      case 'TENANT_LOADING':
        return { ...state, loading: true, error: null };
      case 'TENANT_LOADED':
        return { currentTenant: action.payload, loading: false, error: null };
      case 'TENANT_ERROR':
        return { ...state, loading: false, error: action.payload };
      case 'TENANT_UPDATED':
        return { ...state, currentTenant: action.payload, loading: false };
      case 'TENANT_CONFIG_UPDATED':
        return state.currentTenant
          ? {
              ...state,
              currentTenant: {
                ...state.currentTenant,
                config: { ...state.currentTenant.config, ...action.payload }
              }
            }
          : state;
      case 'TENANT_RESET':
        return { currentTenant: null, loading: false, error: null };
      default:
        return state;
    }
  };
  
  // Mock tenant service
  const tenantService = {
    async getTenant(id: string): Promise<Tenant> {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id,
        name: 'Demo Company',
        domain: 'demo.example.com',
        status: 'active',
        subscription: {
          plan: 'pro',
          status: 'active',
          startDate: new Date().toISOString(),
          features: ['feature1', 'feature2']
        },
        config: {
          branding: {
            primaryColor: '#6366F1',
            secondaryColor: '#4F46E5'
          },
          features: {
            mfa: true,
            audit: true
          },
          security: {
            mfaRequired: false,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireNumbers: true,
              requireSymbols: true
            },
            sessionTimeout: 3600
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },
  
    async updateTenantConfig(id: string, config: Partial<TenantConfig>): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Mock update logic
    }
  };
  
  export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(tenantReducer, {
      currentTenant: null,
      loading: true,
      error: null
    });
  
    const { user, isAuthenticated } = useAuth();
  
    useEffect(() => {
      const initializeTenant = async () => {
        if (isAuthenticated && user?.tenantId) {
          try {
            dispatch({ type: 'TENANT_LOADING' });
            const tenant = await tenantService.getTenant(user.tenantId);
            dispatch({ type: 'TENANT_LOADED', payload: tenant });
          } catch (error) {
            dispatch({
              type: 'TENANT_ERROR',
              payload: error instanceof Error ? error : new Error('Failed to load tenant')
          });
        }
      } else {
        dispatch({ type: 'TENANT_RESET' });
      }
    };

    initializeTenant();
  }, [isAuthenticated, user?.tenantId]);

  // Apply tenant configuration
  useEffect(() => {
    if (state.currentTenant?.config.branding) {
      const { primaryColor, secondaryColor } = state.currentTenant.config.branding;
      if (primaryColor) {
        document.documentElement.style.setProperty('--primary-color', primaryColor);
      }
      if (secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
      }
    }
  }, [state.currentTenant?.config.branding]);

  const setCurrentTenant = (tenant: Tenant) => {
    dispatch({ type: 'TENANT_LOADED', payload: tenant });
  };

  const updateTenantConfig = async (config: Partial<TenantConfig>) => {
    if (!state.currentTenant) {
      throw new Error('No tenant selected');
    }

    try {
      await tenantService.updateTenantConfig(state.currentTenant.id, config);
      dispatch({ type: 'TENANT_CONFIG_UPDATED', payload: config });
    } catch (error) {
      dispatch({
        type: 'TENANT_ERROR',
        payload: error instanceof Error ? error : new Error('Failed to update tenant config')
      });
      throw error;
    }
  };

  const resetTenant = () => {
    dispatch({ type: 'TENANT_RESET' });
  };

  const value = {
    ...state,
    setCurrentTenant,
    updateTenantConfig,
    resetTenant
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

// Utility hooks for tenant features
export const useTenantFeature = (featureKey: string): boolean => {
  const { currentTenant } = useTenant();
  return Boolean(currentTenant?.config.features?.[featureKey]);
};

export const useTenantSubscription = () => {
  const { currentTenant } = useTenant();
  return currentTenant?.subscription;
};

export const useTenantSecurity = () => {
  const { currentTenant } = useTenant();
  return currentTenant?.config.security;
};