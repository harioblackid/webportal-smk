<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaAltRequest;
use App\Http\Requests\Admin\MediaRequest;
use App\Models\Media;
use App\Support\ImageProcessor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Media library (prd-05 §3.6).
 *
 * Uploads answer with back() rather than a redirect to the library, because
 * the same endpoint serves the picker dialog opened on top of a half-written
 * berita — sending that editor to another page would discard the draft.
 */
class MediaController extends Controller
{
    private const PER_PAGE = 24;

    public function index(): Response
    {
        return Inertia::render('admin/media/index', [
            'media' => Media::query()
                ->latest('id')
                ->paginate(self::PER_PAGE)
                ->through(fn (Media $item) => [
                    'id' => $item->id,
                    'url' => $item->url(),
                    'thumbUrl' => $item->thumbUrl(),
                    'alt' => $item->alt ?? '',
                    'filename' => $item->filename,
                    'sizeLabel' => $item->size >= 1048576
                        ? number_format($item->size / 1048576, 1).' MB'
                        : number_format($item->size / 1024).' KB',
                    'uploadedAtLabel' => $item->created_at?->translatedFormat('j M Y'),
                ]),
            'maxKilobytes' => MediaRequest::MAX_KILOBYTES,
        ]);
    }

    /** FR5-15 / FR5-16 — validate, resize into two versions, then record it. */
    public function store(MediaRequest $request): RedirectResponse
    {
        /** @var UploadedFile $file */
        $file = $request->file('file');

        $media = Media::query()->create([
            ...ImageProcessor::store($file),
            'alt' => $request->string('alt')->trim()->value(),
            'uploaded_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Gambar "'.$media->filename.'" diunggah.');
    }

    /** FR5-17 — alt text is editable after the fact. */
    public function update(MediaAltRequest $request, Media $media): RedirectResponse
    {
        $media->alt = $request->string('alt')->trim()->value();
        $media->save();

        return back()->with('success', 'Teks alternatif diperbarui.');
    }

    public function destroy(Media $media): RedirectResponse
    {
        // The foreign keys are nullOnDelete, so posts and heroes pointing here
        // lose their image rather than the row itself.
        ImageProcessor::forget($media->path, $media->thumb_path);
        $media->delete();

        return back()->with('success', 'Gambar "'.$media->filename.'" dihapus.');
    }
}
