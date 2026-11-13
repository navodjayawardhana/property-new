<?php

return [
    'connection' => env('BULK_EMAIL_QUEUE_CONNECTION', 'database'),
    'queue' => 'bulk-email',
    'batch_size' => (int) env('BULK_EMAIL_BATCH_SIZE', 20),
    'per_minute' => (int) env('BULK_EMAIL_PER_MINUTE', 30),
    'max_attempts' => (int) env('BULK_EMAIL_MAX_ATTEMPTS', 3),
    'retry_delay' => (int) env('BULK_EMAIL_RETRY_DELAY', 120),
];
