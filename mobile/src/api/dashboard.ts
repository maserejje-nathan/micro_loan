import type { Dashboard } from '../types';
import { apiRequest, unwrapData } from './client';

export async function fetchDashboard(isAdmin = false): Promise<Dashboard> {
  const path = isAdmin ? '/api/v1/admin/dashboard' : '/api/v1/dashboard';
  const payload = await apiRequest<Dashboard | { data: Dashboard }>(path);
  return unwrapData(payload);
}
