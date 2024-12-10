// src/services/loggingService.ts
export class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];

  private constructor() {
    // Initialize with mock data
    this.generateMockLogs();
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private generateMockLogs() {
    const applications = [
      { id: 'app1', name: 'User Service' },
      { id: 'app2', name: 'Payment Service' },
      { id: 'app3', name: 'Notification Service' }
    ];

    const environments = ['development', 'staging', 'production'];
    const levels = ['info', 'warning', 'error', 'debug'];
    const sources = ['application', 'system', 'security', 'database'];

    // Generate 100 mock logs
    for (let i = 0; i < 100; i++) {
      const app = applications[Math.floor(Math.random() * applications.length)];
      const env = environments[Math.floor(Math.random() * environments.length)];
      const level = levels[Math.floor(Math.random() * levels.length)] as LogEntry['level'];
      const source = sources[Math.floor(Math.random() * sources.length)];

      this.logs.push({
        id: `log-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        level,
        source,
        message: this.generateLogMessage(level, source, app.name),
        metadata: {
          applicationId: app.id,
          applicationName: app.name,
          environment: env,
          traceId: `trace-${Math.random().toString(36).substring(7)}`,
          requestId: `req-${Math.random().toString(36).substring(7)}`,
          userId: `user-${Math.floor(Math.random() * 10)}`
        },
        tags: this.generateTags(level, source, env)
      });
    }

    // Sort logs by timestamp desc
    this.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private generateLogMessage(level: string, source: string, appName: string): string {
    const messages = {
      info: [
        `Successfully processed request in ${appName}`,
        `User login successful`,
        `Data sync completed`,
        `Cache updated successfully`
      ],
      warning: [
        `High memory usage detected in ${appName}`,
        `Slow query performance`,
        `Rate limit approaching threshold`,
        `Connection pool running low`
      ],
      error: [
        `Failed to process request in ${appName}`,
        `Database connection timeout`,
        `External API unavailable`,
        `Invalid authentication token`
      ],
      debug: [
        `Processing request parameters`,
        `Executing database query`,
        `Cache hit ratio: 85%`,
        `Request processing time: 235ms`
      ]
    };

    return messages[level][Math.floor(Math.random() * messages[level].length)];
  }

  private generateTags(level: string, source: string, environment: string): string[] {
    const tags = [level, source, environment];
    
    if (level === 'error') {
      tags.push('alert');
    }
    if (environment === 'production') {
      tags.push('critical');
    }
    if (source === 'security') {
      tags.push('audit');
    }

    return tags;
  }

  async getLogs(filter: LogFilter): Promise<LogEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    return this.logs.filter(log => {
      if (filter.startDate && log.timestamp < filter.startDate) return false;
      if (filter.endDate && log.timestamp > filter.endDate) return false;
      if (filter.levels?.length && !filter.levels.includes(log.level)) return false;
      if (filter.sources?.length && !filter.sources.includes(log.source)) return false;
      if (filter.applicationId && log.metadata.applicationId !== filter.applicationId) return false;
      if (filter.environment && log.metadata.environment !== filter.environment) return false;
      if (filter.tags?.length && !filter.tags.some(tag => log.tags.includes(tag))) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          log.message.toLowerCase().includes(searchLower) ||
          log.metadata.applicationName?.toLowerCase().includes(searchLower) ||
          log.source.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }

  async getLogById(id: string): Promise<LogEntry | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.logs.find(log => log.id === id) || null;
  }

  async getLogStats(): Promise<{
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    sourceDistribution: Record<string, number>;
    levelDistribution: Record<string, number>;
    envDistribution: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      totalLogs: this.logs.length,
      errorCount: this.logs.filter(log => log.level === 'error').length,
      warningCount: this.logs.filter(log => log.level === 'warning').length,
      sourceDistribution: this.logs.reduce((acc, log) => {
        acc[log.source] = (acc[log.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      levelDistribution: this.logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      envDistribution: this.logs.reduce((acc, log) => {
        const env = log.metadata.environment || 'unknown';
        acc[env] = (acc[env] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const loggingService = LoggingService.getInstance();
