#!/bin/bash
# Build script for GoDaddy shared hosting deployment
# Run this locally, then upload the generated files

set -e

echo "=== Step 1: Build React frontend ==="
cd frontend
npm run build
cd ..

echo "=== Step 2: Copy React build into Laravel public/ ==="
# Remove old React files from public (keep Laravel files)
rm -rf public/static public/asset-manifest.json public/manifest.json public/robots.txt 2>/dev/null

# Copy React build output into Laravel's public folder
cp -r frontend/build/static public/static
cp frontend/build/index.html public/index.html
cp frontend/build/asset-manifest.json public/ 2>/dev/null || true
cp frontend/build/manifest.json public/ 2>/dev/null || true
cp frontend/build/robots.txt public/ 2>/dev/null || true

echo "=== Step 3: Install production PHP dependencies ==="
composer install --no-dev --optimize-autoloader

echo "=== Step 4: Clear and cache config ==="
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo ""
echo "=== BUILD COMPLETE ==="
echo ""
echo "Now upload to GoDaddy:"
echo "1. Upload everything EXCEPT /frontend, /node_modules, /.git to: ~/adminpanel/"
echo "2. Upload contents of public/ to: ~/public_html/admin/"
echo "3. Edit public_html/admin/index.php — change paths (see deploy-index.php)"
echo "4. Create MySQL database via cPanel and update .env"
echo "5. SSH or cPanel Terminal: cd ~/adminpanel && php artisan migrate --seed"
echo ""
