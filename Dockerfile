# Build Stage
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
# Set build-time env for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Production Stage
FROM nginx:stable-alpine AS production-stage

# Copy the build output to Nginx default static folder
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy custom Nginx config for SPA support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
