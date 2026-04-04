<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Fix path resolution for subdirectory install at /SpiceAI-Admin
// Without this, Laravel receives "SpiceAI-Admin/api/login" instead of "/api/login"
if (isset($_SERVER['REQUEST_URI']) && str_starts_with($_SERVER['REQUEST_URI'], '/SpiceAI-Admin')) {
    $_SERVER['SCRIPT_NAME'] = '/SpiceAI-Admin/index.php';
    $_SERVER['PHP_SELF']    = '/SpiceAI-Admin/index.php';
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
