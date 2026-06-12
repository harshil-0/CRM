import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ServiceResponse<T> {
  data: T;
  meta?: { page: number; limit: number; total: number };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'data' in result) {
          const { data, meta } = result as ServiceResponse<T>;
          return { success: true, data, ...(meta ? { meta } : {}) };
        }
        return { success: true, data: result };
      }),
    );
  }
}
