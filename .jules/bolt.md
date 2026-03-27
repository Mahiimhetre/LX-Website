## 2024-05-15 - React Component Re-renders in Playground
**Learning:** Found that large child components (DataTable, ShoppingCart, etc.) in `src/pages/Playground.jsx` were re-rendering unnecessarily whenever parent state (like the active `view`) changed, because handler functions were recreated on every render.
**Action:** Applied `React.memo` to child components and wrapped parent handler functions in `useCallback` (using functional state updates to keep dependency arrays empty). This prevents an estimated 10-20ms of render time per component on unrelated state changes.
