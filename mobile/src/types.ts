export type AuthMode = 'staff' | 'portal';

export type Organization = {
  id: number;
  name: string;
  slug: string;
  currency: string;
  subdomain?: string | null;
  email?: string | null;
  users_count?: number;
  customers_count?: number;
  subscription_status?: string | null;
  plan_name?: string | null;
  plan_price?: number | null;
  created_at?: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  is_super_admin?: boolean;
  organization?: Organization;
};

export type PortalCustomer = {
  id: number;
  reference_number?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
  phone?: string;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  occupation?: string | null;
  employer_name?: string | null;
  monthly_income?: number | null;
  next_of_kin_name?: string | null;
  next_of_kin_phone?: string | null;
  next_of_kin_relationship?: string | null;
  payment_reminder_channels?: string[];
  status?: string;
  organization?: Organization;
};

export type PaginatedMeta = {
  current_page: number;
  last_page: number;
  per_page?: number;
  total: number;
  from?: number | null;
  to?: number | null;
};

export type Paginated<T> = {
  data: T[];
  meta?: PaginatedMeta;
  links?: Record<string, string | null>;
};

export type DashboardStats = {
  active_loans: number;
  pending_applications: number;
  total_customers: number;
  portfolio_outstanding: number;
  repayments_this_month: number;
};

export type AdminDashboardStats = {
  organizations: number;
  users: number;
  active_subscriptions: number;
  open_invoices: number;
  mrr: number;
  plans: number;
};

export type RecentApplication = {
  id: number;
  reference_number: string;
  customer_name: string;
  product_name: string;
  requested_amount: number;
  status: string;
};

export type RecentOrganization = {
  id: number;
  name: string;
  slug: string;
  users_count: number;
  created_at: string | null;
};

export type LenderDashboard = {
  type: 'lender';
  stats: DashboardStats;
  recent_applications: RecentApplication[];
  currency: string;
};

export type AdminDashboard = {
  type: 'admin';
  stats: AdminDashboardStats;
  recent_organizations: RecentOrganization[];
};

export type Dashboard = LenderDashboard | AdminDashboard;

export type PortalDashboard = {
  type?: 'portal';
  stats?: {
    active_loans?: number;
    outstanding?: number;
    pending_applications?: number;
    draft_applications?: number;
  };
  recent_loans?: Array<{
    id: number;
    reference_number?: string;
    product_name?: string;
    outstanding_balance?: number;
    status?: string;
  }>;
  recent_applications?: Array<{
    id: number;
    reference_number?: string;
    product_name?: string;
    requested_amount?: number;
    status?: string;
    created_at?: string;
  }>;
  currency?: string;
  portal?: {
    enabled?: boolean;
    allow_applications?: boolean;
    welcome_message?: string;
  };
};

export type LoginResponse = {
  token: string;
  token_type: string;
  user: User;
};

export type PortalLoginResponse = {
  token: string;
  token_type?: string;
  customer: PortalCustomer;
};

export type Customer = {
  id: number;
  reference_number?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  occupation?: string | null;
  employer_name?: string | null;
  monthly_income?: number | null;
  next_of_kin_name?: string | null;
  next_of_kin_phone?: string | null;
  next_of_kin_relationship?: string | null;
  status?: string;
  portal_enabled?: boolean;
  portal_last_login_at?: string | null;
};

export type LoanProduct = {
  id: number;
  name: string;
  code?: string;
  description?: string | null;
  min_amount?: number;
  max_amount?: number;
  term_min_days?: number;
  term_max_days?: number;
  interest_rate?: number;
  interest_type?: string;
  repayment_frequency?: string;
  processing_fee?: number;
  status?: string;
  is_active?: boolean;
};

export type LoanApplication = {
  id: number;
  reference_number?: string;
  customer_id?: number;
  customer_name?: string;
  customer?: Partial<Customer> & { name?: string };
  product_id?: number;
  product_name?: string;
  product?: Partial<LoanProduct>;
  requested_amount?: number;
  approved_amount?: number | null;
  term_days?: number;
  status?: string;
  purpose?: string | null;
  rejection_reason?: string | null;
  submitted_at?: string | null;
  decided_at?: string | null;
  created_at?: string | null;
  loan_id?: number | null;
  loan?: { id: number; reference_number?: string; status?: string } | null;
};

export type Loan = {
  id: number;
  reference_number?: string;
  customer_id?: number;
  customer_name?: string;
  customer?: Partial<Customer> & { name?: string; phone?: string };
  product_id?: number;
  product_name?: string;
  product?: Partial<LoanProduct>;
  principal?: number;
  total_interest?: number;
  total_repayable?: number;
  outstanding_balance?: number;
  total_repaid?: number;
  repayment_progress?: number;
  status?: string;
  term_days?: number;
  interest_rate?: number;
  interest_type?: string;
  repayment_frequency?: string;
  disbursed_at?: string | null;
  closed_at?: string | null;
  loan_application_id?: number | null;
};

export type Repayment = {
  id: number;
  reference_number?: string;
  loan_id?: number;
  loan_reference?: string;
  customer_name?: string;
  amount?: number;
  paid_at?: string;
  channel?: string;
  notes?: string | null;
};

export type RepaymentCreateMeta = {
  loans?: Array<{
    id: number;
    reference_number?: string;
    customer_name?: string;
    outstanding_balance?: number;
  }>;
  payment_channels?: string[];
  channels?: Array<{ value: string; label: string }>;
  default_payment_channel?: string;
  currency?: string;
};

export type ReportSummary = {
  currency?: string;
  portfolio?: {
    active_loans?: number;
    total_disbursed?: number;
    outstanding?: number;
    collected_this_month?: number;
    overdue_installments?: number;
  };
  portfolio_outstanding?: number;
  active_loans?: number;
  disbursed_this_month?: number;
  repayments_this_month?: number;
  overdue_amount?: number;
  pending_applications?: number;
  [key: string]: unknown;
};

export type AuditLog = {
  id: number;
  action?: string;
  category?: string;
  description?: string;
  user_name?: string;
  entity_type?: string | null;
  entity_id?: number | null;
  created_at?: string;
};

export type SubscriptionPlan = {
  id: number;
  name: string;
  slug?: string;
  price?: number;
  currency?: string;
  billing_interval?: string;
  description?: string | null;
  is_active?: boolean;
  features?: string[] | Record<string, unknown>;
};

export type Subscription = {
  id: number;
  organization_id?: number;
  organization_name?: string;
  plan_id?: number;
  plan_name?: string;
  status?: string;
  billing_interval?: string;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  canceled_at?: string | null;
};

export type Invoice = {
  id: number;
  invoice_number?: string;
  organization_id?: number;
  organization_name?: string;
  amount?: number;
  currency?: string;
  status?: string;
  due_at?: string | null;
  paid_at?: string | null;
};

export type SystemHealth = {
  app?: string;
  env?: string;
  php?: string;
  laravel?: string;
  database?: string | boolean;
  cache?: string | boolean;
  queue?: string | boolean;
  storage?: string | boolean;
  recent_audit_logs?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};
