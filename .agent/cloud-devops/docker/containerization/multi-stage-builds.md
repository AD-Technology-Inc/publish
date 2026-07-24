# Skill: .agent/cloud-devops/docker/containerization/multi-stage-builds.md

## 📌 Core Philosophy & Constraints
- **Multi-Stage Build Targets**: Separate dependency compilation stages from lean production runtime images.
- **Node 25 Alpine Builder**: Use `node:25-alpine` for fast Node.js asset building and compilation stages.
- **Layer Cache Optimization**: Copy `package*.json` before copying application code for cached `npm install`.

## ⚡ Production Boilerplate / Standard Pattern

```dockerfile
# Stage 1: Build & Compile Dependencies
FROM node:25-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Single Monolithic Stage**: Including build toolchains (gcc, node_modules build artifacts) in final runtime images.
- ❌ **Copying Source Before Lockfile**: Placing `COPY . .` before `npm install` invalidating Docker layer caching.
- ❌ **Heavy Base Images**: Using full OS images like `ubuntu:latest` for simple web servers.

## 🔍 Verification & Testing
- **Image Size Inspection**: `docker image ls` verifying production image size is < 50MB for static apps / < 200MB for Python/Node apps.
