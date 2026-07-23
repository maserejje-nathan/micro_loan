import { apiRequest } from './client';
import type { LoginResponse, User } from '../types';

export function login(
  email: string,
  password: string,
  deviceName = 'lender-mobile',
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/v1/login', {
    method: 'POST',
    auth: false,
    body: {
      email,
      password,
      device_name: deviceName,
    },
  });
}

export function fetchMe(token?: string): Promise<{
  user: User;
  permissions: string[];
}> {
  return apiRequest('/api/v1/me', { token });
}

export function logout(): Promise<{ message: string }> {
  return apiRequest('/api/v1/logout', { method: 'POST' });
}
