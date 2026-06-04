<?php

namespace App\Http\Controllers;

use App\Models\OrganizationInvitation;
use App\Services\TeamInvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcceptTeamInvitationController extends Controller
{
    public function show(string $token): Response|RedirectResponse
    {
        $invitation = OrganizationInvitation::query()
            ->with(['organization', 'role'])
            ->where('token', $token)
            ->firstOrFail();

        if ($invitation->isAccepted()) {
            return redirect()->route('login')->with('status', 'This invitation has already been accepted.');
        }

        if ($invitation->isExpired()) {
            return redirect()->route('login')->with('status', 'This invitation has expired.');
        }

        return Inertia::render('invitations/accept', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'organization_name' => $invitation->organization->name,
                'role_name' => $invitation->role->name,
                'expires_at' => $invitation->expires_at->toFormattedDateString(),
            ],
        ]);
    }

    public function accept(
        string $token,
        Request $request,
        TeamInvitationService $service,
    ): RedirectResponse {
        $invitation = OrganizationInvitation::query()
            ->where('token', $token)
            ->firstOrFail();

        $user = $request->user();

        if ($user === null) {
            return redirect()
                ->guest(route('login'))
                ->with('status', 'Please sign in with '.$invitation->email.' to accept this invitation.');
        }

        $service->accept($invitation, $user);

        return redirect()->route('dashboard')->with('success', 'You have joined '.$invitation->organization->name.'.');
    }
}
