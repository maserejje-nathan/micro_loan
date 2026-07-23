import type { Customer, Paginated } from '../types';
import { apiRequest, unwrapData } from './client';

export function fetchCustomers(
  page = 1,
): Promise<Paginated<Customer>> {
  return apiRequest('/api/v1/customers', { query: { page } });
}

export async function fetchCustomer(id: number): Promise<Customer> {
  const payload = await apiRequest<Customer | { data: Customer }>(
    `/api/v1/customers/${id}`,
  );
  return unwrapData(payload);
}

export async function createCustomer(
  body: Record<string, unknown>,
): Promise<Customer> {
  const payload = await apiRequest<Customer | { data: Customer }>(
    '/api/v1/customers',
    { method: 'POST', body },
  );
  return unwrapData(payload);
}

export async function updateCustomer(
  id: number,
  body: Record<string, unknown>,
): Promise<Customer> {
  const payload = await apiRequest<Customer | { data: Customer }>(
    `/api/v1/customers/${id}`,
    { method: 'PUT', body },
  );
  return unwrapData(payload);
}
