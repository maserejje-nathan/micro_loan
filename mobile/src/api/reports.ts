import type { ReportSummary } from '../types';
import { apiRequest, unwrapData } from './client';

export async function fetchReports(): Promise<ReportSummary> {
  const payload = await apiRequest<ReportSummary | { data: ReportSummary }>(
    '/api/v1/reports',
  );
  return unwrapData(payload);
}
