import type { Paginated, Repayment, RepaymentCreateMeta } from '../types';
import { apiRequest, unwrapData } from './client';

export function fetchRepayments(page = 1): Promise<Paginated<Repayment>> {
  return apiRequest('/api/v1/repayments', { query: { page } });
}

export async function fetchRepaymentCreateMeta(): Promise<RepaymentCreateMeta> {
  const payload = await apiRequest<
    RepaymentCreateMeta | { data: RepaymentCreateMeta }
  >('/api/v1/repayments/create');
  return unwrapData(payload);
}

export async function createRepayment(
  body: Record<string, unknown>,
): Promise<Repayment> {
  const payload = await apiRequest<Repayment | { data: Repayment }>(
    '/api/v1/repayments',
    { method: 'POST', body },
  );
  return unwrapData(payload);
}
