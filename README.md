# Budget Tracker v2

A clean personal finance tracker — white UI, green & black accents, friendly typography.
Works offline (localStorage) out of the box. Optionally syncs to Supabase in real time.

---

## ✅ Step-by-Step Setup

### Step 1 — Install Node.js (if you haven't already)

1. Go to https://nodejs.org
2. Download the **LTS** version and install it
3. To confirm it works, open a terminal and run:
   ```
   node -v
   npm -v
   ```
   Both should print a version number.

---

### Step 2 — Install dependencies

1. Open a terminal (Command Prompt, PowerShell, or Terminal)
2. Navigate to this folder:
   ```
   cd path/to/budget-tracker
   ```
3. Install packages:
   ```
   npm install
   ```
   This downloads React, the Supabase client, and Vite into a `node_modules` folder.

---

### Step 3 — Run the app (offline / local mode)

```
npm run dev
```

Open your browser to **http://localhost:5173**

The app runs fully without Supabase — data is saved to your browser's localStorage.
The sync badge will show **"Local"** — that is expected and the app works perfectly this way.

---

### Step 4 — (Optional) Connect Supabase for real-time sync

Skip this if you only need local storage.

#### 4a — Create a Supabase project

1. Go to https://supabase.com and sign in (GitHub login works)
2. Click **"New project"** → give it a name and a database password
3. Choose region: **Southeast Asia (Singapore)** — best for Philippines
4. Wait a minute for the project to provision

#### 4b — Create the budget table

1. In your project, open **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Paste the contents of `supabase/schema.sql` from this repo and click **Run**

This creates a single-row `budget` table, opens access for the app, and enables
realtime updates.

#### 4c — Get your API credentials

1. Go to **Settings → API** in the left sidebar
2. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public key** (long string starting with `eyJ…`)

#### 4d — Create your .env file

1. In the `budget-tracker` folder, copy the example file:
   - On Mac/Linux: `cp .env.example .env`
   - On Windows: `copy .env.example .env`
2. Open `.env` in any text editor (Notepad, VS Code, etc.)
3. Fill in the values:

```env
VITE_SUPABASE_URL=https://your_project_ref.supabase.co
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

4. Save the file
5. Restart the dev server (`Ctrl+C` then `npm run dev` again)

The sync badge will now show **"Synced"** in green when connected.

> ⚠️ This app has no login — anyone who has your project URL **and** anon key can
> read/write the budget row. Fine for personal use; don't share the keys publicly.

---

### Step 5 — Build for production (optional deployment)

```
npm run build
```

This creates a `dist/` folder you can deploy to Vercel, Netlify, or GitHub Pages.

#### Deploy to Vercel (easiest)

1. Push the project to a GitHub repository
2. Go to https://vercel.com → New Project → import your repo
3. Add both `VITE_*` environment variables under **Settings → Environment Variables**
4. Click **Deploy** ✅

---

## Project Structure

```
budget-tracker/
├── index.html
├── vite.config.js
├── package.json
├── .env.example          ← copy this to .env and fill in your values
├── .gitignore
├── supabase/
│   └── schema.sql        ← one-time table setup (run in Supabase SQL Editor)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── supabase/
    │   └── config.js     ← Supabase init + save/subscribe helpers
    ├── hooks/
    │   └── useBudget.js  ← all state, sync logic, localStorage fallback
    ├── pages/
    │   ├── Dashboard.jsx
    │   └── Weekly.jsx
    ├── components/
    │   ├── Layout.jsx
    │   ├── Modal.jsx
    │   ├── Icon.jsx
    │   ├── AccountModal.jsx
    │   ├── ExpenseModal.jsx
    │   ├── AllowanceModal.jsx
    │   ├── TransferModal.jsx
    │   ├── ConfirmModal.jsx
    │   └── Toast.jsx
    ├── utils/
    │   ├── constants.js
    │   └── helpers.js
    └── styles/
        └── global.css
```

---

## Features

- **Dashboard** — total balance, this-week + all-time spend, spending by category, recent expenses
- **Multiple Accounts** — On-Hand, BDO, GCash, and any custom accounts
- **Transfers** — move money between accounts
- **Weekly Budget** — set a weekly allowance and track progress with a live bar
- **Expense Logging** — log with description, category, account, and date; edit or delete (with undo) any time
- **Auto-deduction** — expenses automatically reduce the selected account balance
- **Supabase Sync** — real-time sync across all your devices (optional)
- **Offline fallback** — always saves to localStorage even without Supabase
- **Export / Import** — download data as JSON, restore on any device

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
