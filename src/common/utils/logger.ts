import { createLogger, format, transports, Logger } from 'winston';

const { combine, label, printf, colorize } = format;

const color = (scope: string): string => {
  switch (scope.toUpperCase()) {
    case 'PROC':
      return `\u001b[35mPROC\u001b[39m`;
    default:
      return `\u001b[31m${scope.toUpperCase()}\u001b[39m`;
  }
};

export const createAppLogger = (scope: string): Logger => {
  const transport = new transports.Console();
  const logFormat = printf((info) => `[${info.label}] ${info.level}: ${info.message}`);
  const logger = createLogger({
    format: combine(colorize(), label({ label: color(scope) }), logFormat),
    transports: [transport],
  });
  logger.level = process.env.LOG_LEVEL || 'error';
  return logger;
};
