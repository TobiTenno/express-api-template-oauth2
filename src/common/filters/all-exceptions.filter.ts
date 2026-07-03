import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { createAppLogger } from '../utils/logger';
import { TokenAccessDeniedException } from '../exceptions/token-access-denied.exception';

const logger = createAppLogger('API');

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof TokenAccessDeniedException) {
      response.setHeader('WWW-Authenticate', 'Token realm="Application"');
      response.status(HttpStatus.UNAUTHORIZED).send('HTTP Token: Access denied.');
      return;
    }

    if (exception instanceof NotFoundException) {
      const message = exception.message;
      if (message.startsWith('Cannot ') || message === 'Not Found') {
        response.status(HttpStatus.NOT_FOUND).json({ error: 'No route found' });
        return;
      }
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as { message?: string | string[]; error?: string }).message
          ?? (exceptionResponse as { error?: string }).error
          ?? exception.message);

      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      logger.debug(exception);
      response.status(status).json({ error: errorMessage });
      return;
    }

    const err = exception as Error & { status?: number };
    logger.debug(err);
    response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: err.message || 'Internal server error',
    });
  }
}
