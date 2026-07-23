import type { AuditLog, Paginated } from '../types';
import { apiRequest } from './client';

export function fetchAuditLogs(page = 1): Promise<Paginated<AuditLog>> {
  return apiRequest('/api/v1/audit-logs', { query: { page } });
}
