FROM php:8.3-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql zip bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js 18 (needed for React build)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first (better Docker caching)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy the full app
COPY . .

# Run composer post-install
RUN composer dump-autoload --optimize

# Build React frontend
WORKDIR /var/www/html/frontend
RUN npm install
RUN REACT_APP_API_URL=/api npm run build

# Copy React build into Laravel public/
WORKDIR /var/www/html
RUN cp -r frontend/build/static public/static 2>/dev/null || true && \
    cp frontend/build/index.html public/index.html 2>/dev/null || true && \
    cp frontend/build/asset-manifest.json public/ 2>/dev/null || true && \
    cp frontend/build/manifest.json public/ 2>/dev/null || true

# Set permissions
RUN chmod -R 777 storage bootstrap/cache

# Copy start script
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 8080

CMD ["/usr/local/bin/start.sh"]
