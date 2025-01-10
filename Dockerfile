# Build aşaması
FROM node:20-alpine as builder

# Çalışma dizinini ayarla
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Kaynak kodları kopyala
COPY . .

# TypeScript'i derle ve uygulamayı build et
RUN npm run build

# Çalıştırma aşaması
FROM nginx:alpine

# Build çıktısını Nginx'in servis edeceği dizine kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx yapılandırmasını kopyala (SPA için)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80 portunu dışarı aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
