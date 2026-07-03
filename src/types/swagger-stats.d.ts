declare module 'swagger-stats' {
  interface SwaggerStatsOptions {
    swaggerSpec?: unknown;
    uriPath?: string;
  }

  interface SwaggerStatsMiddleware {
    getMiddleware(options: SwaggerStatsOptions): import('express').RequestHandler;
  }

  const swaggerStats: SwaggerStatsMiddleware;
  export default swaggerStats;
  export function getMiddleware(options: SwaggerStatsOptions): import('express').RequestHandler;
}
