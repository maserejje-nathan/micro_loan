<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('national_id');
            $table->string('gender')->nullable()->after('date_of_birth');
            $table->string('nationality', 100)->nullable()->after('gender');
            $table->string('id_type')->nullable()->after('nationality');
            $table->date('id_expiry_date')->nullable()->after('id_type');
            $table->string('district')->nullable()->after('address');
            $table->string('city')->nullable()->after('district');
            $table->string('occupation')->nullable()->after('city');
            $table->string('employment_status')->nullable()->after('occupation');
            $table->string('employer_name')->nullable()->after('employment_status');
            $table->unsignedBigInteger('monthly_income')->nullable()->after('employer_name');
            $table->string('next_of_kin_name')->nullable()->after('monthly_income');
            $table->string('next_of_kin_phone', 20)->nullable()->after('next_of_kin_name');
            $table->string('next_of_kin_relationship')->nullable()->after('next_of_kin_phone');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'gender',
                'nationality',
                'id_type',
                'id_expiry_date',
                'district',
                'city',
                'occupation',
                'employment_status',
                'employer_name',
                'monthly_income',
                'next_of_kin_name',
                'next_of_kin_phone',
                'next_of_kin_relationship',
            ]);
        });
    }
};
