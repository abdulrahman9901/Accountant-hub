FROM php:8.4-cli

# Pre-install pdo_mysql and zip extensions for Composer
RUN apt-get update && apt-get install -y \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo_mysql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Pre-install Composer for seamless dependency auto-installations on host volumes
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
