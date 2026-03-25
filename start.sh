#!/bin/bash
set -e

echo "=== SpiceAI Admin Panel Starting ==="
echo "PORT: ${PORT:-8080}"
echo "DB_CONNECTION: ${DB_CONNECTION:-not set}"
echo "DATABASE_URL: ${DATABASE_URL:+SET (hidden)}"
echo "APP_ENV: ${APP_ENV:-not set}"

# Generate key if missing
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Clear any cached config (important for env var changes)
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

# Try migrations (don't fail if DB not ready yet)
echo "Running migrations..."
php artisan migrate --force 2>&1 || echo "WARNING: Migration failed - DB may not be ready"

# Try seeding (only runs if tables exist and are empty)
echo "Seeding database..."
php artisan db:seed --force 2>&1 || echo "WARNING: Seeding failed or already seeded"

echo "=== Starting server on port ${PORT:-8080} ==="
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
