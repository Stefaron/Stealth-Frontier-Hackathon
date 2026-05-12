# Setup Guide

> How to get Stealth running from a fresh clone — from `git clone` to a working browser window.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Install dependencies](#install-dependencies)
- [Environment variables](#environment-variables)
- [Start the dev server](#start-the-dev-server)
- [Production build](#production-build)
- [Preview the production build](#preview-the-production-build)
- [Linting & type check](#linting--type-check)
- [Windows notes](#windows-notes)
- [Common troubleshooting](#common-troubleshooting)

---

## Prerequisites

Your environment needs:

| Tool | Recommended version | Check |
|---|---|---|
| **Node.js** | ≥ 20.x LTS | `node -v` |
| **npm** | ≥ 10.x | `npm -v` |
| **Git** | latest | `git --version` |
| **Solana wallet** | Phantom, Solflare, or Backpack | Browser extension |
| **Devnet SOL** | at least 0.1 SOL | [faucet.solana.com](https://faucet.solana.com) |
| **Pinata account** *(optional)* | free | Only needed to test the self-sovereign report feature |

> This repo is pinned to **npm** by `package-lock.json`. Don't mix yarn or pnpm into the same workspace.

---

## Install dependencies

```bash
# Clone the repository
git clone https://github.com/Stefaron/Stealth-Frontier-Hackathon.git

# Move into the frontend
cd Stealth-Frontier-Hackathon/stealth-fe

# Install
npm install
```

The first install takes 2–4 minutes because of the wallet adapters and the relatively heavy `snarkjs` + `ffjavascript` pair.

---

## Environment variables

Create a `.env.local` file inside `stealth-fe/`. These are the variables the app reads:

```env
# ─── Solana network ──────────────────────────────────────────────
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.devnet.solana.com

# ─── Umbra ────────────────────────────────────────────────────────
NEXT_PUBLIC_UMBRA_NETWORK=devnet
NEXT_PUBLIC_UMBRA_RELAYER_URL=https://relayer-dev.umbraprivacy.com
NEXT_PUBLIC_UMBRA_INDEXER_URL=https://utxo-indexer.api-devnet.umbraprivacy.com

# ─── Pinata (for the self-sovereign IPFS report) ─────────────────
# Required by /api/pinata/upload and /api/pinata/list
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Default fallbacks

If a variable is missing, `lib/constants.ts` ships sensible defaults:

| Variable | Fallback |
|---|---|
| `NEXT_PUBLIC_SOLANA_NETWORK` | `"devnet"` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_SOLANA_WS_URL` | `wss://api.devnet.solana.com` |
| `NEXT_PUBLIC_UMBRA_RELAYER_URL` | `https://relayer-dev.umbraprivacy.com` |
| `NEXT_PUBLIC_UMBRA_INDEXER_URL` | `https://indexer-dev.umbraprivacy.com` |

For a basic demo (no IPFS reports), you can skip `PINATA_JWT` — everything else still works.

> **Never commit `.env.local`.** It is already in the default Next.js `.gitignore`.

---

## Start the dev server

```bash
npm run dev
```

Default port: `3000`. A successful boot prints:

```text
   ▲ Next.js 16.2.4
   - Local:    http://localhost:3000
   - Network:  http://192.168.x.x:3000
```

Open [http://localhost:3000](http://localhost:3000) in a browser that has a Solana wallet extension installed.

> **Note.** The `dev` script uses `--webpack`. This avoids the dynamic-require issue that turbopack has with `snarkjs` and `ffjavascript`. See the `turbopack.ignoreIssue` block in `next.config.ts`.

---

## Production build

```bash
npm run build
```

The build output goes to `.next/`. Next.js runs its built-in type check during the build — make sure there are no TypeScript errors before continuing.

---

## Preview the production build

```bash
npm run start
```

The production server runs on port `3000` (or the value of `PORT`). Use this for a smoke test before deploying.

For Vercel deployment: just push to the remote. Vercel runs `npm install` + `npm run build` automatically. Set every env variable in the Vercel project settings.

---

## Linting & type check

```bash
npm run lint              # ESLint via eslint-config-next
npx tsc --noEmit          # TypeScript strict, no output
```

`npm run lint` uses the flat config in `eslint.config.mjs`. `npx tsc --noEmit` runs TypeScript in strict mode — every file under `app/`, `components/`, `lib/`, `hooks/`, and `context/` must pass.

---

## Windows notes

1. **Absolute paths** — if you're on PowerShell, quote any path that contains spaces.
2. **Git CRLF** — on commit, Git will warn `LF will be replaced by CRLF`. That's safe. For consistency:
   ```powershell
   git config core.autocrlf input
   ```
3. **Path-length limit** — some transitive deps in `node_modules` have long paths. If `npm install` fails with `EPERM` or `ENOENT`, enable long paths:
   ```powershell
   # Run as Administrator
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```
4. **Antivirus / Defender** — sometimes flags `snarkjs` or `ffjavascript` as false-positives. If install is unusually slow, whitelist `stealth-fe/node_modules/`.
5. **PowerShell vs Bash** — commands in these docs are POSIX. In PowerShell, replace `&&` with `;` or run each command separately.

---

## Common troubleshooting

### `Cannot find module 'gsap'` or `Cannot find module 'lenis'`
You just pulled and `node_modules` is stale. Re-run `npm install`.

### Build fails with `Critical dependency: request of a dependency is an expression`
Already silenced via `webpack.exprContextCritical = false` in `next.config.ts`. If it still appears, turbopack is probably active — make sure you're running `next dev --webpack` (the default script).

### Wallet adapter error: `WalletNotReadyError`
The wallet extension wasn't detected yet. Reload the page once the extension is ready. In DevTools, `window.solana` (or `window.solflare`) should exist.

### Registration TX expired
Solana devnet TTL is ~180 slots. Retry registration from the banner.

### Withdraw stuck at `Queued` / `callbackStatus: "timed-out"`
Devnet Arcium MPC can be slow. `withdrawToPublic` already widens `maxSlotWindow` to 600 (~4 min) and `safetyTimeoutMs` to 360_000 (6 min wall-clock). The balance is deducted but the callback hasn't landed yet — check the wallet on [Solscan devnet](https://solscan.io/?cluster=devnet).

### `Transaction simulation failed` during withdraw
Stale client state after a recent claim. Hit the **Refresh** button in the balance card, then retry withdraw.

### Pinata 401 / 500
Make sure `PINATA_JWT` is valid and has the scopes `pinJSONToIPFS` + `data:pinList:read`. Generate a JWT at [Pinata API Keys](https://app.pinata.cloud/developers/api-keys).

### Compliance scanner: `Decrypted = 0, Failed > 0`
The MVK was derived from the wrong treasurer wallet. Re-issue the grant from the correct wallet and click **Derive from wallet ↗**.

### Compliance scanner: `Bogus = N`
The TVK is mint-specific. Change the **Mint** field in the scanner to the correct token (usually WSOL `So111…112` for demos).

---

[← Back to index](./README.md) · [Next: Features →](./FEATURES.md)
