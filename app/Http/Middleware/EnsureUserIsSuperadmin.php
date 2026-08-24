<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * FR5-2: role is enforced on the server. An Editor reaching a Superadmin route
 * gets 403 — hiding the link in the UI is explicitly not sufficient.
 */
class EnsureUserIsSuperadmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->isSuperadmin()) {
            abort(403);
        }

        return $next($request);
    }
}
