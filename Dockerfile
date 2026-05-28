# --- Etapa 1: Construcción del Frontend ---
FROM node:20 AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Etapa 2: Entorno de PHP ---
FROM php:8.2-fpm-alpine

# Instalar dependencias del sistema necesarias para PostgreSQL y Laravel
RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    postgresql-dev \
    nginx

# Instalar extensiones de PHP requeridas
RUN docker-php-ext-install pdo pdo_pgsql gd zip

# Instalar Composer desde su imagen oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos del proyecto
COPY . .

# Copiar los activos compilados (CSS/JS) desde la Etapa 1
COPY --from=build-frontend /app/public/build ./public/build

# Instalar dependencias de PHP (sin desarrollo para optimizar espacio)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Asignar permisos necesarios
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Exponer el puerto que usará el servidor
EXPOSE 8080

# Comando para ejecutar las migraciones (reinicia tablas) y levantar el servidor
CMD php artisan migrate:fresh --force && php artisan serve --host=0.0.0.0 --port=8080