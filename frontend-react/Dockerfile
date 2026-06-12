FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite dev server accesible desde fuera del contenedor
CMD ["npm", "run", "dev"]
