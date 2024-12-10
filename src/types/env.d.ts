// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_USE_MOCK: string;
    readonly VITE_API_TIMEOUT?: string;
    readonly VITE_MOCK_LATENCY?: string;
    readonly VITE_API_VERSION?: string;
    readonly VITE_ENV: 'development' | 'staging' | 'production';
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }