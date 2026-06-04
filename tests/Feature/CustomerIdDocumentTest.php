<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    Storage::fake('local');
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);
    $this->actingAs($this->user->fresh());
});

test('owner can upload id document images on create', function () {
    $this->post(route('customers.store'), [
        'first_name' => 'Jane',
        'last_name' => 'Namukasa',
        'phone' => '256700000077',
        'id_front' => UploadedFile::fake()->image('front.jpg'),
        'id_back' => UploadedFile::fake()->image('back.jpg'),
    ])->assertRedirect(route('customers.index'));

    $customer = Customer::query()->first();

    expect($customer)->not->toBeNull()
        ->and($customer->id_front_path)->not->toBeNull()
        ->and($customer->id_back_path)->not->toBeNull();

    Storage::disk('local')->assertExists($customer->id_front_path);
    Storage::disk('local')->assertExists($customer->id_back_path);

    $this->get(route('customers.id-front', $customer))->assertSuccessful();
    $this->get(route('customers.id-back', $customer))->assertSuccessful();
});

test('owner can replace and remove id document images on update', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $this->put(route('customers.update', $customer), [
        'first_name' => $customer->first_name,
        'last_name' => $customer->last_name,
        'phone' => $customer->phone,
        'status' => $customer->status->value,
        'id_front' => UploadedFile::fake()->image('new-front.jpg'),
        'id_back' => UploadedFile::fake()->image('new-back.jpg'),
    ])->assertRedirect(route('customers.show', $customer));

    $customer->refresh();
    $frontPath = $customer->id_front_path;
    $backPath = $customer->id_back_path;

    expect($frontPath)->not->toBeNull()
        ->and($backPath)->not->toBeNull();

    $this->put(route('customers.update', $customer), [
        'first_name' => $customer->first_name,
        'last_name' => $customer->last_name,
        'phone' => $customer->phone,
        'status' => $customer->status->value,
        'remove_id_front' => true,
        'remove_id_back' => true,
    ])->assertRedirect(route('customers.show', $customer));

    $customer->refresh();

    expect($customer->id_front_path)->toBeNull()
        ->and($customer->id_back_path)->toBeNull();

    Storage::disk('local')->assertMissing($frontPath);
    Storage::disk('local')->assertMissing($backPath);
});

test('customer show includes id document urls when images exist', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $frontPath = "organizations/{$this->organization->id}/customers/{$customer->id}/id-front.jpg";
    $backPath = "organizations/{$this->organization->id}/customers/{$customer->id}/id-back.jpg";
    Storage::disk('local')->put($frontPath, UploadedFile::fake()->image('front.jpg')->getContent());
    Storage::disk('local')->put($backPath, UploadedFile::fake()->image('back.jpg')->getContent());
    $customer->update([
        'id_front_path' => $frontPath,
        'id_back_path' => $backPath,
    ]);

    $this->get(route('customers.show', $customer))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('customer.id_front_url', route('customers.id-front', $customer))
            ->where('customer.id_back_url', route('customers.id-back', $customer)));
});
