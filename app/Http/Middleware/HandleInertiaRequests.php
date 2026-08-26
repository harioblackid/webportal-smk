<?php

namespace App\Http\Middleware;

use App\Support\SiteSettings;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            // prd-04 §5: Navbar, Footer, and PpdbBanner appear on every public
            // page, so their data is shared rather than repeated per controller.
            'site' => SiteSettings::share(),
            'auth' => [
                'user' => $request->user(),
            ],
            // prd-05 §5: every admin write redirects, and the toast that
            // confirms it rides along here rather than in each page's props.
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            // The admin sidebar remembers whether it was collapsed; the starter
            // kit's <SidebarProvider> reads this as its defaultOpen.
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
