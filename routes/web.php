<?php

use Illuminate\Support\Facades\Route;

// Serve React SPA for all non-API, non-file routes
// On Apache (GoDaddy), .htaccess handles this, but this is needed for php artisan serve
Route::fallback(function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath, ['Content-Type' => 'text/html']);
    }
    return response('Admin panel not built. Run: cd frontend && npm run build', 404);
});
