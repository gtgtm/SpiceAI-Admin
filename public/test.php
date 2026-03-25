<?php
echo "<h1>PHP is working!</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Script Path: " . __FILE__ . "</p>";
echo "<p>Parent dir: " . realpath(__DIR__ . '/..') . "</p>";

// Check if vendor exists
$base = realpath(__DIR__ . '/..');
echo "<p>vendor/ exists: " . (is_dir($base . '/vendor') ? 'YES' : 'NO') . "</p>";
echo "<p>.env exists: " . (file_exists($base . '/.env') ? 'YES' : 'NO') . "</p>";
echo "<p>artisan exists: " . (file_exists($base . '/artisan') ? 'YES' : 'NO') . "</p>";
