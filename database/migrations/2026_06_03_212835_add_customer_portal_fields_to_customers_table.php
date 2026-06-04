<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->boolean('portal_enabled')->default(false)->after('status');
            $table->string('portal_password')->nullable()->after('portal_enabled');
            $table->timestamp('portal_enabled_at')->nullable()->after('portal_password');
            $table->timestamp('portal_last_login_at')->nullable()->after('portal_enabled_at');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'portal_enabled',
                'portal_password',
                'portal_enabled_at',
                'portal_last_login_at',
            ]);
        });
    }
};
