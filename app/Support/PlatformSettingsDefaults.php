<?php

namespace App\Support;

class PlatformSettingsDefaults
{
    public const NOTIFICATION_TYPES = [
        'loan_approved' => 'Loan approved',
        'loan_rejected' => 'Loan rejected',
        'loan_disbursed' => 'Loan disbursed',
        'repayment_received' => 'Repayment received',
        'overdue_reminder' => 'Overdue installment reminder',
    ];

    /**
     * @return array<string, mixed>
     */
    public static function welcome(): array
    {
        return [
            'logo_url' => '/images/logo.svg',
            'logo_path' => null,
            'meta_title' => 'Loan management for modern lenders',
            'hero_badge' => 'Loan operations platform',
            'hero_headline_prefix' => 'Lending software built for',
            'hero_headline_highlight' => 'growing MFIs',
            'hero_description' => '{app_name} helps microfinance institutions and small lenders run customers, loan products, disbursements, repayments, and teams from one secure, multi-tenant workspace.',
            'hero_primary_cta' => 'Start free trial',
            'hero_secondary_cta' => 'View pricing',
            'highlights' => [
                '14-day trial on every plan',
                'No credit card required to start',
                'Built for East African lenders',
            ],
            'cta_title' => 'Ready to modernize your lending operations?',
            'cta_description' => 'Create your company workspace, invite your team, and start managing loans with confidence.',
            'footer_tagline' => '{app_name} — secure loan management for microfinance institutions and small lenders across East Africa.',
            'popular_plan_slug' => 'professional',
            'banner_slides' => [
                [
                    'image_url' => '/images/welcome/banner-portfolio.svg',
                    'alt' => 'Loan portfolio overview on a laptop screen',
                    'caption' => 'Track every loan from application to repayment',
                ],
                [
                    'image_url' => '/images/welcome/banner-collections.svg',
                    'alt' => 'Mobile money collections on a smartphone',
                    'caption' => 'Collections, reminders, and mobile money in one place',
                ],
                [
                    'image_url' => '/images/welcome/banner-team.svg',
                    'alt' => 'Lending team collaborating in an office',
                    'caption' => 'Invite loan officers, cashiers, and viewers with role-based access',
                ],
            ],
            'steps' => [
                [
                    'title' => 'Create your account',
                    'description' => 'Register with your name and email. Add your lending company during sign-up to go straight to your workspace.',
                ],
                [
                    'title' => 'Launch your workspace',
                    'description' => 'Name your organization and become the owner. Your data stays isolated from other lenders on the platform.',
                ],
                [
                    'title' => 'Verify your email',
                    'description' => 'Confirm your address from the inbox link when verification is enabled, then access your full dashboard.',
                ],
                [
                    'title' => 'Invite your team',
                    'description' => 'Add loan officers, cashiers, and viewers from Settings → Team. Each role gets the right level of access.',
                ],
            ],
            'features' => [
                [
                    'title' => 'Customer management',
                    'description' => 'Centralize borrower profiles, references, and status in one searchable directory.',
                ],
                [
                    'title' => 'End-to-end lending',
                    'description' => 'Configure products, process applications, disburse funds, and track repayments.',
                ],
                [
                    'title' => 'Collections & reminders',
                    'description' => 'Automated SMS notifications and mobile money integrations for faster collections.',
                ],
                [
                    'title' => 'Reporting & statements',
                    'description' => 'Portfolio insights, PDF loan statements, and export-ready operational reports.',
                ],
                [
                    'title' => 'Compliance & audit',
                    'description' => 'Immutable audit logs and role-based permissions for accountable operations.',
                ],
                [
                    'title' => 'Secure multi-tenancy',
                    'description' => 'Each lending company operates in its own workspace with subdomain-ready isolation.',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function notifications(): array
    {
        return [
            'sms_driver' => 'log',
            'enabled_types' => array_fill_keys(array_keys(self::NOTIFICATION_TYPES), true),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function yoPayments(): array
    {
        return [
            'mobile_money_driver' => 'stub',
            'username' => '',
            'password' => '',
            'account' => '',
            'sandbox' => true,
            'non_blocking' => true,
            'api_url' => 'https://paymentsapi1.yo.co.ug/ybs/task.php',
            'sandbox_api_url' => 'https://sandbox.yopayments.com/ybs/task.php',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function africasTalking(): array
    {
        return [
            'username' => '',
            'api_key' => '',
            'from' => '',
            'endpoint' => 'https://api.africastalking.com/version1/messaging',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function smtp(): array
    {
        return [
            'mail_driver' => 'log',
            'host' => '',
            'port' => 587,
            'encryption' => 'tls',
            'username' => '',
            'password' => '',
            'from_address' => '',
            'from_name' => '',
        ];
    }
}
