// src/types/logging.ts
export interface LogEntry {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    source: string;
    message: string;
    metadata: {
      applicationId?: string;
      applicationName?: string;
      environment?: string;
      traceId?: string;
      userId?: string;
      requestId?: string;
      [key: string]: any;
    };
    tags: string[];
  }
  
  export interface LogFilter {
    startDate?: string;
    endDate?: string;
    levels?: string[];
    sources?: string[];
    search?: string;
    applicationId?: string;
    environment?: string;
    tags?: string[];
  }
  