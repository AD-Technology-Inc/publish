# Skill: .agent/frontend/vue/state-and-data/axios-api-client.md

## 📌 Core Philosophy & Constraints
- **Centralized Axios Instance**: All HTTP requests MUST use a single configured Axios instance (`apiClient.ts`).
- **Request & Response Interceptors**: Automatically inject JWT Authorization headers and format API error payloads.
- **Strict Response Typing**: Wrap API call returns in TypeScript generics (`AxiosResponse<T>`).

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// src/api/apiClient.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Auth Header Injection
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: RFC 7807 Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Direct `axios.get()` Calls**: Invoking raw `axios` methods directly in Vue components without using `apiClient`.
- ❌ **Hardcoded Base URLs**: Embedding `http://localhost:8000` strings directly in component files.
- ❌ **Swallowing Rejections in Interceptors**: Catching errors without returning `Promise.reject(error)`.

## 🔍 Verification & Testing
- **MSW API Mocking**: Mock API endpoints with Mock Service Worker in Vitest to test interceptors and errors.
