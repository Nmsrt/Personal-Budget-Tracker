<div align="center">

<!-- Replace with your project logo or banner -->
<img src="https://via.placeholder.com/120x120.png?text=💰" alt="Project Logo" width="120" height="120" />

<h1>Budget Tracker</h1>

<p><em>A clean personal finance tracker with a white UI and green &amp; black accents — works fully offline out of the box, with optional real-time Supabase sync across devices.</em></p>

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-optional-3fcf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![Issues](https://img.shields.io/github/issues/Nmsrt/personal-budget-tracker)](https://github.com/Nmsrt/personal-budget-tracker/issues)

<br />

[Report Bug](https://github.com/Nmsrt/personal-budget-tracker/issues/new) · [Request Feature](https://github.com/Nmsrt/personal-budget-tracker/issues/new)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Supabase Sync (Optional)](#supabase-sync-optional)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

---

## Overview

A three-page personal budget tracker (PHP currency) built with React 18 and Vite. It tracks multiple accounts, logged expenses, and weekly allowances with a clean, friendly interface. All data is saved to your browser's localStorage by default — no account or backend required. Connect a free Supabase project and the same data syncs in real time across all your devices.

---

## Features

- ✅ **Dashboard** — total balance, this-week + all-time spend, spending by category, recent expenses.
- ✅ **Multiple accounts** — On-Hand, BDO, GCash, and any custom accounts you add.
- ✅ **Transfers** — move money between accounts.
- ✅ **Weekly budget** — set a weekly allowance and track progress with a live bar.
- ✅ **Expense logging** — log with description, category, account, and date; edit or delete (with undo) any time.
- ✅ **Auto-deduction** — expenses automatically reduce the selected account balance.
- ✅ **Supabase sync** — optional real-time sync across all your devices.
- ✅ **Offline fallback** — always saves to localStorage, even without Supabase.
- ✅ **Export / Import** — download data as JSON, restore on any device.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [React 18](https://react.dev/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Styling | Custom CSS (single global stylesheet) |
| Persistence | localStorage + [Supabase](https://supabase.com/) (optional, real-time) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `>= 18.x`
- [npm](https://www.npmjs.com/) `>= 9.x`

Confirm both are installed:

```bash
node -v
npm -v
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nmsrt/personal-budget-tracker.git
   cd personal-budget-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The app should now be running at `http://localhost:5173`.

It works fully without Supabase — data is saved to your browser's localStorage and the sync badge shows **"Offline"**. That is expected, and the app works perfectly this way.

---

## Usage

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Supabase Sync (Optional)

Skip this section if local storage is all you need.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (GitHub login works).
2. Click **"New project"** → give it a name and a database password.
3. Choose region: **Southeast Asia (Singapore)** — best for the Philippines.
4. Wait a minute for the project to provision.

### 2. Create the budget table

1. In your project, open **SQL Editor** in the left sidebar.
2. Click **"New query"**.
3. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) from this repo and click **Run**.

This creates a single-row `budget` table, opens access for the app, and enables realtime updates.

### 3. Get your API credentials

1. Go to **Settings → API** in the left sidebar.
2. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public key** (long string starting with `eyJ…`)

### 4. Create your `.env` file

1. Copy the example file:
   ```bash
   # Mac/Linux
   cp .env.example .env

   # Windows
   copy .env.example .env
   ```
2. Fill in the values:
   ```env
   VITE_SUPABASE_URL=https://your_project_ref.supabase.co
   VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
   ```
3. Restart the dev server (`Ctrl+C`, then `npm run dev` again).

The sync badge will now show **"Synced"** in green when connected.

> ⚠️ This app has no login — anyone who has your project URL **and** anon key can read/write the budget row. Fine for personal use; don't share the keys publicly.

---

## Deployment

`npm run build` creates a `dist/` folder you can deploy to Vercel, Netlify, or GitHub Pages.

### Deploy to Vercel (easiest)

1. Push the project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Add both `VITE_*` environment variables under **Settings → Environment Variables**.
4. Click **Deploy** ✅

---

## Project Structure

```
personal-budget-tracker/
├── index.html
├── vite.config.js
├── package.json
├── .env.example              # copy to .env and fill in your values
├── supabase/
│   └── schema.sql            # one-time table setup (run in Supabase SQL Editor)
└── src/
    ├── main.jsx              # entry point
    ├── App.jsx               # root component + page switching
    ├── supabase/
    │   └── config.js         # Supabase init + save/subscribe helpers
    ├── hooks/
    │   └── useBudget.js      # all state, sync logic, localStorage fallback
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── Expenses.jsx
    │   └── Weekly.jsx
    ├── components/           # Layout, Modal, Toast, and modal dialogs
    ├── utils/                # constants + helpers (money/date formatting)
    └── styles/
        └── global.css        # single global stylesheet
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Sync badge shows "Offline" | Check your `.env` values — URL and anon key from **Settings → API** |
| `npm install` fails | Make sure Node.js 18+ is installed |
| App shows blank page | Open the browser console (F12) and check for errors |
| "permission denied" / policy errors in console | Re-run `supabase/schema.sql` — the RLS policy is missing |
| Changes don't appear on other devices | Realtime not enabled on the table — re-run the last line of `supabase/schema.sql` |
| Data not saving across sessions | Clear localStorage and reimport your JSON backup |

---

## License

This project is open-source and available for personal use and inspiration.

---

## Contact

**Neo Monserrat** — neo.monserrat@gmail.com

Project Link: [https://github.com/Nmsrt/personal-budget-tracker](https://github.com/Nmsrt/personal-budget-tracker)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Nmsrt">Nmsrt</a></sub>
</div>
