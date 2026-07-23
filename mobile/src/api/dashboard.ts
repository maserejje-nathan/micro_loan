import { apiRequest } from './client';
import type { Dashboard } from '../types';

export function fetchDashboard(): Promise<Dashboard> {
  return apiRequest<Dashboard>('/api/v1/dashboard');
}
