<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class BulkEmailAdmin
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless($request->user()?->role === 'admin' && ! $request->user()->is_blocked, 403, 'Administrator access required.');

        return $next($request);
    }
}
