<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\OrganizationInvitation;
use App\Models\Role;
use App\Models\User;
use App\Notifications\TeamInvitationNotification;
use App\Support\OrganizationContext;
use Illuminate\Support\Facades\Notification;
use InvalidArgumentException;

class TeamInvitationService
{
    public function __construct(
        protected AuditLogger $auditLogger,
        protected InAppNotificationService $inApp,
    ) {}

    public function invite(Organization $organization, User $inviter, string $email, Role $role): OrganizationInvitation
    {
        if ($organization->users()->where('email', $email)->exists()) {
            throw new InvalidArgumentException('This user is already a member of the organization.');
        }

        $invitation = OrganizationInvitation::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => strtolower($email),
            ],
            [
                'role_id' => $role->id,
                'invited_by' => $inviter->id,
                'token' => OrganizationInvitation::generateToken(),
                'accepted_at' => null,
                'expires_at' => now()->addDays(7),
            ],
        );

        Notification::route('mail', $invitation->email)
            ->notify(new TeamInvitationNotification($invitation));

        $this->auditLogger->log('team.invited', $invitation, null, [
            'email' => $invitation->email,
            'role' => $role->slug,
        ]);

        return $invitation;
    }

    public function accept(OrganizationInvitation $invitation, User $user): void
    {
        if (! $invitation->isPending()) {
            throw new InvalidArgumentException('This invitation is no longer valid.');
        }

        if (strtolower($user->email) !== strtolower($invitation->email)) {
            throw new InvalidArgumentException('This invitation was sent to a different email address.');
        }

        $organization = $invitation->organization;

        if (! $organization->users()->where('users.id', $user->id)->exists()) {
            $organization->users()->attach($user->id, ['role_id' => $invitation->role_id]);
        }

        $user->switchOrganization($organization);

        $invitation->update(['accepted_at' => now()]);

        OrganizationContext::set($organization);

        $this->auditLogger->log('team.invitation_accepted', $invitation);

        $invitation->load('inviter', 'organization', 'role');

        if ($invitation->invited_by && $invitation->invited_by !== $user->id) {
            $inviter = User::query()->find($invitation->invited_by);

            if ($inviter) {
                $this->inApp->notify(
                    $inviter,
                    $this->inApp->payload(
                        'team.invitation_accepted',
                        'Invitation accepted',
                        "{$user->name} joined {$organization->name} as {$invitation->role->name}.",
                        route('settings.team.index'),
                        $organization->id,
                    ),
                );
            }
        }
    }

    public function revoke(OrganizationInvitation $invitation): void
    {
        if ($invitation->isAccepted()) {
            throw new InvalidArgumentException('Cannot revoke an accepted invitation.');
        }

        $invitation->delete();

        $this->auditLogger->log('team.invitation_revoked', $invitation);
    }
}
