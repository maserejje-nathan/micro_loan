<?php

namespace App\Http\Controllers;

use App\Services\InAppNotificationService;
use App\Support\InAppNotificationPresenter;
use App\Support\ListPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_if($user === null, 403);

        if (! Schema::hasTable('notifications')) {
            return Inertia::render('notifications/index', [
                'notifications' => ['data' => []],
                'unreadCount' => 0,
            ]);
        }

        $organizationId = $user->current_organization_id;

        $notifications = $user->notifications()
            ->when(
                $organizationId,
                fn ($query) => $query->where(function ($query) use ($organizationId) {
                    $query->where('data->organization_id', $organizationId)
                        ->orWhereNull('data->organization_id');
                }),
            )
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (DatabaseNotification $notification) => InAppNotificationPresenter::present($notification));

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => app(InAppNotificationService::class)
                ->unreadCountFor($user, $organizationId),
        ]);
    }

    public function markAsRead(Request $request, string $notification): RedirectResponse
    {
        $user = $request->user();
        abort_if($user === null, 403);

        $record = $user->notifications()->where('id', $notification)->firstOrFail();
        $record->markAsRead();

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_if($user === null, 403);

        $organizationId = $user->current_organization_id;

        $user->unreadNotifications()
            ->when(
                $organizationId,
                fn ($query) => $query->where(function ($query) use ($organizationId) {
                    $query->where('data->organization_id', $organizationId)
                        ->orWhereNull('data->organization_id');
                }),
            )
            ->update(['read_at' => now()]);

        return back();
    }
}
