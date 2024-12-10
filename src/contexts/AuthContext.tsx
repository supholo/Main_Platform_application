  // src/contexts/AuthContext.tsx
  import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
  import { User, AuthToken, LoginCredentials, AuthError } from '../types/auth';
  import { useNavigate } from 'react-router-dom';
  
  interface AuthState {
    user: User | null;
    token: AuthToken | null;
    loading: boolean;
    error: AuthError | null;
    initialized: boolean;
  }
  
  type AuthAction =
    | { type: 'AUTH_INIT' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User; token: AuthToken } }
    | { type: 'AUTH_ERROR'; payload: AuthError }
    | { type: 'AUTH_LOGOUT' }
    | { type: 'AUTH_REFRESH'; payload: AuthToken }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'CLEAR_ERROR' };
  
  interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: (options?: { everywhere?: boolean }) => Promise<void>;
    refreshToken: () => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    clearError: () => void;
    isAuthenticated: boolean;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
      case 'AUTH_INIT':
        return { ...state, loading: true, error: null };
      case 'AUTH_SUCCESS':
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          loading: false,
          error: null,
          initialized: true
        };
      case 'AUTH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload,
          initialized: true
        };
      case 'AUTH_LOGOUT':
        return {
          user: null,
          token: null,
          loading: false,
          error: null,
          initialized: true
        };
      case 'AUTH_REFRESH':
        return {
          ...state,
          token: action.payload,
          loading: false,
          error: null
        };
      case 'UPDATE_USER':
        return {
          ...state,
          user: action.payload,
          loading: false,
          error: null
        };
      case 'CLEAR_ERROR':
        return {
          ...state,
          error: null
        };
      default:
        return state;
    }
  };
  
  // Mock auth service
  const authService = {
    async login(credentials: LoginCredentials): Promise<{ user: User; token: AuthToken }> {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Mock validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }
  
      // Mock user data
      const user: User = {
        id: 'user-1',
        email: credentials.email,
        name: 'John Doe',
        role: 'admin',
        tenantId: credentials.tenantId || 'tenant-1',
        permissions: ['admin:*'],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          lastLogin: new Date().toISOString(),
          mfaEnabled: false,
          preferences: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
              inApp: true
            }
          }
        }
      };
  
      const token: AuthToken = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      };
  
      return { user, token };
    },
  
    async refreshToken(refreshToken: string): Promise<AuthToken> {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
    },
  
    async logout(token: string, options?: { everywhere?: boolean }): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Mock logout logic
    }
  };
  
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
      user: null,
      token: null,
      loading: true,
      error: null,
      initialized: false
    });
  
    const navigate = useNavigate();
  
    // Initialize auth state from local storage
    useEffect(() => {
      const initializeAuth = async () => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
  
        if (storedToken && storedUser) {
          try {
            const token = JSON.parse(storedToken);
            const user = JSON.parse(storedUser);
            
            // Check if token is expired
            if (new Date(token.expiresAt) <= new Date()) {
              throw new Error('Token expired');
            }
  
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token }
            });
          } catch (error) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      };
  
      initializeAuth();
    }, []);
  
    // Token refresh logic
    useEffect(() => {
      if (!state.token) return;
  
      const tokenExpiresAt = new Date(state.token.expiresAt).getTime();
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
      const timeUntilRefresh = tokenExpiresAt - Date.now() - refreshThreshold;
  
      if (timeUntilRefresh <= 0) {
        refreshToken();
        return;
      }
  
      const refreshTimer = setTimeout(refreshToken, timeUntilRefresh);
      return () => clearTimeout(refreshTimer);
    }, [state.token]);
  
    const login = async (credentials: LoginCredentials) => {
      try {
        dispatch({ type: 'AUTH_INIT' });
        const { user, token } = await authService.login(credentials);
        
        localStorage.setItem('auth_token', JSON.stringify(token));
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        navigate('/');
      } catch (error) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: {
            code: 'AUTH_FAILED',
            message: error instanceof Error ? error.message : 'Authentication failed'
          }
        });
      }
    };
  
    const logout = async (options?: { everywhere?: boolean }) => {
      try {
        if (state.token) {
          await authService.logout(state.token.token, options);
        }
      } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        dispatch({ type: 'AUTH_LOGOUT' });
        navigate('/login');
      }
    };
  
    const refreshToken = async () => {
      if (!state.token?.refreshToken) return;
  
      try {
        const newToken = await authService.refreshToken(state.token.refreshToken);
        localStorage.setItem('auth_token', JSON.stringify(newToken));
        dispatch({ type: 'AUTH_REFRESH', payload: newToken });
      } catch (error) {
        logout();
      }
    };
  
    const updateUser = async (userData: Partial<User>) => {
      if (!state.user) return;
  
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    };
  
    const clearError = () => dispatch({ type: 'CLEAR_ERROR' });
  
    const value = {
      ...state,
      login,
      logout,
      refreshToken,
      updateUser,
      clearError,
      isAuthenticated: Boolean(state.user && state.token)
    };
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };