<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SubscriptionPlanSeeder::class,
            SuperAdminSeeder::class,
        ]);

        if (filter_var(env('SEED_DEMO_DATA', true), FILTER_VALIDATE_BOOL)) {
            $this->call(DemoSeeder::class);
        }
    }
}
