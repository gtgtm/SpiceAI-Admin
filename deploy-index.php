<?php

/**
 * This is the index.php for GoDaddy shared hosting.
 * Replace public_html/admin/index.php with this file.
 *
 * Adjust the path below to match your hosting structure:
 *   ~/adminpanel/  ← Laravel app
 *   ~/public_html/admin/  ← this file + static assets
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Path from public_html/admin/ up to the Laravel app root
$laravelBase = __DIR__ . '/../../adminpanel';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $laravelBase . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $laravelBase . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $laravelBase . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
