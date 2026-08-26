<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProfileSectionRequest;
use App\Models\ProfileMission;
use App\Models\ProfileSection;
use App\Support\HtmlSanitizer;
use App\Support\MediaLibrary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Halaman Visi Misi (Profil).
 *
 * Open to both roles: this is editorial copy, not configuration. There is no
 * on/off toggle either — Profil always has a Visi Misi page, so the only
 * question is what it says.
 */
class ProfileSectionController extends Controller
{
    public function edit(): Response
    {
        // Driven by KEYS rather than by whatever rows exist: firstOrNew means a
        // row that went missing renders as an empty section the admin can fill,
        // instead of dropping out of the form altogether.
        $sections = [];

        foreach (ProfileSection::KEYS as $key) {
            $section = ProfileSection::query()->firstOrNew(['key' => $key]);

            $sections[] = [
                'key' => $key,
                'title' => (string) $section->title,
                'body' => (string) $section->body,
                'media_id' => $section->media_id,
            ];
        }

        return Inertia::render('admin/profile-sections/edit', [
            'sections' => $sections,
            'missions' => ProfileMission::query()
                ->ordered()
                ->get()
                ->map(fn (ProfileMission $mission) => [
                    'title' => $mission->title,
                    'description' => $mission->description ?? '',
                ])
                ->all(),
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function update(ProfileSectionRequest $request): RedirectResponse
    {
        /** @var array{sections: list<array<string, mixed>>, missions: list<array<string, mixed>>} $data */
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            foreach ($data['sections'] as $section) {
                $key = (string) $section['key'];
                $body = (string) ($section['body'] ?? '');

                ProfileSection::query()->updateOrCreate(
                    ['key' => $key],
                    [
                        'title' => (string) $section['title'],
                        // FR5-9: editor HTML is stored sanitised, never raw.
                        // A plain-text section is stripped instead, so markup
                        // cannot reach a slot that has nowhere legal to put it.
                        'body' => ProfileSection::isPlainText($key)
                            ? trim(strip_tags($body))
                            : HtmlSanitizer::clean($body),
                        'media_id' => $section['media_id'] ?? null,
                    ],
                );
            }

            // Rewritten wholesale: the list is short, its order is its only
            // identity, and diffing rows would buy nothing but bugs.
            ProfileMission::query()->delete();

            foreach ($data['missions'] as $index => $mission) {
                ProfileMission::query()->create([
                    'title' => (string) $mission['title'],
                    'description' => self::blankToNull($mission['description'] ?? null),
                    'sort_order' => $index,
                ]);
            }
        });

        return to_route('admin.profile-sections.edit')
            ->with('success', 'Halaman Visi Misi disimpan.');
    }

    private static function blankToNull(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
