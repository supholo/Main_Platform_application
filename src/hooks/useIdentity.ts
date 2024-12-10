import { useState, useCallback, useEffect, useRef } from 'react';
import { IdentityService, User, IdentityProvider, ApiKey, CreateUserData } from '../services/identityService';
import { ApiServiceFactory } from '../services/core/ApiServiceFactory';

export function useIdentity() {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<IdentityProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isInitializedRef = useRef(false);

  const identityService = ApiServiceFactory.createService(IdentityService);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersResponse, providersResponse] = await Promise.all([
        identityService.getUsers(),
        identityService.getIdentityProviders()
      ]);
      setUsers(usersResponse.data);
      setProviders(providersResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  }, [identityService]);

  const initialize = useCallback(async () => {
    if (!isInitializedRef.current) {
      try {
        setLoading(true);
        if (ApiServiceFactory.getConfig().useMock) {
          await identityService.initializeMockData();
        }
        const [usersResponse, providersResponse] = await Promise.all([
          identityService.getUsers(),
          identityService.getIdentityProviders()
        ]);
        setUsers(usersResponse.data);
        setProviders(providersResponse.data);
        isInitializedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize'));
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [identityService]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const createUser = useCallback(async (data: CreateUserData) => {
    try {
      setLoading(true);
      const response = await identityService.createUser(data);
      setUsers(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create user');
      console.error('Create user error:', err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [identityService]);

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    try {
      setLoading(true);
      const response = await identityService.updateUser(id, data);
      setUsers(prev => prev.map(user => user.id === id ? response.data : user));
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update user');
      console.error('Update user error:', err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [identityService]);

  const createProvider = useCallback(async (data: Omit<IdentityProvider, 'id'>) => {
    try {
      setLoading(true);
      const response = await identityService.createIdentityProvider(data);
      setProviders(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create identity provider'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [identityService]);

  const updateProvider = useCallback(async (id: string, data: Partial<IdentityProvider>) => {
    try {
      setLoading(true);
      const response = await identityService.updateProvider(id, data);
      setProviders(prev => prev.map(provider => provider.id === id ? response.data : provider));
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update provider');
      console.error('Update provider error:', err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [identityService]);

  const createApiKey = useCallback(async (
    userId: string,
    data: { name: string; scopes: string[]; expires: string }
  ) => {
    try {
      setLoading(true);
      const response = await identityService.createApiKey(userId, data);
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            apiAccess: {
              enabled: true,
              keys: [...(user.apiAccess?.keys || []), response.data]
            }
          };
        }
        return user;
      }));
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create API key'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [identityService]);

  const refetch = useCallback(async () => {
    isInitializedRef.current = false;
    return loadData();
  }, [loadData]);

  return {
    users,
    providers,
    loading,
    error,
    createUser,
    updateUser,
    createProvider,
    updateProvider, // Added this to the return object
    createApiKey,
    refetch,
    initialize
  };
}