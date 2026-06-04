<?php

namespace App\Notifications;

use App\Models\OrganizationInvitation;
use App\Support\Tenancy;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public OrganizationInvitation $invitation) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $organization = $this->invitation->organization;
        $role = $this->invitation->role;
        $url = Tenancy::organizationUrl(
            $organization,
            '/invitations/'.$this->invitation->token,
        );

        return (new MailMessage)
            ->subject('You have been invited to '.$organization->name)
            ->greeting('Team invitation')
            ->line('You have been invited to join **'.$organization->name.'** as **'.$role->name.'**.')
            ->action('Accept invitation', $url)
            ->line('This invitation expires on '.$this->invitation->expires_at->toFormattedDateString().'.');
    }
}
