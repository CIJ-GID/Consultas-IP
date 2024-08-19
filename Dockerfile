# Etapa 1: Construcción de la aplicación
FROM node:14 AS build

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Etapa 2: Configuración de Nginx
FROM nginx:latest

# Elimina el archivo de configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copia los archivos construidos al servidor Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expone el puerto 80 para el servidor web
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
