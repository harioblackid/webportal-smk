<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SchoolIdentityRequest;
use App\Models\SchoolIdentity;
use App\Support\SchoolIdentityFields;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Identitas sekolah — Superadmin only, gated by the route group.
 *
 * These values feed the shared `site` prop (school name, address, phone,
 * email), so a save here changes the header, the footer, the JSON-LD, and the
 * public Identitas page on the next request — no deploy, no cache flush.
 */
class SchoolIdentityController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/school-identity/edit', [
            'groups' => SchoolIdentityFields::formGroups(),
            'values' => SchoolIdentityFields::all(),
        ]);
    }

    public function update(SchoolIdentityRequest $request): RedirectResponse
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        foreach (SchoolIdentityFields::keys() as $key) {
            SchoolIdentity::put($key, self::normalise($data[$key] ?? null));
        }

        return to_route('admin.school-identity.edit')
            ->with('success', 'Identitas sekolah disimpan.');
    }

    /**
     * Blank fields are stored as NULL rather than '', so the public page's
     * "hide what is empty" rule has a single value to test against.
     */
    private static function normalise(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
