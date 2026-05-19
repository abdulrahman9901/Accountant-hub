FROM ubuntu:24.04

# Avoid interactive prompts during apt installations
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies, PHP 8.4, MySQL, Nginx, Node.js, and Composer
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    software-properties-common \
    && add-apt-repository ppa:ondrej/php -y \
    && apt-get update && apt-get install -y \
    nginx \
    mysql-server \
    php8.4-fpm \
    php8.4-mysql \
    php8.4-xml \
    php8.4-mbstring \
    php8.4-curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy the entire project
COPY . /app

# 1. Build the frontend
WORKDIR /app/frontend
# Configure frontend to point to Nginx proxy
ENV VITE_API_URL="/api"
RUN npm install
RUN npm run build
# Move the built React app into Laravel's public directory
RUN cp -r dist/* /app/backend/public/

# 2. Setup the backend
WORKDIR /app/backend
# Copy environment file (since .env is gitignored and won't be on Hugging Face)
RUN cp .env.example .env
# Append DB settings for MySQL connection (overriding defaults)
RUN echo "\nDB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_DATABASE=accountant_hub\nDB_USERNAME=root\nDB_PASSWORD=root\nDB_PERSISTENT=true" >> .env
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader
RUN php artisan key:generate || true
RUN chmod -R 775 storage bootstrap/cache
RUN chown -R www-data:www-data /app/backend

# 3. Setup Nginx
# Remove default config and add our custom one
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/sites-available/accountant_hub
RUN ln -s /etc/nginx/sites-available/accountant_hub /etc/nginx/sites-enabled/

# 4. Setup entrypoint
WORKDIR /app
RUN chmod +x start.sh

# Expose port required by Hugging Face Spaces
EXPOSE 7860

# Start the services
CMD ["/app/start.sh"]
