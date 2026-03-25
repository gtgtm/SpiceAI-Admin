<?php

use Illuminate\Support\Facades\Route;

// Serve static files directly if they exist (needed for php artisan serve)
Route::get('/static/{path}', function (string $path) {
    $filePath = public_path('static/' . $path);
    if (file_exists($filePath)) {
        $mime = match(pathinfo($path, PATHINFO_EXTENSION)) {
            'js' => 'application/javascript',
            'css' => 'text/css',
            'map' => 'application/json',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'txt' => 'text/plain',
            default => 'application/octet-stream',
        };
        return response()->file($filePath, ['Content-Type' => $mime]);
    }
    abort(404);
})->where('path', '.*');

// Serve React SPA for all other non-API routes
Route::fallback(function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath, ['Content-Type' => 'text/html']);
    }
    return response('Admin panel not built. Run: cd frontend && npm run build', 404);
});
