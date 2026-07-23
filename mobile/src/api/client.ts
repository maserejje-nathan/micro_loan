import { API_BASE_URL } from '../lib/config';
import { clearSession, getToken } from '../lib/storage';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  token?: string | null;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
};

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function buildUrl(
  path: string,
  query?: RequestOptions['query'],
): string {
  const url = `${API_BASE_URL}${path}`;
  if (!query) {
    return url;
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (options.auth !== false) {
    const token = options.token ?? (await getToken());
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.auth !== false) {
    await clearSession();
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload.message ??
      payload.errors?.email?.[0] ??
      payload.errors?.phone?.[0] ??
      `Request failed (${response.status})`;

    throw new ApiError(message, response.status, payload.errors ?? {});
  }

  return payload as T;
}

/** Unwrap `{ data: T }` resource envelopes when present. */
export function unwrapData<T>(payload: T | { data: T }): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as { data: unknown }).data !== undefined &&
    !Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}
