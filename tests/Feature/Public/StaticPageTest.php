<?php

use App\Models\Setting;
use Inertia\Testing\AssertableInertia;

test('profil renders with its own metadata', function () {
    $this->get(route('profil'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/profil')
            ->where('seo.title', 'Profil Sekolah')
        );

    // FR4-15: the four required blocks are static copy in the component, so
    // they are asserted there. The response carries only the Inertia props —
    // the copy itself is rendered on the client.
    expect(file_get_contents(resource_path('js/pages/public/profil.tsx')))
        ->toContain('Sambutan kepala sekolah')
        ->toContain('Sejarah singkat')
        ->toContain('Visi & misi')
        ->toContain('YPLP Dasar Menengah PGRI');
});

test('kontak turns the stored contact details into live links', function () {
    // FR4-18: tel:, wa.me, mailto: — never plain text to copy by hand.
    Setting::put('contact_phone', '(0267) 123456');
    Setting::put('contact_whatsapp', '0812-3456-7890');
    Setting::put('contact_email', 'info@smkpgritelagasari.sch.id');
    Setting::put('contact_address', 'Jalan Raya Telagasari');

    $this->get(route('kontak'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/kontak')
            ->where('site.contact.phoneHref', 'tel:0267123456')
            ->where('site.contact.whatsappHref', 'https://wa.me/6281234567890')
            ->where('site.contact.address', 'Jalan Raya Telagasari')
            ->where('site.contact.email', 'info@smkpgritelagasari.sch.id')
        );
});

test('the maps setting yields only the embed url, never pasted markup', function () {
    Setting::put(
        'maps_embed',
        '<iframe src="https://www.google.com/maps/embed?pb=1" onload="alert(1)"></iframe>'
    );

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('mapsEmbedUrl', 'https://www.google.com/maps/embed?pb=1')
        );
});

test('a non-https maps setting is dropped', function () {
    Setting::put('maps_embed', 'javascript:alert(1)');

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('mapsEmbedUrl', null));
});

test('an unknown url returns a real 404 with the custom page', function () {
    // FR4-21 + FR6-21
    $this->get('/halaman-yang-tidak-ada')
        ->assertNotFound()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/error')
            ->where('status', 404)
        );
});

test('every public page carries a canonical base and school identity', function () {
    Setting::put('school_name', 'SMK PGRI Telagasari');

    foreach ([route('home'), route('profil'), route('kontak'), route('posts.index'), route('majors.index')] as $url) {
        $this->get($url)->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.name', 'SMK PGRI Telagasari')
            ->has('site.url')
            ->has('seo.title')
        );
    }
});
