import type { Loan, Paginated } from '../types';
import { apiRequest, unwrapData } from './client';

export function fetchLoans(page = 1): Promise<Paginated<Loan>> {
  return apiRequest('/api/v1/loans', { query: { page } });
}

export async function fetchLoan(id: number): Promise<Loan> {
  const payload = await apiRequest<Loan | { data: Loan }>(
    `/api/v1/loans/${id}`,
  );
  return unwrapData(payload);
}

export function disburseLoan(
  id: number,
  body: Record<string, unknown> = { channel: 'cash' },
): Promise<Loan | { message: string }> {
  return apiRequest(`/api/v1/loans/${id}/disburse`, {
    method: 'POST',
    body,
  });
}
