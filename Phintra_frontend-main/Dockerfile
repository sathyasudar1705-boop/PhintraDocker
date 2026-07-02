# ==========================================
# STAGE 1: Build the React Application
# ==========================================
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package lock definitions
COPY package*.json ./

# Execute clean install of dependencies
RUN npm ci

# Copy all source assets
COPY . .

# Declare build-time environment arguments (Vite requires these at compile-time)
ARG VITE_API_BASE_URL
ARG VITE_MICROSOFT_CLIENT_ID
ARG VITE_MICROSOFT_TENANT_ID
ARG VITE_MICROSOFT_REDIRECT_URI

# Inject build args into environment variables
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_MICROSOFT_CLIENT_ID=${VITE_MICROSOFT_CLIENT_ID}
ENV VITE_MICROSOFT_TENANT_ID=${VITE_MICROSOFT_TENANT_ID}
ENV VITE_MICROSOFT_REDIRECT_URI=${VITE_MICROSOFT_REDIRECT_URI}

# Compile and bundle static files
RUN npm run build


# ==========================================
# STAGE 2: Serve using Nginx Web Server
# ==========================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static distribution from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

# Check container health by querying Nginx index page
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
