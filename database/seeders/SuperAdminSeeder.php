<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SUPERADMIN_EMAIL', 'superadmin@example.com');

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => env('SUPERADMIN_NAME', 'Super Admin'),
                'password' => Hash::make(env('SUPERADMIN_PASSWORD', 'password')),
                'email_verified_at' => now(),
                'is_super_admin' => true,
            ],
        );
    }
}
