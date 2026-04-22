FROM node:22-slim

WORKDIR /app

# Instalar Angular CLI 21 globalmente
RUN npm install -g @angular/cli@21

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

# Comando limpio
CMD ["npm", "start"]
