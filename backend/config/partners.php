<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Partner API keys
    |--------------------------------------------------------------------------
    |
    | Machine-to-machine keys for the read-only `/api/external/*` endpoints that
    | external dashboards (e.g. Syncy Analytics) pull statistics from. There is
    | no user session behind these calls, so the caller identifies itself with an
    | `X-Api-Key` header instead.
    |
    | Set a comma-separated list so a key can be rotated without downtime: add
    | the new key, move consumers over, then drop the old one.
    |
    */

    'api_keys' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('PARTNER_API_KEYS', ''))
    ))),

    /*
    | Currency the money figures in the stats payload are denominated in.
    */

    'currency' => env('PARTNER_CURRENCY', 'LKR'),

];
