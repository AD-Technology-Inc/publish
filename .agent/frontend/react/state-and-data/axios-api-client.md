# Skill: .agent/frontend/react/state-and-data/axios-api-client.md

## 📌 Core Philosophy & Constraints
- **Centralized Axios Instance**: Enforce unified Axios instance (`apiClient.ts`) across all React data hooks.
- **Request Cancellation**: Support `AbortController` in Axios calls for automatic cleanup in `useEffect`.
- **Global Error Interceptor**: Handle HTTP 401/403 errors centrally in response interceptors.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// src/api/apiClient.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inline `fetch()` Requests**: Calling raw `fetch('http://...')` inside React components without central configuration.
- ❌ **Uncancelled Effects**: Invoking async Axios requests inside `useEffect` without returning abort signal cleanup.
- ❌ **Hardcoded Headers**: Manually copying `Authorization: Bearer ...` headers in every component file.

## 🔍 Verification & Testing
- **MSW API Integration**: Mock HTTP calls in React Testing Library tests using Mock Service Worker.
