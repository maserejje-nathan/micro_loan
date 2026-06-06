<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeamInvitationRequest;
use App\Models\OrganizationInvitation;
use App\Models\Role;
use App\Services\OrganizationSetupService;
use App\Services\TeamInvitationService;
use App\Support\OrganizationContext;
use App\Support\Tenancy;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeamInvitationController extends Controller
{
    public function index(OrganizationSetupService $setup): Response
    {
        $organization = OrganizationContext::get();

        $invitations = OrganizationInvitation::query()
            ->with(['role', 'inviter'])
            ->where('organization_id', $organization?->id)
            ->latest()
            ->get()
            ->map(fn (OrganizationInvitation $invitation) => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role->name,
                'invited_by' => $invitation->inviter->name,
                'expires_at' => $invitation->expires_at->toDateTimeString(),
                'accepted_at' => $invitation->accepted_at?->toDateTimeString(),
                'status' => $invitation->isAccepted()
                    ? 'accepted'
                    : ($invitation->isExpired() ? 'expired' : 'pending'),
            ]);

        return Inertia::render('settings/team', [
            'invitations' => $invitations,
            'roles' => $organization
                ? $setup->rolesFor($organization)->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ])
                : [],
            'tenantUrl' => $organization?->subdomain
                ? Tenancy::organizationUrl($organization)
                : null,
        ]);
    }

    public function store(
        StoreTeamInvitationRequest $request,
        TeamInvitationService $service,
    ): RedirectResponse {
        $organization = OrganizationContext::get();
        $role = Role::query()->findOrFail($request->validated('role_id'));

        $service->invite(
            $organization,
            $request->user(),
            $request->validated('email'),
            $role,
        );

        return back()->with('success', 'Invitation sent.');
    }

    public function destroy(
        OrganizationInvitation $invitation,
        TeamInvitationService $service,
    ): RedirectResponse {
        abort_unless($invitation->organization_id === OrganizationContext::id(), 403);

        $service->revoke($invitation);

        return back()->with('success', 'Invitation revoked.');
    }
}
