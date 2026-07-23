# Avango Lender (React Native)

Mobile app for lending staff — sign in with the same email/password used on the web app.

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

- Token login via `/api/v1/login` (Sanctum)
- Session restore via SecureStore
- Dashboard stats + recent applications
- Sign out

## Next endpoints (planned)

- Customers list/detail
- Loan applications
- Loans + repayments
- Push notifications
