<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\PortalUpdateNotificationPreferencesRequest;
use App\Http\Requests\Portal\PortalUpdatePasswordRequest;
use App\Http\Requests\Portal\PortalUpdateProfileRequest;
use App\Support\CustomerNotificationChannels;
use App\Models\Customer;
use App\Services\CustomerPhotoService;
use App\Services\CustomerPortalService;
use App\Support\OrganizationContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PortalProfileController extends Controller
{
    public function edit(Request $request, CustomerPhotoService $customerPhotoService): Response
    {
        /** @var Customer $customer */
        $customer = $request->user('portal');

        return Inertia::render('portal/profile', [
            'customer' => [
                'reference_number' => $customer->reference_number,
                'photo_url' => $customerPhotoService->portalUrl($customer),
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'address' => $customer->address,
                'district' => $customer->district,
                'city' => $customer->city,
                'occupation' => $customer->occupation,
                'employer_name' => $customer->employer_name,
                'monthly_income' => $customer->monthly_income,
                'next_of_kin_name' => $customer->next_of_kin_name,
                'next_of_kin_phone' => $customer->next_of_kin_phone,
                'next_of_kin_relationship' => $customer->next_of_kin_relationship,
                'payment_reminder_channels' => $customer->paymentReminderChannels(),
            ],
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'notificationChannels' => CustomerNotificationChannels::options(),
        ]);
    }

    public function update(PortalUpdateProfileRequest $request): RedirectResponse
    {
        /** @var Customer $customer */
        $customer = $request->user('portal');

        $customer->update($request->validated());

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(
        PortalUpdatePasswordRequest $request,
        CustomerPortalService $portal,
    ): RedirectResponse {
        /** @var Customer $customer */
        $customer = $request->user('portal');

        if (! Hash::check($request->string('current_password')->toString(), $customer->portal_password)) {
            return back()->withErrors([
                'current_password' => 'Current password is incorrect.',
            ]);
        }

        $portal->resetPassword($customer, $request->string('password')->toString());

        return back()->with('success', 'Password updated.');
    }

    public function updateNotificationPreferences(
        PortalUpdateNotificationPreferencesRequest $request,
    ): RedirectResponse {
        /** @var Customer $customer */
        $customer = $request->user('portal');

        $customer->update([
            'payment_reminder_channels' => $request->validated('payment_reminder_channels'),
        ]);

        return back()->with('success', 'Payment reminder preferences saved.');
    }

    public function photo(Request $request, CustomerPhotoService $customerPhotoService): StreamedResponse
    {
        /** @var Customer $customer */
        $customer = $request->user('portal');

        abort_unless($customerPhotoService->exists($customer), 404);

        return Storage::disk('local')->response($customer->photo_path);
    }
}
