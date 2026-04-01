## 2024-05-15 - React Component Re-renders in Playground
**Learning:** Found that large child components (DataTable, ShoppingCart, etc.) in `src/pages/Playground.jsx` were re-rendering unnecessarily whenever parent state (like the active `view`) changed, because handler functions were recreated on every render.
**Action:** Applied `React.memo` to child components and wrapped parent handler functions in `useCallback` (using functional state updates to keep dependency arrays empty). This prevents an estimated 10-20ms of render time per component on unrelated state changes.

## 2024-05-18 - Unbounded Concurrency in Cron Jobs
**Learning:** Found that backend cron jobs in `backend/utils/cronJobs.js` mapped large arrays of `users` and `teams` to `emailService.send...Reminder` using an unbounded `Promise.all`. While highly concurrent, running I/O operations (like SMTP connections) unbound against a potentially large database result set risks massive memory spikes, SMTP rate limits, or overwhelming the connection pool.
**Action:** Replaced unbounded `Promise.all` mapping over arrays with a batching approach inside a `for` loop (using `Array.prototype.slice(i, i + CHUNK_SIZE)` and `Promise.all` on each chunk). This balances execution speed while establishing a stable resource ceiling.
