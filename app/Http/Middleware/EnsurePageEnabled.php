<?php

namespace App\Http\Middleware;

use App\Support\PageVisibility;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates a public page on its CMS toggle: `->middleware('page:gallery')`.
 *
 * 404 rather than 403 or a redirect — to a visitor and to a crawler, a page the
 * school switched off simply does not exist. The exception handler in
 * bootstrap/app.php turns that into the public error page (FR4-21).
 */
class EnsurePageEnabled
{
    public function handle(Request $request, Closure $next, string $page): Response
    {
        if (! PageVisibility::enabled($page)) {
            abort(404);
        }

        return $next($request);
    }
}
