<?php

namespace App\Enums;

enum PermissionName: string
{
    case DashboardView = 'dashboard.view';
    case CustomersView = 'customers.view';
    case CustomersManage = 'customers.manage';
    case LoanProductsView = 'loan_products.view';
    case LoanProductsManage = 'loan_products.manage';
    case ApplicationsView = 'loan_applications.view';
    case ApplicationsManage = 'loan_applications.manage';
    case ApplicationsApprove = 'loan_applications.approve';
    case LoansView = 'loans.view';
    case LoansDisburse = 'loans.disburse';
    case RepaymentsView = 'repayments.view';
    case RepaymentsManage = 'repayments.manage';
    case ReportsView = 'reports.view';
    case AuditLogsView = 'audit_logs.view';
    case UsersManage = 'users.manage';
    case SettingsManage = 'settings.manage';

    public function label(): string
    {
        return match ($this) {
            self::DashboardView => 'View dashboard',
            self::CustomersView => 'View customers',
            self::CustomersManage => 'Manage customers',
            self::LoanProductsView => 'View loan products',
            self::LoanProductsManage => 'Manage loan products',
            self::ApplicationsView => 'View loan applications',
            self::ApplicationsManage => 'Manage loan applications',
            self::ApplicationsApprove => 'Approve or reject applications',
            self::LoansView => 'View loans',
            self::LoansDisburse => 'Disburse loans',
            self::RepaymentsView => 'View repayments',
            self::RepaymentsManage => 'Record repayments',
            self::ReportsView => 'View reports',
            self::AuditLogsView => 'View audit logs',
            self::UsersManage => 'Manage team members',
            self::SettingsManage => 'Manage organization settings',
        };
    }

    public function group(): string
    {
        return match ($this) {
            self::DashboardView => 'Dashboard',
            self::CustomersView, self::CustomersManage => 'Customers',
            self::LoanProductsView, self::LoanProductsManage => 'Loan products',
            self::ApplicationsView, self::ApplicationsManage, self::ApplicationsApprove => 'Applications',
            self::LoansView, self::LoansDisburse => 'Loans',
            self::RepaymentsView, self::RepaymentsManage => 'Repayments',
            self::ReportsView => 'Reports',
            self::AuditLogsView => 'Audit',
            self::UsersManage, self::SettingsManage => 'Administration',
        };
    }
}
