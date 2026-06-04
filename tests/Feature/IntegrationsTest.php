<?php

use App\Enums\MobileMoneyStatus;
use App\Enums\SmsStatus;
use App\Models\MobileMoneyTransaction;
use App\Models\SmsNotification;
use App\Models\User;
use App\Services\MobileMoney\YoPaymentsGateway;
use App\Services\Sms\AfricasTalkingSmsGateway;
use Illuminate\Support\Facades\Http;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('africas talking gateway sends sms via api', function () {
    config([
        'sms.driver' => 'africas_talking',
        'sms.africas_talking.username' => 'sandbox',
        'sms.africas_talking.api_key' => 'test-key',
        'sms.africas_talking.from' => 'LOAN',
    ]);

    Http::fake([
        'api.africastalking.com/*' => Http::response([
            'SMSMessageData' => ['Recipients' => [['status' => 'Success']]],
        ], 201),
    ]);

    $organization = $this->setupOrganization(User::factory()->create());

    $notification = SmsNotification::query()->create([
        'organization_id' => $organization->id,
        'recipient_phone' => '256700000001',
        'message' => 'Test',
        'type' => 'test',
        'status' => SmsStatus::Pending,
    ]);

    $gateway = app(AfricasTalkingSmsGateway::class);
    expect($gateway->send($notification))->toBeTrue();
    expect($notification->fresh()->status)->toBe(SmsStatus::Sent);
});

test('yo payments gateway parses successful withdraw response', function () {
    config([
        'payments.mobile_money_driver' => 'yo',
        'payments.yo.username' => 'test',
        'payments.yo.password' => 'secret',
        'payments.yo.sandbox' => true,
    ]);

    Http::fake([
        '*' => Http::response(<<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate><Response><Status>OK</Status><TransactionReference>YO123</TransactionReference></Response></AutoCreate>
XML),
    ]);

    $organization = $this->setupOrganization(User::factory()->create());

    $transaction = MobileMoneyTransaction::query()->create([
        'organization_id' => $organization->id,
        'type' => 'disbursement',
        'phone' => '256700000001',
        'amount' => 10000,
        'status' => MobileMoneyStatus::Pending,
        'provider' => 'yo',
    ]);

    $gateway = app(YoPaymentsGateway::class);
    $result = $gateway->disburse($transaction);

    expect($result->status)->toBe(MobileMoneyStatus::Completed);
    expect($result->external_id)->toBe('YO123');
});
