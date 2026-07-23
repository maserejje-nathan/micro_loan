<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Admin\SubscriptionResource;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use App\Support\ListPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubscriptionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $status = $request->string('status')->toString();
        $activeStatus = SubscriptionStatus::tryFrom($status)?->value;
        $search = trim($request->string('search')->toString());

        $subscriptions = Subscription::query()
            ->with(['organization', 'plan'])
            ->when(
                $activeStatus,
                fn ($query) => $query->where('status', $activeStatus),
            )
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search) {
                    $query->whereHas(
                        'organization',
                        fn ($q) => $q->where('name', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%"),
                    )->orWhereHas(
                        'plan',
                        fn ($q) => $q->where('name', 'like', "%{$search}%"),
                    );
                }),
            )
            ->latest()
            ->paginate(ListPagination::perPage());

        return SubscriptionResource::collection($subscriptions);
    }

    public function cancel(Subscription $subscription, SubscriptionService $service): JsonResponse
    {
        $service->cancel($subscription);

        return response()->json([
            'message' => 'Subscription cancelled.',
            'data' => SubscriptionResource::make($subscription->fresh()->load(['organization', 'plan']))->resolve(),
        ]);
    }

    public function activate(Subscription $subscription, SubscriptionService $service): JsonResponse
    {
        $service->activate($subscription);

        return response()->json([
            'message' => 'Subscription activated.',
            'data' => SubscriptionResource::make($subscription->fresh()->load(['organization', 'plan']))->resolve(),
        ]);
    }

    public function renew(Subscription $subscription, SubscriptionService $service): JsonResponse
    {
        $service->renewPeriod($subscription);

        return response()->json([
            'message' => 'Subscription renewed.',
            'data' => SubscriptionResource::make($subscription->fresh()->load(['organization', 'plan']))->resolve(),
        ]);
    }
}
