<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards the read-only partner endpoints with a shared API key.
 *
 * These routes are called server-to-server (no Sanctum session), so the caller
 * proves itself with `X-Api-Key`. A bearer token is accepted as well, purely so
 * clients that only speak `Authorization` headers can still connect.
 */
class VerifyPartnerApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $keys = (array) config('partners.api_keys', []);

        // No keys configured means the integration was never switched on — fail
        // closed rather than letting an empty string match.
        if ($keys === []) {
            return response()->json(['message' => 'Partner API is not configured.'], 503);
        }

        $sent = (string) ($request->header('X-Api-Key') ?: $request->bearerToken() ?: '');

        foreach ($keys as $key) {
            if ($sent !== '' && hash_equals((string) $key, $sent)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Invalid API key.'], 401);
    }
}
