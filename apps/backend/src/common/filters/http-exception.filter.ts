import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        code = (resp.code as string) || this.statusToCode(status);
        message = (resp.message as string) || exception.message;
        details = resp.details as unknown[] | undefined;
        if (Array.isArray(resp.message)) {
          details = resp.message;
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        }
      } else {
        message = exception.message;
        code = this.statusToCode(status);
      }
    }

    response.status(status).json({
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    });
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
    };
    return map[status] || 'INTERNAL_ERROR';
  }
}
