# 🏗️ Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 🚀 Stage 2: Production Run
FROM nginx:alpine

# Copiar el build de React al directorio de NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración básica de NGINX para SPA (Single Page Application)
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
