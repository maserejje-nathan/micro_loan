<?php

namespace App\Support;

use Illuminate\Notifications\DatabaseNotification;

class InAppNotificationPresenter
{
    /**
     * @return array<string, mixed>
     */
    public static function present(DatabaseNotification $notification): array
    {
        /** @var array<string, mixed> $data */
        $data = $notification->data;

        return [
            'id' => $notification->id,
            'type' => (string) ($data['type'] ?? 'general'),
            'title' => (string) ($data['title'] ?? 'Notification'),
            'body' => (string) ($data['body'] ?? ''),
            'action_url' => isset($data['action_url']) ? (string) $data['action_url'] : null,
            'organization_id' => isset($data['organization_id']) ? (int) $data['organization_id'] : null,
            'read_at' => $notification->read_at?->toDateTimeString(),
            'created_at' => $notification->created_at->toDateTimeString(),
        ];
    }
}
