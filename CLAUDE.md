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

Personal budget tracker (PHP currency). Four-page SPA with no router — `App.jsx` switches between `pages/Dashboard.jsx` (default), `pages/Accounts.jsx`, `pages/Expenses.jsx`, and `pages/Settings.jsx` via local `page` state. Nav order comes from the `NAV` array in `components/Layout.jsx`.

### Settings (per-device, not synced)

`useSettings` (`src/hooks/useSettings.js`) holds `{ theme, hideBalances }` (unknown keys are dropped on load) in localStorage key `budgetapp_settings`. Separate from the budget object on purpose: never synced to Supabase or included in export/import. `theme` sets `data-theme` on `<html>`; an inline script in `index.html` applies it before first paint, so keep that key/shape in sync.

### Single state object + dual persistence

All app data lives in one object `{ accounts, expenses, weeks }` (shape defined by `INIT_DATA` in `src/utils/constants.js`), owned entirely by the `useBudget` hook (`src/hooks/useBudget.js`). Every mutation goes through its `update(fn)` callback with an immutable updater. There is no other state store.

Persistence writes the **whole object** on every change:

1. Always to localStorage under key `budgetapp_v3`.
2. If Supabase is configured, also upserted as a single JSONB row (`id = 1`) in the `budget` table (`src/supabase/config.js`; one-time setup SQL in `supabase/schema.sql`).

Supabase is optional: `hasSupabaseConfig` (exported from `supabase/config.js`, single source of truth) is true only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set and not the `.env.example` placeholders. With no config the app runs purely on localStorage and the badge shows "Offline" (`syncStatus` is only `'online'` or `'offline'`). Settings has a Reconnect button: `reconnect()` bumps `connId`, which re-runs the subscribe effect (fresh read + new uniquely-named realtime channel). Unconfirmed local changes are tracked by `dirty` (persisted in localStorage key `budgetapp_dirty` so it survives reloads; set when a save starts, cleared only when the newest save — `saveSeq` — succeeds). While dirty, incoming remote data (initial read or realtime) never replaces local data; local is pushed instead, including when the realtime channel rejoins. Env vars come from `.env` (see `.env.example`); changing them requires a dev-server restart.

Sync invariants in `useBudget`: (1) the persist effect skips `data === persisted.current`, and incoming remote data is stored there before `setData`, so remote updates (including echoes of this client's own upserts) aren't written back; (2) nothing is written to Supabase until an initial read has succeeded (`remoteReady`) — edits before that are local-only and marked dirty, and the 15s timeout/errors only unblock the UI; (3) remote data is ignored while one of our saves is in flight (`inflight`). `subscribeToSupabase` reports the initial read (`onRead`/`onReadError`), realtime changes (`onChange`) and channel status (`onStatus`, which can recover to true after a timeout) through separate callbacks; the first of read or realtime change per connection is the initial snapshot. Keep these if touching the sync logic.

### Denormalized account balances

Account balances are stored, not derived. Adding an expense deducts `amount` from the selected account; deleting an expense refunds it (see `addExpense` / `deleteExpense` in `App.jsx`). Any new expense mutation must update `expenses` and `accounts` together in the same `update` call, or balances drift.

### Account types

Each account has `type`: `'cash'` (Physical Cash — on-hand, storage), `'bank'` (Traditional Bank) or `'wallet'` (Digital Wallet); list and labels in `ACCOUNT_TYPES` (`constants.js`). Older accounts may lack it — always read it through `accType(acc)` (`helpers.js`), which infers from the name; saving in `AccountModal` writes it explicitly. The Dashboard shows a Summary with one row per type (total and share, neutral `account-row--plain` styling; rows open the Accounts page); the Accounts page groups every account by type, rendering rows through `components/AccountList.jsx`.

### Months

Spending is summarized per calendar month, keyed `YYYY-MM` (`monthKey` / `shiftMonth` / `monthLabel` in `src/utils/helpers.js`). The Expenses page is scoped to one month (navigator + month-over-month trend; search and category chips filter within it); the Dashboard category card and the account sheet use the current month. `data.weeks` (per-week allowances from a removed weekly-budget feature) stays in the data shape so stored data and backups keep round-tripping — nothing reads it.

### Other conventions

- Modals are controlled components rendered at the `App.jsx` level, built on the generic `components/Modal.jsx`.
- Never set `overflow` on `html`/`body` (iOS page-scroll lockups); `.app` uses `overflow-x: clip`. `Modal.jsx` blocks page scroll by cancelling wheel/touchmove on the backdrop (non-passive listeners) plus `overscroll-behavior: contain` on `.modal-box`.
- Styling is a single global stylesheet (`src/styles/global.css`); no CSS modules or framework. Brand is neon green (`--brand*`): neon fills take dark `--on-brand` text, and `--brand-deep` is the readable text shade. Display font is Space Grotesk. All colors are tokens on `:root`; the dark palette is defined twice (under `prefers-color-scheme: dark` and under `[data-theme="dark"]`) and both blocks must stay identical. Use tokens, not hex literals, except on always-dark surfaces (sidebar, mobile top bar, toast).
- Mobile (≤680px) is an iOS PWA target: `viewport-fit=cover` + `black-translucent` status bar (page draws behind the status bar/Dynamic Island; iOS 26 ignores the style and tints its status-bar edge effect with the `html` background, which is `--bg-top` for that reason); fixed elements pad with `env(safe-area-inset-*)`. The body carries neon mint/cyan/lime glows at the top (`--bg-gradient`) that show through the frosted-glass Dashboard hero; `theme-color` is set by `useSettings` to `--bg-top` per effective theme, so keep `THEME_COLOR` there in sync with `--bg-top` in CSS. Form controls must stay ≥16px on mobile or iOS zooms on focus.
- App icons live in `public/` (`apple-touch-icon.png` 180px for iOS, `icon-192/512.png` for `manifest.webmanifest`), generated from the root `Icon.png` with its black rounded corners filled green and 16px trimmed per side — iOS masks corners itself and doesn't support transparency.
- Modals never autofocus a text field (the iOS keyboard would cover the sheet).
- Expense rows have no inline buttons: tapping one opens the edit `ExpenseModal`, which also holds Delete (with undo toast). Mobile adds via the `.fab`; desktop via the page-header button.
- Mobile nav is a floating frosted pill; `--nav-offset` (in `:root`) is its gap from the bottom edge and also drives `.main` bottom padding, the FAB and the toast position — change them together through that variable.
- Account rows (Accounts page) open `AccountDetailModal` (edit/delete live in its header via `Modal`'s `actions` prop). `settings.hideBalances` masks every money figure on the Dashboard, in that sheet, and the account balances in `ExpenseModal` (use `MASK` from `helpers.js`).
- Money is formatted with `fmt` in `helpers.js` (en-PH, PHP).
- Export/import is a full-object JSON dump/restore; imported JSON is only validated for `accounts` and `expenses` keys.
