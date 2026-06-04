<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use App\Notifications\InAppMessage;
use App\Support\InAppNotificationPresenter;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class InAppNotificationService
{
    /**
     * @return array{type: string, title: string, body: string, action_url: string|null, organization_id: int|null}
     */
    public function payload(
        string $type,
        string $title,
        string $body,
        ?string $actionUrl = null,
        ?int $organizationId = null,
    ): array {
        return [
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'action_url' => $actionUrl,
            'organization_id' => $organizationId,
        ];
    }

    public function notify(User $user, array $payload): void
    {
        if (! Schema::hasTable('notifications')) {
            return;
        }

        $user->notify(new InAppMessage($payload));
    }

    /**
     * @return Collection<int, User>
     */
    public function organizationUsersWithPermission(
        Organization $organization,
        string $permission,
        ?User $except = null,
    ): Collection {
        return $organization->users()
            ->get()
            ->filter(
                fn (User $user) => $user->id !== $except?->id
                    && $user->hasPermission($permission, $organization),
            );
    }

    public function notifyOrganization(
        Organization $organization,
        string $permission,
        array $payload,
        ?User $except = null,
    ): void {
        $this->organizationUsersWithPermission($organization, $permission, $except)
            ->each(fn (User $user) => $this->notify($user, $payload));
    }

    public function unreadCountFor(User $user, ?int $organizationId = null): int
    {
        if (! Schema::hasTable('notifications')) {
            return 0;
        }

        $organizationId ??= $user->current_organization_id;

        return $user->unreadNotifications()
            ->when(
                $organizationId,
                fn ($query) => $query->where(function ($query) use ($organizationId) {
                    $query->where('data->organization_id', $organizationId)
                        ->orWhereNull('data->organization_id');
                }),
            )
            ->count();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function recentFor(User $user, int $limit = 8, ?int $organizationId = null): array
    {
        if (! Schema::hasTable('notifications')) {
            return [];
        }

        $organizationId ??= $user->current_organization_id;

        return $user->notifications()
            ->when(
                $organizationId,
                fn ($query) => $query->where(function ($query) use ($organizationId) {
                    $query->where('data->organization_id', $organizationId)
                        ->orWhereNull('data->organization_id');
                }),
            )
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (DatabaseNotification $notification) => InAppNotificationPresenter::present($notification))
            ->all();
    }
}
