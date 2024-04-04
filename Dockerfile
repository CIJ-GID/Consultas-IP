# Usa una imagen oficial de Node como imagen base
FROM node:14

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Construye la aplicación
RUN npm run build

# Expone el puerto en el que se ejecuta la aplicación
EXPOSE 80

# Define la variable de entorno
ENV REACT_APP_API_URL=http://localhost:3001

# Comando para ejecutar tu aplicación
CMD ["npm", "start"]
