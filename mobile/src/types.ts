export type Organization = {
  id: number;
  name: string;
  slug: string;
  currency: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  organization?: Organization;
};

export type DashboardStats = {
  active_loans: number;
  pending_applications: number;
  total_customers: number;
  portfolio_outstanding: number;
  repayments_this_month: number;
};

export type RecentApplication = {
  id: number;
  reference_number: string;
  customer_name: string;
  product_name: string;
  requested_amount: number;
  status: string;
};

export type Dashboard = {
  stats: DashboardStats;
  recent_applications: RecentApplication[];
  currency: string;
};

export type LoginResponse = {
  token: string;
  token_type: string;
  user: User;
};
