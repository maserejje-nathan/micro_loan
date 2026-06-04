<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('subdomain')->nullable()->unique()->after('slug');
        });

        Schema::table('loan_schedules', function (Blueprint $table) {
            $table->timestamp('overdue_notified_at')->nullable()->after('status');
        });

        Schema::create('organization_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_by')->constrained('users')->cascadeOnDelete();
            $table->string('email');
            $table->string('token', 64)->unique();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->unique(['organization_id', 'email']);
        });

        DB::table('organizations')
            ->whereNull('subdomain')
            ->update(['subdomain' => DB::raw('slug')]);
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_invitations');

        Schema::table('loan_schedules', function (Blueprint $table) {
            $table->dropColumn('overdue_notified_at');
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('subdomain');
        });
    }
};
