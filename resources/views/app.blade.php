<!DOCTYPE html>
{{-- No dark mode: OQ2-2 settled it as out of scope. --}}
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- D-4 / US-003: all three derive from prd/logo_smk_new.png. The
             Laravel starter's SVG icon is deleted on purpose — a browser
             prefers an SVG icon over the .ico when both are offered. --}}
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- FR5-18 / US-015: GA4 loads only when a Superadmin has entered a
             Measurement ID, and App\Support\Analytics keeps it off /admin. --}}
        @if ($ga4 = App\Support\Analytics::measurementId())
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $ga4 }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', @json($ga4));
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
