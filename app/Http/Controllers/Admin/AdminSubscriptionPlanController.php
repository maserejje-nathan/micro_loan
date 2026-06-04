<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubscriptionPlanRequest;
use App\Http\Requests\Admin\UpdateSubscriptionPlanRequest;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Support\ListPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionPlanController extends Controller
{
    public function index(Request $request): Response
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
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (SubscriptionPlan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => $plan->price,
                'currency' => $plan->currency,
                'billing_interval' => $plan->billing_interval->value,
                'trial_days' => $plan->trial_days,
                'max_users' => $plan->max_users,
                'max_customers' => $plan->max_customers,
                'max_active_loans' => $plan->max_active_loans,
                'is_active' => $plan->is_active,
                'subscriptions_count' => $plan->subscriptions_count,
                'active_subscriptions_count' => $plan->active_subscriptions_count,
            ]);

        return Inertia::render('admin/plans/index', [
            'plans' => $plans,
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
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/plans/form', [
            'plan' => null,
            'billingIntervals' => ['monthly', 'yearly'],
        ]);
    }

    public function store(StoreSubscriptionPlanRequest $request): RedirectResponse
    {
        SubscriptionPlan::query()->create($this->payload($request->validated()));

        return redirect()->route('admin.plans.index')->with('success', 'Plan created.');
    }

    public function edit(SubscriptionPlan $plan): Response
    {
        return Inertia::render('admin/plans/form', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => $plan->price,
                'currency' => $plan->currency,
                'billing_interval' => $plan->billing_interval->value,
                'trial_days' => $plan->trial_days,
                'max_users' => $plan->max_users,
                'max_customers' => $plan->max_customers,
                'max_active_loans' => $plan->max_active_loans,
                'features' => $plan->features ?? [],
                'is_active' => $plan->is_active,
                'sort_order' => $plan->sort_order,
            ],
            'billingIntervals' => ['monthly', 'yearly'],
        ]);
    }

    public function update(UpdateSubscriptionPlanRequest $request, SubscriptionPlan $plan): RedirectResponse
    {
        $plan->update($this->payload($request->validated()));

        return redirect()->route('admin.plans.index')->with('success', 'Plan updated.');
    }

    public function destroy(SubscriptionPlan $plan): RedirectResponse
    {
        if ($plan->subscriptions()->exists()) {
            return back()->with('error', 'Cannot delete a plan with active subscriptions.');
        }

        $plan->delete();

        return redirect()->route('admin.plans.index')->with('success', 'Plan deleted.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function payload(array $data): array
    {
        return [
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'currency' => strtoupper($data['currency']),
            'billing_interval' => $data['billing_interval'],
            'trial_days' => $data['trial_days'],
            'max_users' => $data['max_users'] ?? null,
            'max_customers' => $data['max_customers'] ?? null,
            'max_active_loans' => $data['max_active_loans'] ?? null,
            'features' => $data['features'] ?? [],
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ];
    }
}
