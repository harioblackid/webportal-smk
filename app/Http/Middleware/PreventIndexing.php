<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * FR5-5 / FR6-2: the admin area must never be indexed.
 *
 * Sent as a header rather than a meta tag so it also covers redirects and
 * non-HTML responses, which a <meta> in the page body cannot reach.
 */
class PreventIndexing
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Robots-Tag', 'noindex, nofollow');

        return $response;
    }
}
