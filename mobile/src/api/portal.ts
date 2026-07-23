import type {
  Loan,
  LoanApplication,
  LoanProduct,
  Paginated,
  PortalCustomer,
  PortalDashboard,
} from '../types';
import { apiRequest, unwrapData } from './client';

export async function fetchPortalDashboard(): Promise<PortalDashboard> {
  const payload = await apiRequest<
    PortalDashboard | { data: PortalDashboard }
  >('/api/v1/portal/dashboard');
  return unwrapData(payload);
}

export function fetchPortalLoans(page = 1): Promise<Paginated<Loan>> {
  return apiRequest('/api/v1/portal/loans', { query: { page } });
}

export async function fetchPortalLoan(id: number): Promise<Loan> {
  const payload = await apiRequest<Loan | { data: Loan }>(
    `/api/v1/portal/loans/${id}`,
  );
  return unwrapData(payload);
}

export function fetchPortalApplications(
  page = 1,
): Promise<Paginated<LoanApplication>> {
  return apiRequest('/api/v1/portal/applications', { query: { page } });
}

export async function fetchPortalApplication(
  id: number,
): Promise<LoanApplication> {
  const payload = await apiRequest<
    LoanApplication | { data: LoanApplication }
  >(`/api/v1/portal/applications/${id}`);
  return unwrapData(payload);
}

export async function createPortalApplication(
  body: Record<string, unknown>,
): Promise<LoanApplication> {
  const payload = await apiRequest<
    LoanApplication | { data: LoanApplication }
  >('/api/v1/portal/applications', { method: 'POST', body });
  return unwrapData(payload);
}

export function submitPortalApplication(
  id: number,
): Promise<LoanApplication | { message: string }> {
  return apiRequest(`/api/v1/portal/applications/${id}/submit`, {
    method: 'POST',
  });
}

export async function fetchPortalProfile(): Promise<PortalCustomer> {
  const payload = await apiRequest<
    PortalCustomer | { data: PortalCustomer } | { customer: PortalCustomer }
  >('/api/v1/portal/profile');

  if ('customer' in payload && payload.customer) {
    return payload.customer;
  }

  return unwrapData(payload as PortalCustomer | { data: PortalCustomer });
}

export async function updatePortalProfile(
  body: Record<string, unknown>,
): Promise<PortalCustomer> {
  const payload = await apiRequest<
    PortalCustomer | { data: PortalCustomer }
  >('/api/v1/portal/profile', { method: 'PUT', body });
  return unwrapData(payload);
}

export function updatePortalPassword(
  body: Record<string, unknown>,
): Promise<{ message?: string }> {
  return apiRequest('/api/v1/portal/profile/password', {
    method: 'PUT',
    body,
  });
}

/** Products available for portal applications (via applications create meta or products list). */
export async function fetchPortalProducts(): Promise<LoanProduct[]> {
  try {
    const meta = await apiRequest<{
      products?: LoanProduct[];
      data?: LoanProduct[];
    }>('/api/v1/portal/applications', {
      query: { for: 'create' },
    });
    if (Array.isArray(meta.products)) {
      return meta.products;
    }
    if (Array.isArray(meta.data)) {
      return meta.data;
    }
  } catch {
    // Fall through — create screen can still accept product_id manually.
  }

  return [];
}
