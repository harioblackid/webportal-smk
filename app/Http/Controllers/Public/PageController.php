<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ImageResource;
use App\Models\ProfileMission;
use App\Models\ProfileSection;
use App\Support\Seo;
use App\Support\SiteSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * The pages FR4-15 and FR4-17 keep out of the CMS, plus the custom 404.
 */
class PageController extends Controller
{
    public function profil(): InertiaResponse
    {
        $sections = ProfileSection::query()->with('media')->get()->keyBy('key');

        return Inertia::render('public/profil', [
            // Keyed by section rather than sent as a list: the page gives each
            // one its own widget and layout, so it asks for them by name.
            'sections' => array_map(fn (string $key) => [
                'key' => $key,
                'title' => $sections->get($key)?->title,
                'body' => $sections->get($key)?->body,
                'image' => ImageResource::optional($sections->get($key)?->media),
            ], ProfileSection::KEYS),
            'missions' => ProfileMission::query()
                ->ordered()
                ->get()
                ->map(fn (ProfileMission $mission) => [
                    'title' => $mission->title,
                    'description' => $mission->description,
                ])
                ->all(),
            'seo' => Seo::page(
                'Profil Sekolah',
                'Sambutan kepala sekolah, sejarah singkat, visi & misi, serta identitas yayasan SMK PGRI Telagasari.',
            ),
        ]);
    }

    public function kontak(): InertiaResponse
    {
        return Inertia::render('public/kontak', [
            // Only the map lives here; address, phone, and email arrive with
            // the shared `site` prop that every page already carries.
            'mapsEmbedUrl' => SiteSettings::mapsEmbedUrl(),
            'seo' => Seo::page(
                'Kontak & Lokasi',
                'Alamat, nomor telepon, WhatsApp, email, dan peta lokasi SMK PGRI Telagasari.',
            ),
        ]);
    }

    /**
     * FR4-21 + FR6-21: a real 404 status with a page that offers a way out.
     */
    public function notFound(Request $request): Response
    {
        return Inertia::render('public/error', [
            'status' => 404,
            'seo' => Seo::page('Halaman tidak ditemukan'),
        ])->toResponse($request)->setStatusCode(404);
    }
}
