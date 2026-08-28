<!DOCTYPE html>
{{-- The class attribute is emitted only when it has a value, so the tag stays
     exactly `<html lang="id">` in the default (light / system) case. --}}
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"@if (($appearance ?? 'system') === 'dark') class="dark"@endif>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Resolve "system" before the bundle loads, so the theme never flashes. --}}
        <script>
            (function () {
                const appearance = '{{ $appearance ?? 'system' }}';

                if (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        {{-- The page background has to be painted before the CSS bundle arrives. --}}
        <style>
            html { background-color: #ffffff; }
            html.dark { background-color: rgb(3 6 32); }
        </style>

        {{-- D-4 / US-003: all three derive from prd/logo_smk_new.png. The
             Laravel starter's SVG icon is deleted on purpose — a browser
             prefers an SVG icon over the .ico when both are offered. --}}
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- FR6-18 / US-020: the Search Console ownership tag. Site-wide, not
             just Home, so the property stays verified whichever URL Google
             re-checks. --}}
        @if ($verification = App\Support\SearchConsole::token())
            <meta name="google-site-verification" content="{{ $verification }}">
        @endif

        {{-- FR5-18 / US-015: GA4 loads only when a Superadmin has entered a
             Measurement ID, and App\Support\Analytics keeps it off /admin.

             This is Google's own snippet with one change: gtag.js is injected
             after the page is interactive instead of `async` in the head. It
             was measured at 673ms of main-thread time on a throttled mobile
             trace (2026-08-28), landing squarely in the LCP window on a page
             whose LCP element is text and whose whole render delay is 1,223ms.

             The measurement semantics are unchanged, which is the point of
             keeping the shim inline and eager: `gtag()` only pushes onto
             `dataLayer`, an ordinary array. The js/config calls below queue
             there with their real timestamps and gtag.js replays the queue
             when it finally arrives, so the page_view still fires and still
             carries the right time. --}}
        @if ($ga4 = App\Support\Analytics::measurementId())
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', @json($ga4));

                (function () {
                    var load = function () {
                        var tag = document.createElement('script');
                        tag.async = true;
                        tag.src = 'https://www.googletagmanager.com/gtag/js?id={{ $ga4 }}';
                        document.head.appendChild(tag);
                    };

                    // requestIdleCallback where it exists; Safari still has no
                    // support, so `load` is the floor everywhere else. Either
                    // way the fetch starts after first paint, never before.
                    if ('requestIdleCallback' in window) {
                        window.requestIdleCallback(load, { timeout: 4000 });
                    } else if (document.readyState === 'complete') {
                        window.setTimeout(load, 1000);
                    } else {
                        window.addEventListener('load', function () {
                            window.setTimeout(load, 1000);
                        });
                    }
                })();
            </script>
        @endif

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
