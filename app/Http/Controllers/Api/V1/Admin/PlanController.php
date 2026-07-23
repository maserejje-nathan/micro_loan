<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Admin\SubscriptionPlanResource;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Support\ListPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $activeFilter = $request->string('active')->toString();
        $activeOnly = $activeFilter === '1' ? true : ($activeFilter === '0' ? false : null);
        $search = trim($request->string('search')->toString());

        $plans = SubscriptionPlan::query()
            ->orderBy('sort_order')
            ->withCount([
                'subscriptions',
                'subscriptions as active_subscriptions_count' => fn ($query) => $query
                    ->where('status', SubscriptionStatus::Active),
            ])
            ->when(
                $activeOnly === true,
                fn ($query) => $query->where('is_active', true),
            )
            ->when(
                $activeOnly === false,
                fn ($query) => $query->where('is_active', false),
            )
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                }),
            )
            ->paginate(ListPagination::perPage());

        return SubscriptionPlanResource::collection($plans)
            ->additional([
                'filters' => [
                    'active' => $activeOnly === null ? null : ($activeOnly ? '1' : '0'),
                    'search' => $search !== '' ? $search : null,
                ],
                'stats' => [
                    'total' => SubscriptionPlan::query()->count(),
                    'active' => SubscriptionPlan::query()->where('is_active', true)->count(),
                    'inactive' => SubscriptionPlan::query()->where('is_active', false)->count(),
                    'subscriptions' => Subscription::query()->count(),
                    'mrr' => Subscription::query()
                        ->with('plan')
                        ->where('status', SubscriptionStatus::Active)
                        ->get()
                        ->sum(
                            fn (Subscription $s) => $s->plan->billing_interval->value === 'yearly'
                                ? (int) round($s->plan->price / 12)
                                : $s->plan->price,
                        ),
                ],
            ])
            ->response();
    }

    public function show(SubscriptionPlan $plan): SubscriptionPlanResource
    {
        $plan->loadCount([
            'subscriptions',
            'subscriptions as active_subscriptions_count' => fn ($query) => $query
                ->where('status', SubscriptionStatus::Active),
        ]);

        return SubscriptionPlanResource::make($plan);
    }
}
