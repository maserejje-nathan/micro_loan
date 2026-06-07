# LendFlow — Microfinance Loan Management Platform

LendFlow is a multi-tenant SaaS loan management system built with **Laravel 13**, **Inertia.js v3**, and **React 19**. It helps microfinance institutions and small lenders manage customers, loan products, applications, disbursements, repayments, billing, and a borrower portal from one workspace.

## Requirements

- PHP 8.3 or higher (8.4 recommended)
- Composer 2.x
- Node.js 20+ and npm
- MySQL 8+ or MariaDB 10.6+ (SQLite supported for local development)
- Web server: Apache or Nginx with URL rewriting

### PHP extensions

`bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`

## Quick install

```bash
composer setup
```

This will copy `.env`, generate an app key, run migrations, seed demo data, link storage, install npm packages, and build frontend assets.

### Manual install

```bash
cp .env.example .env
touch database/database.sqlite   # only if using SQLite
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
npm install
npm run build
```

Point your web server document root to the `public/` directory.

## Default logins (after seeding)

| Role | URL | Email / Phone | Password |
|------|-----|---------------|----------|
| Super admin | `/admin` | `superadmin@example.com` | `password` |
| Lender owner | `/login` | `owner@demo.lendflow.test` | `password` |
| Borrower portal | `/portal/login` | `256700000100` | `portal-demo` |

Change all passwords before going live. Set `SEED_DEMO_DATA=false` in `.env` to skip demo data on fresh seeds.

## Production checklist

1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Use MySQL/MariaDB and strong database credentials
3. Change `SUPERADMIN_PASSWORD` and all demo account passwords
4. Configure real mail (`MAIL_*`) for email verification and notifications
5. Run a queue worker: `php artisan queue:work`
6. Add cron: `* * * * * php artisan schedule:run`
7. Enable HTTPS and set `SESSION_SECURE_COOKIE=true`
8. Configure SMS (`SMS_DRIVER`) and mobile money (`MOBILE_MONEY_DRIVER`) when ready

## Documentation

Full installation, configuration, and feature documentation is in the **`documentation/`** folder (open `documentation/index.html` in your browser).

## Support

Refer to your CodeCanyon purchase for support terms. Include your LendFlow version (shown on **Admin → System**) when requesting help.

## License

This item is licensed for use according to the Envato Market licenses. See `LICENSE.txt`.
