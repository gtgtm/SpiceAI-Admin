#!/bin/bash
set -e

# Generate key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Cache config and routes
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Seed only if users table is empty (first deploy)
php artisan db:seed --force 2>/dev/null || true

# Fix permissions
chown -R www-data:www-data storage bootstrap/cache

# Start Apache
apache2-foreground
