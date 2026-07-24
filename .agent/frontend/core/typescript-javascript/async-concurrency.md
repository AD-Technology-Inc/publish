# Skill: .agent/frontend/core/typescript-javascript/async-concurrency.md

## 📌 Core Philosophy & Constraints
- **Race Condition Prevention**: Always handle abort signals (`AbortController`) on concurrent or rapid API calls.
- **Error Propagation**: Use `try/catch/finally` with `async/await`; never leave dangling unhandled Promises.
- **Concurrent Execution**: Use `Promise.allSettled()` for independent parallel tasks to prevent single-failure cascades.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// Race-Condition Safe Async Fetcher with AbortController
export class AsyncDataFetcher {
  private activeController: AbortController | null = null;

  async fetchSearchResults<T>(query: string, fetcher: (q: string, signal: AbortSignal) => Promise<T>): Promise<T | null> {
    if (this.activeController) {
      this.activeController.abort(); // Cancel stale in-flight request
    }

    this.activeController = new AbortController();

    try {
      return await fetcher(query, this.activeController.signal);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return null; // Suppress cancelled request errors
      }
      throw err;
    } finally {
      this.activeController = null;
    }
  }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Floating Promises**: Executing async functions without `await` or `.catch()`.
- ❌ **`Promise.all` for Mixed Failure Tasks**: Failing all batch jobs when one non-critical request rejects.
- ❌ **Uncancelled Search Inputs**: Allowing slow responses from earlier keystrokes to overwrite fast new queries.

## 🔍 Verification & Testing
- **Vitest Mock Abort**: Test rapid triggers asserting previous `AbortSignal.aborted` is `true`.
