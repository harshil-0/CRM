import type { ApiResponse, ApiErrorResponse, PaginationMeta } from '@crm/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

class ApiClient {
  private getAuthHeaders(includeJson = true): Record<string, string> {
    const headers: Record<string, string> = {};
    if (includeJson) headers['Content-Type'] = 'application/json';
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { auth = true, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
      ...this.getAuthHeaders(!(rest.body instanceof FormData)),
      ...(customHeaders as Record<string, string>),
    };

    if (!auth) delete headers['Authorization'];

    const response = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });
    const json = await response.json();

    if (!response.ok) {
      const error = json as ApiErrorResponse;
      throw new Error(error.error?.message || 'Request failed');
    }

    const result = json as ApiResponse<T>;
    return result.data;
  }

  private async requestPaginated<T>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<PaginatedResult<T>> {
    const { auth = true, headers: customHeaders, ...rest } = options ?? {};

    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...(customHeaders as Record<string, string>),
    };

    if (!auth) delete headers['Authorization'];

    const response = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });
    const json = await response.json();

    if (!response.ok) {
      const error = json as ApiErrorResponse;
      throw new Error(error.error?.message || 'Request failed');
    }

    return {
      data: json.data as T[],
      meta: json.meta as PaginationMeta,
    };
  }

  async download(endpoint: string, filename: string) {
    const headers = this.getAuthHeaders(false);
    const response = await fetch(`${API_URL}${endpoint}`, { headers, method: 'GET' });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  upload<T>(endpoint: string, file: File, params?: Record<string, string>) {
    const formData = new FormData();
    formData.append('file', file);
    const query = params ? buildQuery(params) : '';
    return this.request<T>(`${endpoint}${query}`, {
      method: 'POST',
      body: formData,
    });
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  getPaginated<T>(endpoint: string, params?: Record<string, string | number | undefined>) {
    return this.requestPaginated<T>(`${endpoint}${buildQuery(params)}`, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
