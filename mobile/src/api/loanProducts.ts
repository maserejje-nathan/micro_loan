import type { LoanProduct, Paginated } from '../types';
import { apiRequest, unwrapData } from './client';

export function fetchLoanProducts(
  page = 1,
): Promise<Paginated<LoanProduct>> {
  return apiRequest('/api/v1/loan-products', { query: { page } });
}

export async function fetchLoanProduct(id: number): Promise<LoanProduct> {
  const payload = await apiRequest<LoanProduct | { data: LoanProduct }>(
    `/api/v1/loan-products/${id}`,
  );
  return unwrapData(payload);
}

export async function createLoanProduct(
  body: Record<string, unknown>,
): Promise<LoanProduct> {
  const payload = await apiRequest<LoanProduct | { data: LoanProduct }>(
    '/api/v1/loan-products',
    { method: 'POST', body },
  );
  return unwrapData(payload);
}

export async function updateLoanProduct(
  id: number,
  body: Record<string, unknown>,
): Promise<LoanProduct> {
  const payload = await apiRequest<LoanProduct | { data: LoanProduct }>(
    `/api/v1/loan-products/${id}`,
    { method: 'PUT', body },
  );
  return unwrapData(payload);
}
