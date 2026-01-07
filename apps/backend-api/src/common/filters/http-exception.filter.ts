import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface RequestWithUrl {
  url: string;
}

interface ExceptionResponse {
  message?: string;
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUrl>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as ExceptionResponse;
        message = res.message || message;
        error = res.error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Unified error response format
    response.status(status).json({
      success: false,
      data: null,
      error: {
        code: error,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
