export interface TenantConfig {
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
      favicon?: string;
    };
    features?: Record<string, boolean>;
    integrations?: Record<string, any>;
    security?: {
      mfaRequired?: boolean;
      passwordPolicy?: {
        minLength: number;
        requireUppercase: boolean;
        requireNumbers: boolean;
        requireSymbols: boolean;
      };
      sessionTimeout?: number;
    };
  }
  
  export interface Tenant {
    id: string;
    name: string;
    domain: string;
    status: 'active' | 'inactive' | 'suspended';
    subscription: {
      plan: 'free' | 'pro' | 'enterprise';
      status: 'active' | 'trialing' | 'past_due' | 'cancelled';
      startDate: string;
      endDate?: string;
      features: string[];
    };
    config: TenantConfig;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  }
  