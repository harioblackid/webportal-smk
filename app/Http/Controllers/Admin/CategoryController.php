<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kategori berita (FR5-12).
 *
 * Small enough to live on one page: the list, the create form, and the edit
 * form are the same screen, so there is no create/edit route here.
 */
class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => Category::query()
                ->withCount('posts')
                ->orderBy('name')
                ->get()
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    // Drives the disabled delete button, and explains why.
                    'postsCount' => $category->posts_count,
                ])
                ->all(),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $category = new Category;
        $this->fill($category, $request);
        $category->save();

        return to_route('admin.categories.index')
            ->with('success', 'Kategori "'.$category->name.'" ditambahkan.');
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $this->fill($category, $request);
        $category->save();

        return to_route('admin.categories.index')
            ->with('success', 'Kategori "'.$category->name.'" diperbarui.');
    }

    /**
     * US-012: a category still carrying posts is not deleted.
     *
     * The foreign key would null the posts' category_id rather than fail, so
     * the guard has to be here — silently uncategorising published berita is
     * exactly the "sembarangan" the story rules out.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->posts()->withTrashed()->exists()) {
            return to_route('admin.categories.index')->with(
                'error',
                'Kategori "'.$category->name.'" masih dipakai berita dan tidak dapat dihapus.'
            );
        }

        $category->delete();

        return to_route('admin.categories.index')
            ->with('success', 'Kategori "'.$category->name.'" dihapus.');
    }

    private function fill(Category $category, CategoryRequest $request): void
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $category->name = (string) $data['name'];

        $slugSource = trim((string) ($data['slug'] ?? ''));

        $category->slug = Slug::unique(
            Category::class,
            $slugSource !== '' ? $slugSource : (string) $data['name'],
            $category->exists ? $category->id : null,
        );
    }
}
