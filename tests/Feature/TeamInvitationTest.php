<?php

use App\Models\OrganizationInvitation;
use App\Models\Role;
use App\Models\User;
use App\Notifications\TeamInvitationNotification;
use Illuminate\Support\Facades\Notification;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('owner can invite team member', function () {
    Notification::fake();

    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $role = $organization->roles()->where('slug', 'loan_officer')->first();

    $this->post(route('settings.team.store'), [
        'email' => 'officer@example.com',
        'role_id' => $role->id,
    ])->assertRedirect();

    $invitation = OrganizationInvitation::query()->where('email', 'officer@example.com')->first();

    expect($invitation)->not->toBeNull();
    Notification::assertSentOnDemand(TeamInvitationNotification::class);
});

test('user can accept invitation with matching email', function () {
    $owner = User::factory()->create();
    $organization = $this->setupOrganization($owner);
    $role = $organization->roles()->where('slug', 'viewer')->first();

    $invitation = OrganizationInvitation::query()->create([
        'organization_id' => $organization->id,
        'role_id' => $role->id,
        'invited_by' => $owner->id,
        'email' => 'viewer@example.com',
        'token' => OrganizationInvitation::generateToken(),
        'expires_at' => now()->addWeek(),
    ]);

    $invitee = User::factory()->create(['email' => 'viewer@example.com']);
    $this->actingAs($invitee);

    $this->post(route('invitations.accept', $invitation->token))
        ->assertRedirect(route('dashboard'));

    expect($invitation->fresh()->accepted_at)->not->toBeNull();
    expect($invitee->fresh()->current_organization_id)->toBe($organization->id);
});
