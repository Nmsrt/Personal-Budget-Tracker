# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm install       # install dependencies
npm run dev       # dev server at http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

There is no test suite, linter, or TypeScript — plain JS/JSX with React 18 + Vite.

## Architecture

Personal budget tracker (PHP currency). Three-page SPA with no router — `App.jsx` switches between `pages/Dashboard.jsx`, `pages/Expenses.jsx`, and `pages/Weekly.jsx` via local `page` state.

### Single state object + dual persistence

All app data lives in one object `{ accounts, expenses, weeks }` (shape defined by `INIT_DATA` in `src/utils/constants.js`), owned entirely by the `useBudget` hook (`src/hooks/useBudget.js`). Every mutation goes through its `update(fn)` callback with an immutable updater. There is no other state store.

Persistence writes the **whole object** on every change:

1. Always to localStorage under key `budgetapp_v3`.
2. If Supabase is configured, also upserted as a single JSONB row (`id = 1`) in the `budget` table (`src/supabase/config.js`; one-time setup SQL in `supabase/schema.sql`).

Supabase is optional: `hasSupabaseConfig` (exported from `supabase/config.js`, single source of truth) is true only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set and not the `.env.example` placeholders. With no config the app runs purely on localStorage and the badge shows "Offline" (`syncStatus` is only `'online'` or `'offline'`). Env vars come from `.env` (see `.env.example`); changing them requires a dev-server restart.

Sync loop guard: incoming Supabase data (initial read and realtime `postgres_changes` events — including echoes of this client's own upserts) sets the `skipNextWrite` ref in `useBudget` so the persist effect doesn't write remote updates back to Supabase. The `synced` flag blocks all writes until the initial Supabase read (or the no-config check) completes. Keep both invariants if touching the sync logic.

### Denormalized account balances

Account balances are stored, not derived. Adding an expense deducts `amount` from the selected account; deleting an expense refunds it (see `addExpense` / `deleteExpense` in `App.jsx`). Any new expense mutation must update `expenses` and `accounts` together in the same `update` call, or balances drift.

### Weeks

Weekly budgets are keyed by the ISO date of the week's **Monday** (`getWeekKey` in `src/utils/helpers.js`). `data.weeks[weekKey].allowance` holds the allowance; weekly spend is derived by filtering expenses whose date maps to the same key.

### Other conventions

- Modals are controlled components rendered at the `App.jsx` level, built on the generic `components/Modal.jsx`.
- Styling is a single global stylesheet (`src/styles/global.css`); no CSS modules or framework.
- Money is formatted with `fmt` in `helpers.js` (en-PH, PHP).
- Export/import is a full-object JSON dump/restore; imported JSON is only validated for `accounts` and `expenses` keys.
