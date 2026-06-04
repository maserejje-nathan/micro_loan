<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('currency', 3)->default('UGX');
            $table->string('country', 2)->default('UG');
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_organization_id')->nullable()->after('id')->constrained('organizations')->nullOnDelete();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->string('group')->nullable();
            $table->timestamps();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->unique(['organization_id', 'slug']);
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();

            $table->primary(['role_id', 'permission_id']);
        });

        Schema::create('organization_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('national_id')->nullable();
            $table->text('address')->nullable();
            $table->string('status')->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'reference_number']);
            $table->index(['organization_id', 'phone']);
        });

        Schema::create('loan_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->unsignedBigInteger('min_amount');
            $table->unsignedBigInteger('max_amount');
            $table->decimal('interest_rate', 8, 4);
            $table->string('interest_type')->default('flat');
            $table->unsignedInteger('term_min_days');
            $table->unsignedInteger('term_max_days');
            $table->string('repayment_frequency')->default('monthly');
            $table->unsignedInteger('grace_period_days')->default(0);
            $table->unsignedBigInteger('processing_fee')->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'code']);
        });

        Schema::create('loan_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number');
            $table->unsignedBigInteger('requested_amount');
            $table->unsignedInteger('term_days');
            $table->text('purpose')->nullable();
            $table->string('status')->default('draft');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('approved_amount')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['organization_id', 'reference_number']);
        });

        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number');
            $table->unsignedBigInteger('principal');
            $table->decimal('interest_rate', 8, 4);
            $table->string('interest_type');
            $table->unsignedInteger('term_days');
            $table->string('repayment_frequency');
            $table->unsignedBigInteger('total_interest');
            $table->unsignedBigInteger('total_repayable');
            $table->unsignedBigInteger('outstanding_balance');
            $table->string('status')->default('pending_disbursement');
            $table->timestamp('disbursed_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'reference_number']);
        });

        Schema::create('loan_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('installment_number');
            $table->date('due_date');
            $table->unsignedBigInteger('principal_amount');
            $table->unsignedBigInteger('interest_amount');
            $table->unsignedBigInteger('total_amount');
            $table->unsignedBigInteger('paid_amount')->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->unique(['loan_id', 'installment_number']);
        });

        Schema::create('disbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('amount');
            $table->string('channel');
            $table->string('mobile_money_reference')->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('disbursed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('disbursed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('repayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number');
            $table->unsignedBigInteger('amount');
            $table->string('channel');
            $table->string('mobile_money_reference')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('paid_at');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'reference_number']);
        });

        Schema::create('sms_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('recipient_phone');
            $table->text('message');
            $table->string('type');
            $table->string('status')->default('pending');
            $table->json('provider_response')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->nullableMorphs('notifiable');
            $table->timestamps();
        });

        Schema::create('mobile_money_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->nullableMorphs('payable');
            $table->string('provider')->default('mtn');
            $table->string('external_id')->nullable();
            $table->string('phone');
            $table->unsignedBigInteger('amount');
            $table->string('status')->default('pending');
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->nullableMorphs('auditable');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('mobile_money_transactions');
        Schema::dropIfExists('sms_notifications');
        Schema::dropIfExists('repayments');
        Schema::dropIfExists('disbursements');
        Schema::dropIfExists('loan_schedules');
        Schema::dropIfExists('loans');
        Schema::dropIfExists('loan_applications');
        Schema::dropIfExists('loan_products');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('organization_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('permissions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('current_organization_id');
        });

        Schema::dropIfExists('organizations');
    }
};
