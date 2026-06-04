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

test('owner can upload customer photo on create', function () {
    $photo = UploadedFile::fake()->image('customer.jpg', 400, 400);

    $this->post(route('customers.store'), [
        'first_name' => 'Jane',
        'last_name' => 'Namukasa',
        'phone' => '256700000088',
        'photo' => $photo,
    ])->assertRedirect(route('customers.index'));

    $customer = Customer::query()->first();

    expect($customer)->not->toBeNull()
        ->and($customer->photo_path)->not->toBeNull();

    Storage::disk('local')->assertExists($customer->photo_path);

    $this->get(route('customers.photo', $customer))
        ->assertSuccessful();
});

test('owner can replace and remove customer photo on update', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $this->put(route('customers.update', $customer), [
        'first_name' => $customer->first_name,
        'last_name' => $customer->last_name,
        'phone' => $customer->phone,
        'status' => $customer->status->value,
        'photo' => UploadedFile::fake()->image('new.jpg'),
    ])->assertRedirect(route('customers.show', $customer));

    $customer->refresh();
    $firstPath = $customer->photo_path;
    expect($firstPath)->not->toBeNull();
    Storage::disk('local')->assertExists($firstPath);

    $this->put(route('customers.update', $customer), [
        'first_name' => $customer->first_name,
        'last_name' => $customer->last_name,
        'phone' => $customer->phone,
        'status' => $customer->status->value,
        'remove_photo' => true,
    ])->assertRedirect(route('customers.show', $customer));

    $customer->refresh();
    expect($customer->photo_path)->toBeNull();
    Storage::disk('local')->assertMissing($firstPath);
});

test('customer show includes photo url when photo exists', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $path = "organizations/{$this->organization->id}/customers/{$customer->id}/photo.jpg";
    Storage::disk('local')->put($path, UploadedFile::fake()->image('stored.jpg')->getContent());
    $customer->update(['photo_path' => $path]);

    $this->get(route('customers.show', $customer))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('customer.photo_url', route('customers.photo', $customer)));
});
