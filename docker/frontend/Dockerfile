# Etapa 1: Construcción
FROM node:20-alpine AS build-stage
WORKDIR /app
# Copia el código fuente del frontend (ajusta la ruta si es necesario)
COPY ./app/frontend/ .
# Instala las dependencias y construye los archivos estáticos (esto generará la carpeta "dist")
RUN npm install && npm run build

# Etapa 2: Producción
FROM nginx:alpine AS production-stage
# Copia los archivos estáticos generados en la etapa anterior al directorio que Nginx sirve por defecto
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Expone el puerto 80, donde Nginx escucha
EXPOSE 80
# Ejecuta Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
