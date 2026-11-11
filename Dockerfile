# ---- Build : Node compile le front Vite ----
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ARG VITE_SITE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime : nginx sert les fichiers statiques + proxy /api ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
