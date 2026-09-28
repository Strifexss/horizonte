<?php

it('returns a successful response', function () {
    $response = $this->get('/');

    // Root route redirects to login in this app
    $response->assertRedirect(route('login'));
});
