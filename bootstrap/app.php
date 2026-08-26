<?php

use App\Http\Controllers\Public\PageController;
use App\Http\Middleware\EnsurePageEnabled;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventIndexing;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function (): void {
            Route::middleware('web')
                ->group(__DIR__.'/../routes/auth.php');

            // prd-02 §3.2 + FR5-5: everything under /admin is behind auth and
            // never indexed. Applied here so an individual route cannot opt out.
            Route::middleware(['web', 'auth', PreventIndexing::class])
                ->prefix('admin')
                ->name('admin.')
                ->group(__DIR__.'/../routes/admin.php');
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Read before the Inertia bundle boots, so they must stay plain text.
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Public pages the CMS can switch off: `->middleware('page:gallery')`.
        $middleware->alias(['page' => EnsurePageEnabled::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // An exception unwinds past route middleware, so the guest redirect and
        // the 403 from EnsureUserIsSuperadmin would otherwise escape without the
        // noindex header PreventIndexing adds. FR5-5 covers every /admin
        // response, not only the successful ones.
        $exceptions->respond(function (Response $response, Throwable $e, Request $request): Response {
            if ($request->is('admin', 'admin/*')) {
                $response->headers->set('X-Robots-Tag', 'noindex, nofollow');

                return $response;
            }

            // FR4-21: a missing slug (a draft post, an inactive jurusan) must
            // land on the same 404 page an unknown URL does. The fallback route
            // cannot cover this one — abort() happens after routing has already
            // matched, so it unwinds through the exception handler instead.
            if ($response->getStatusCode() === 404 && ! $request->expectsJson()) {
                return app(PageController::class)->notFound($request);
            }

            return $response;
        });
    })->create();
