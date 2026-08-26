<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Support\SchoolIdentityFields;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Identitas sekolah (Profil > Identitas Sekolah).
 *
 * The page can be switched off in the CMS; the `page:identitas` middleware on
 * the route is what enforces that, not this controller.
 */
class SchoolIdentityController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('public/identitas', [
            // Already filtered: a blank field never leaves the server, so the
            // page has no empty rows to hide.
            'groups' => SchoolIdentityFields::publicGroups(),
            'seo' => Seo::page(
                'Identitas Sekolah',
                'Data resmi SMK PGRI Telagasari: NPSN, jenjang dan status sekolah, lokasi, izin operasional, akreditasi, serta kontak.',
            ),
        ]);
    }
}
