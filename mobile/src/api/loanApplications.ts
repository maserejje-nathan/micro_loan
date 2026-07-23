import type { LoanApplication, Paginated } from '../types';
import { apiRequest, unwrapData } from './client';

export function fetchLoanApplications(
  page = 1,
): Promise<Paginated<LoanApplication>> {
  return apiRequest('/api/v1/loan-applications', { query: { page } });
}

export async function fetchLoanApplication(
  id: number,
): Promise<LoanApplication> {
  const payload = await apiRequest<
    LoanApplication | { data: LoanApplication }
  >(`/api/v1/loan-applications/${id}`);
  return unwrapData(payload);
}

export async function createLoanApplication(
  body: Record<string, unknown>,
): Promise<LoanApplication> {
  const payload = await apiRequest<
    LoanApplication | { data: LoanApplication }
  >('/api/v1/loan-applications', { method: 'POST', body });
  return unwrapData(payload);
}

export function submitLoanApplication(
  id: number,
): Promise<LoanApplication | { message: string }> {
  return apiRequest(`/api/v1/loan-applications/${id}/submit`, {
    method: 'POST',
  });
}

export function approveLoanApplication(
  id: number,
  body: Record<string, unknown> = {},
): Promise<LoanApplication | { message: string }> {
  return apiRequest(`/api/v1/loan-applications/${id}/approve`, {
    method: 'POST',
    body,
  });
}

export function rejectLoanApplication(
  id: number,
  body: Record<string, unknown> = {},
): Promise<LoanApplication | { message: string }> {
  return apiRequest(`/api/v1/loan-applications/${id}/reject`, {
    method: 'POST',
    body,
  });
}
