# Avango Mobile (React Native / Expo)

Mobile app for **lender staff**, **platform admins**, and **portal customers** — mirroring the web app.

## Prerequisites

1. Laravel API running (`php artisan serve` or Sail)
2. Migrations applied (includes Sanctum `personal_access_tokens`)
3. Expo Go on your phone, or iOS Simulator / Android Emulator

## Configure API URL

Copy the example env file:

```bash
cp .env.example .env
```

| Environment | `EXPO_PUBLIC_API_URL` |
|-------------|------------------------|
| iOS simulator | `http://localhost:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| Physical device | `http://YOUR_LAN_IP:8000` |

Laravel must listen on `0.0.0.0` for physical devices:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## Run

```bash
cd mobile
npm install
npm start
```

Then press `i` (iOS), `a` (Android), or scan the QR code with Expo Go.

## Current features

### Auth
- Staff login via `/api/v1/login` (email + password)
- Portal login via `/api/v1/portal/login` (lender code + phone + password)
- Session restore via SecureStore (token + auth mode)
- Role routing: super admin → Admin tabs, org staff → Lender tabs, portal → Portal tabs

### Lender (org staff)
- Home dashboard (stats + recent applications)
- Customers list/detail
- Applications list/detail with Submit / Approve / Reject
- Loans list/detail with Disburse (cash)
- More: Products, Repayments (+ create), Reports, Audit logs, Profile/Sign out
- Permission-gated menu items and actions

### Admin (super admin)
- Home dashboard (platform stats + recent orgs)
- Organizations list/detail
- Billing stack: Plans, Subscriptions (activate/renew/cancel), Invoices (mark paid)
- System health
- Account / sign out

### Portal (customers)
- Home dashboard
- Loans list/detail
- Applications list/detail/create + submit draft
- Profile update + password change + sign out

## Shared UI

Reusable components in `src/components/`: Screen, Card, ListRow, StatGrid, EmptyState, PrimaryButton, ErrorBanner, SectionHeader, DetailField, PromptModal.
