export type AuthStackParamList = {
  Login: undefined;
};

export type LenderTabParamList = {
  Home: undefined;
  Customers: undefined;
  Applications: undefined;
  Loans: undefined;
  More: undefined;
};

export type LenderHomeStackParamList = {
  Dashboard: undefined;
};

export type LenderCustomersStackParamList = {
  CustomersList: undefined;
  CustomerDetail: { id: number };
};

export type LenderApplicationsStackParamList = {
  ApplicationsList: undefined;
  ApplicationDetail: { id: number };
};

export type LenderLoansStackParamList = {
  LoansList: undefined;
  LoanDetail: { id: number };
};

export type LenderMoreStackParamList = {
  MoreMenu: undefined;
  Products: undefined;
  ProductDetail: { id: number };
  Repayments: undefined;
  RepaymentCreate: undefined;
  Reports: undefined;
  AuditLogs: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Home: undefined;
  Organizations: undefined;
  Billing: undefined;
  System: undefined;
  Account: undefined;
};

export type AdminHomeStackParamList = {
  Dashboard: undefined;
};

export type AdminOrganizationsStackParamList = {
  OrganizationsList: undefined;
  OrganizationDetail: { id: number };
};

export type AdminBillingStackParamList = {
  BillingHome: undefined;
  Plans: undefined;
  Subscriptions: undefined;
  Invoices: undefined;
};

export type PortalTabParamList = {
  Home: undefined;
  Loans: undefined;
  Applications: undefined;
  Profile: undefined;
};

export type PortalHomeStackParamList = {
  Dashboard: undefined;
};

export type PortalLoansStackParamList = {
  PortalLoansList: undefined;
  PortalLoanDetail: { id: number };
};

export type PortalApplicationsStackParamList = {
  PortalApplicationsList: undefined;
  PortalApplicationDetail: { id: number };
  PortalApplicationCreate: undefined;
};
