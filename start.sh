#!/bin/bash
set -e

echo "Starting MySQL..."
service mysql start

# Wait for MySQL to be fully ready
while ! mysqladmin ping -h"localhost" --silent; do
    sleep 1
done
echo "MySQL is up and running!"

# Setup database user if needed and create the database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS accountant_hub;" || mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS accountant_hub;"
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';" || true
mysql -u root -proot -e "FLUSH PRIVILEGES;" || true

# Go to backend directory
cd /app/backend

# Run migrations and seeders (force is needed in production environments)
echo "Running database migrations..."
php artisan migrate --force

echo "Seeding the database..."
php artisan db:seed --force

echo "Starting PHP-FPM..."
service php8.4-fpm start

echo "Starting Nginx..."
# Start Nginx in the foreground so the container stays alive
nginx -g "daemon off;"
