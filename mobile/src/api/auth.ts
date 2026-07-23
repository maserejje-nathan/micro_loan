import type {
  LoginResponse,
  PortalCustomer,
  PortalLoginResponse,
  User,
} from '../types';
import { apiRequest, unwrapData } from './client';

export function login(
  email: string,
  password: string,
  deviceName = 'avango-mobile',
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

export function portalLogin(
  phone: string,
  password: string,
  organizationSlug: string,
  deviceName = 'avango-mobile',
): Promise<PortalLoginResponse> {
  return apiRequest<PortalLoginResponse>('/api/v1/portal/login', {
    method: 'POST',
    auth: false,
    body: {
      phone,
      password,
      organization_slug: organizationSlug,
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

export async function fetchPortalMe(
  token?: string,
): Promise<{ customer: PortalCustomer }> {
  const payload = await apiRequest<
    { customer: PortalCustomer } | { data: PortalCustomer } | PortalCustomer
  >('/api/v1/portal/me', { token });

  if ('customer' in payload && payload.customer) {
    return { customer: payload.customer };
  }

  return { customer: unwrapData(payload as { data: PortalCustomer } | PortalCustomer) };
}

export function logout(): Promise<{ message: string }> {
  return apiRequest('/api/v1/logout', { method: 'POST' });
}

export function portalLogout(): Promise<{ message: string }> {
  return apiRequest('/api/v1/portal/logout', { method: 'POST' });
}
