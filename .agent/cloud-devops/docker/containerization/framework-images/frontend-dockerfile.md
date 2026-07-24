# Skill: .agent/cloud-devops/docker/containerization/framework-images/frontend-dockerfile.md

## 📌 Core Philosophy & Constraints
- **Universal Node.js Frontend Base**: Single standard Dockerfile pattern for all Node.js/JS frontend frameworks (React, Vue 3, Svelte, Vite).
- **Node 25 Alpine Base**: Use lightweight `node:25-alpine` image.
- **Layer Caching**: Copy `package*.json` before running `npm install` to optimize Docker build layer caching.

## ⚡ Production Boilerplate / Standard Pattern

```dockerfile
FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Copying Source Before Package JSON**: Copying application source files before `package*.json` invalidating dependency layer cache.
- ❌ **Omitting Workdir**: Running npm commands without an explicit `WORKDIR /app`.
- ❌ **Heavy Base Images**: Using bloated OS images (Debian/Ubuntu) instead of lightweight Alpine.

## 🔍 Verification & Testing
- **Container Build Check**: Run `docker build -t frontend-app .` asserting `npm install` caches properly across code changes.
