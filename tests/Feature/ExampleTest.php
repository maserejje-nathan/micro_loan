<?php

test('landing page loads for guests', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('auth')
            ->has('name'));
});
