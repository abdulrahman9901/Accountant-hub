import type { ApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL;

export interface ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return { data: null as unknown as T };
  }

  const json = await response.json();

  if (!response.ok) {
    const error = new Error(json.message || 'An unexpected error occurred.') as ApiError;
    error.status = response.status;
    error.errors = json.errors;
    throw error;
  }

  // If the response is already wrapped in a "data" property, return it as-is.
  // Otherwise, wrap it in a "data" property to ensure consistency with the ApiResponse type.
  if (json && typeof json === 'object' && 'data' in json) {
    return json as ApiResponse<T>;
  }

  return { data: json } as ApiResponse<T>;
}
