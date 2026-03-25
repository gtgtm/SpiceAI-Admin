<?php
/**
 * One-time setup script for shared hosting (no SSH/Terminal)
 * Upload to public_html/admin/setup.php or spiceai_admin/public/setup.php
 * Run via browser: https://yourdomain.com/admin/setup.php
 * DELETE THIS FILE AFTER SETUP!
 */

set_time_limit(300);
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Find Laravel base path
$basePath = realpath(__DIR__ . '/..');
if (!file_exists($basePath . '/artisan')) {
    // If accessed from public_html/admin/, try deploy-index.php path
    $basePath = realpath(__DIR__ . '/../../spiceai_admin');
}

if (!$basePath || !file_exists($basePath . '/artisan')) {
    die('<h2>Error: Cannot find Laravel installation. Check paths.</h2><p>Looked in: ' . __DIR__ . '/..</p>');
}

echo "<html><head><title>SpiceAI Admin Setup</title><style>
body { font-family: monospace; background: #1a1a2e; color: #0f0; padding: 20px; }
h2 { color: #fff; } .ok { color: #0f0; } .err { color: #f00; } .warn { color: #ff0; }
pre { background: #000; padding: 10px; border-radius: 5px; overflow-x: auto; }
</style></head><body>";
echo "<h2>SpiceAI Admin Panel — Server Setup</h2>";
echo "<p>Laravel path: <code>$basePath</code></p><pre>";

// Step 1: Check PHP version
$phpVer = phpversion();
echo "PHP Version: $phpVer\n";
if (version_compare($phpVer, '8.2', '<')) {
    echo "<span class='err'>ERROR: PHP 8.2+ required. Current: $phpVer</span>\n";
    echo "Go to cPanel → Select PHP Version → change to 8.2+\n";
    die("</pre></body></html>");
}
echo "<span class='ok'>✓ PHP version OK</span>\n\n";

// Step 2: Check required extensions
$required = ['pdo_mysql', 'mbstring', 'openssl', 'tokenizer', 'json', 'ctype'];
echo "Checking PHP extensions...\n";
foreach ($required as $ext) {
    if (extension_loaded($ext)) {
        echo "  <span class='ok'>✓ $ext</span>\n";
    } else {
        echo "  <span class='err'>✗ $ext MISSING — enable in cPanel → Select PHP Version</span>\n";
    }
}
echo "\n";

// Step 3: Check .env exists
if (file_exists($basePath . '/.env')) {
    echo "<span class='ok'>✓ .env file found</span>\n";
} else {
    echo "<span class='warn'>⚠ .env not found — copying .env.example</span>\n";
    if (file_exists($basePath . '/.env.example')) {
        copy($basePath . '/.env.example', $basePath . '/.env');
        echo "<span class='ok'>✓ .env.example copied to .env — edit it with your DB credentials!</span>\n";
    } else {
        echo "<span class='err'>✗ .env.example not found either!</span>\n";
    }
}
echo "\n";

// Step 4: Check vendor directory
if (file_exists($basePath . '/vendor/autoload.php')) {
    echo "<span class='ok'>✓ vendor/ directory found (dependencies installed)</span>\n\n";
} else {
    echo "<span class='err'>✗ vendor/ directory NOT found!</span>\n";
    echo "<span class='warn'>You need to run 'composer install' locally and upload the vendor/ folder.</span>\n";
    echo "On your Mac:\n";
    echo "  cd AdminPanel\n";
    echo "  composer install --no-dev --optimize-autoloader\n";
    echo "  Then upload the entire vendor/ folder to ~/spiceai_admin/vendor/\n\n";
    die("</pre><p class='err'>Fix vendor/ first, then reload this page.</p></body></html>");
}

// Boot Laravel
require $basePath . '/vendor/autoload.php';
$app = require_once $basePath . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Step 5: Test database connection
echo "Testing database connection...\n";
try {
    $pdo = DB::connection()->getPdo();
    echo "<span class='ok'>✓ Database connected: " . DB::connection()->getDatabaseName() . "</span>\n\n";
} catch (Exception $e) {
    echo "<span class='err'>✗ Database connection FAILED</span>\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    echo "<span class='warn'>Fix your .env DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD</span>\n";
    echo "Then reload this page.\n";
    die("</pre></body></html>");
}

// Step 6: Check if action requested
$action = $_GET['action'] ?? '';

if ($action === 'migrate') {
    echo "Running migrations...\n";
    try {
        Artisan::call('migrate', ['--force' => true]);
        echo Artisan::output();
        echo "<span class='ok'>✓ Migrations complete!</span>\n\n";
    } catch (Exception $e) {
        echo "<span class='err'>Migration error: " . $e->getMessage() . "</span>\n\n";
    }
} elseif ($action === 'seed') {
    echo "Running database seeder...\n";
    try {
        Artisan::call('db:seed', ['--force' => true]);
        echo Artisan::output();
        echo "<span class='ok'>✓ Seeding complete!</span>\n\n";
    } catch (Exception $e) {
        echo "<span class='err'>Seed error: " . $e->getMessage() . "</span>\n\n";
    }
} elseif ($action === 'migrate-seed') {
    echo "Running migrations + seed...\n";
    try {
        Artisan::call('migrate', ['--force' => true]);
        echo Artisan::output();
        echo "<span class='ok'>✓ Migrations complete!</span>\n\n";
        Artisan::call('db:seed', ['--force' => true]);
        echo Artisan::output();
        echo "<span class='ok'>✓ Seeding complete!</span>\n\n";
    } catch (Exception $e) {
        echo "<span class='err'>Error: " . $e->getMessage() . "</span>\n\n";
    }
} elseif ($action === 'cache') {
    echo "Caching config and routes...\n";
    try {
        Artisan::call('config:cache');
        echo Artisan::output();
        Artisan::call('route:cache');
        echo Artisan::output();
        echo "<span class='ok'>✓ Cache complete!</span>\n\n";
    } catch (Exception $e) {
        echo "<span class='err'>Cache error: " . $e->getMessage() . "</span>\n\n";
    }
} elseif ($action === 'key') {
    echo "Generating app key...\n";
    try {
        Artisan::call('key:generate', ['--force' => true]);
        echo Artisan::output();
        echo "<span class='ok'>✓ App key generated!</span>\n\n";
    } catch (Exception $e) {
        echo "<span class='err'>Key error: " . $e->getMessage() . "</span>\n\n";
    }
} elseif ($action === 'storage-link') {
    echo "Creating storage link...\n";
    try {
        Artisan::call('storage:link');
        echo Artisan::output();
        echo "<span class='ok'>✓ Storage linked!</span>\n\n";
    } catch (Exception $e) {
        echo "<span class='err'>Error: " . $e->getMessage() . "</span>\n\n";
    }
} else {
    // Show status + action buttons
    echo "--- DATABASE TABLES ---\n";
    try {
        $tables = DB::select('SHOW TABLES');
        if (count($tables) === 0) {
            echo "<span class='warn'>No tables found — run migrate first</span>\n";
        } else {
            foreach ($tables as $table) {
                $name = array_values((array)$table)[0];
                $count = DB::table($name)->count();
                echo "  $name ($count rows)\n";
            }
        }
    } catch (Exception $e) {
        echo "<span class='warn'>Could not list tables</span>\n";
    }
}

echo "</pre>";
echo "<h2>Actions</h2>";
echo "<p>Run these in order:</p>";
echo "<p>";
echo "<a href='?action=key' style='color:#0ff;margin-right:20px;'>1. Generate App Key</a>";
echo "<a href='?action=migrate-seed' style='color:#0ff;margin-right:20px;'>2. Migrate + Seed Database</a>";
echo "<a href='?action=cache' style='color:#0ff;margin-right:20px;'>3. Cache Config</a>";
echo "<a href='?action=storage-link' style='color:#0ff;margin-right:20px;'>4. Storage Link</a>";
echo "</p>";
echo "<p style='color:#f00;margin-top:30px;'><strong>⚠ DELETE THIS FILE (setup.php) AFTER SETUP IS COMPLETE!</strong></p>";
echo "</body></html>";
