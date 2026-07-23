import type {
  Invoice,
  Organization,
  Paginated,
  Subscription,
  SubscriptionPlan,
  SystemHealth,
} from '../types';
import { apiRequest, unwrapData } from './client';

export function fetchOrganizations(
  page = 1,
): Promise<Paginated<Organization & { users_count?: number; status?: string }>> {
  return apiRequest('/api/v1/admin/organizations', { query: { page } });
}

export type OrganizationDetail = Organization & {
  users?: Array<{ id: number; name: string; email: string }>;
  subscription?: Subscription | null;
  usage?: Record<string, number>;
};

type OrganizationShowResponse = {
  organization: Organization;
  users?: Array<{ id: number; name: string; email: string }>;
  subscription?: Subscription | null;
  usage?: Record<string, number>;
};

export async function fetchOrganization(
  id: number,
): Promise<OrganizationDetail> {
  const payload = await apiRequest<OrganizationShowResponse>(
    `/api/v1/admin/organizations/${id}`,
  );

  return {
    ...payload.organization,
    users: payload.users ?? [],
    subscription: payload.subscription ?? null,
    usage: payload.usage,
  };
}

export function fetchPlans(page = 1): Promise<Paginated<SubscriptionPlan>> {
  return apiRequest('/api/v1/admin/plans', { query: { page } });
}

type ApiSubscription = {
  id: number;
  status?: string;
  organization?: { id?: number; name?: string; slug?: string } | null;
  plan?: {
    id?: number;
    name?: string;
    price?: number;
    currency?: string;
    billing_interval?: string;
  } | null;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  canceled_at?: string | null;
};

function normalizeSubscription(item: ApiSubscription): Subscription {
  return {
    id: item.id,
    organization_id: item.organization?.id,
    organization_name: item.organization?.name,
    plan_id: item.plan?.id,
    plan_name: item.plan?.name,
    status: item.status,
    billing_interval: item.plan?.billing_interval,
    trial_ends_at: item.trial_ends_at,
    current_period_end: item.current_period_end,
    canceled_at: item.canceled_at,
  };
}

export async function fetchSubscriptions(
  page = 1,
): Promise<Paginated<Subscription>> {
  const payload = await apiRequest<Paginated<ApiSubscription>>(
    '/api/v1/admin/subscriptions',
    { query: { page } },
  );

  return {
    ...payload,
    data: (payload.data ?? []).map(normalizeSubscription),
  };
}

export function cancelSubscription(
  id: number,
): Promise<{ message?: string }> {
  return apiRequest(`/api/v1/admin/subscriptions/${id}/cancel`, {
    method: 'POST',
  });
}

export function activateSubscription(
  id: number,
): Promise<{ message?: string }> {
  return apiRequest(`/api/v1/admin/subscriptions/${id}/activate`, {
    method: 'POST',
  });
}

export function renewSubscription(
  id: number,
): Promise<{ message?: string }> {
  return apiRequest(`/api/v1/admin/subscriptions/${id}/renew`, {
    method: 'POST',
  });
}

type ApiInvoice = {
  id: number;
  invoice_number?: string;
  amount?: number;
  currency?: string;
  status?: string;
  due_at?: string | null;
  paid_at?: string | null;
  organization?: { id?: number; name?: string; slug?: string } | null;
};

function normalizeInvoice(item: ApiInvoice): Invoice {
  return {
    id: item.id,
    invoice_number: item.invoice_number,
    organization_id: item.organization?.id,
    organization_name: item.organization?.name,
    amount: item.amount,
    currency: item.currency,
    status: item.status,
    due_at: item.due_at,
    paid_at: item.paid_at,
  };
}

export async function fetchInvoices(page = 1): Promise<Paginated<Invoice>> {
  const payload = await apiRequest<Paginated<ApiInvoice>>(
    '/api/v1/admin/invoices',
    { query: { page } },
  );

  return {
    ...payload,
    data: (payload.data ?? []).map(normalizeInvoice),
  };
}

export async function createInvoice(
  body: Record<string, unknown>,
): Promise<Invoice> {
  const payload = await apiRequest<ApiInvoice | { data: ApiInvoice }>(
    '/api/v1/admin/invoices',
    { method: 'POST', body },
  );
  return normalizeInvoice(unwrapData(payload));
}

export async function markInvoicePaid(id: number): Promise<Invoice> {
  const payload = await apiRequest<ApiInvoice | { data: ApiInvoice }>(
    `/api/v1/admin/invoices/${id}/paid`,
    { method: 'POST' },
  );
  return normalizeInvoice(unwrapData(payload));
}

type SystemResponse = {
  health?: Record<string, string | number | boolean | null>;
  platform_stats?: Record<string, number>;
  audit_stats?: Record<string, number>;
  category_counts?: Record<string, number>;
  recent_audit_logs?: {
    data?: Array<Record<string, unknown>>;
  };
};

export async function fetchSystem(): Promise<SystemHealth> {
  const payload = await apiRequest<SystemResponse>('/api/v1/admin/system');

  return {
    ...(payload.health ?? {}),
    ...(payload.platform_stats
      ? Object.fromEntries(
          Object.entries(payload.platform_stats).map(([key, value]) => [
            `platform_${key}`,
            value,
          ]),
        )
      : {}),
    ...(payload.audit_stats
      ? Object.fromEntries(
          Object.entries(payload.audit_stats).map(([key, value]) => [
            `audit_${key}`,
            value,
          ]),
        )
      : {}),
    recent_audit_logs: payload.recent_audit_logs?.data ?? [],
  };
}
