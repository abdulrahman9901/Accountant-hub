FROM php:8.4-cli

# Pre-install pdo_mysql for zero-latency runtime startup
RUN apt-get update && apt-get install -y \
    libzip-dev \
    unzip \
    && docker-php-ext-install pdo_mysql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
