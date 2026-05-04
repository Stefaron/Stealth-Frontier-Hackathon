# CLAUDE.md — Stealth Project Context

> Single source of truth for any AI assistant (Claude Code, Cursor, etc.) working on this project. Read fully before suggesting code, architecture, or features.

---

## 1. Project Identity

**Name:** Stealth
**Tagline:** Private payroll with built-in compliance for DAO auditors.
**One-liner:** Where DAO treasuries stay private, and audits stay possible.

**Built for:** Umbra Side Track — Solana Frontier Hackathon 2026
**Submission deadline:** ~26 May 2026
**Prize pool:** $10,000 USDC (1st: $5K, 2nd: $3K, 3rd: $2K)

---

## 2. The Problem We Solve

DAOs on Solana face an unsolved trilemma:

| Current Option A: Realms / Squads | Current Option B: Tornado-style mixers |
|-----------------------------------|----------------------------------------|
| Audit-friendly | Not auditable |
| Every contributor's salary public forever | Total privacy |
| Burn rate, runway, vendor invoices all leak | Regulatory risk (sanctions, AML) |
| Talent retention problem | Cannot accept institutional capital |

**No serious DAO wants 100% public OR 100% anonymous.** They need: **private by default, auditable on demand.**

That is exactly Umbra's value proposition — and Stealth is the application layer that makes it usable for real DAOs.

---

## 3. Our Solution: 3-Sided Platform

### 3.1 DAO Treasurer (the payer)
Pays contributors privately — without exposing individual salaries, vendor invoices, or internal patterns to competitors and the public.

### 3.2 Contributor (the payee)
Receives USDC into an encrypted balance. Their financial life is no longer public on Solscan.

### 3.3 Auditor (third-party firm)
Gets a role-based dashboard granted by the DAO. Generates industry-standard audit reports **without** the DAO needing to expose all data publicly.

---

## 4. Why This Wins the Hackathon

1. **Uses every primitive Umbra offers** (Encrypted Balances, Mixer Pool, X25519 Compliance Grants, Mixer Pool Viewing Keys) — perfect SDK showcase.
2. **Cannot be built without Umbra** — competitors like Request Finance, Toku, Streamflow have public transactions.
3. **Aligns 100% with Umbra's positioning** — "compliance-ready privacy," not Tornado-style absolute privacy.
4. **Clear revenue path for Umbra** — B2B DAO subscriptions + per-transaction SDK fees.
5. **Demo-able with a real pilot DAO** — far more credible than mockups.

---

## 5. Core User Flows

### 5.1 DAO Treasurer Flow
1. Connect wallet → register with Umbra SDK (X25519 key derivation from `signMessage`)
2. Upload CSV or pick contributors from address book
3. Bulk private send via Umbra Mixer Pool (UTXOs, unlinkable)
4. Tag transactions (engineering, marketing, ops)
5. Manage auditor access — grant scope, set time bounds, revoke anytime

### 5.2 Contributor Flow (Minimal — by design)
1. Connect wallet → register with Umbra SDK
2. Scan for pending UTXOs → Claim to encrypted balance
3. View encrypted balance (SOL + USDC)
4. Withdraw to public wallet anytime

### 5.3 Auditor Flow (The differentiator)
1. Login with auditor wallet
2. See list of DAOs that granted access
3. Open DAO's audit dashboard: aggregate metrics, sanctions screening, per-category drilldown
4. Export audit report (PDF, CSV, optional on-chain attestation v2)

---

## 6. MVP Scope — STRICT Boundaries

### In scope (3-week MVP)
- Next.js 14 + TypeScript + Tailwind
- Umbra SDK: deposit, withdraw, mixer transfers, X25519 compliance grants
- Contributor: scan UTXOs, claim, view balance, withdraw
- Treasurer: bulk pay via CSV, transaction tagging
- Auditor: compliance grant dashboard, report export

### OUT of scope (v2+)
- Contributor proof-of-income
- On-chain attestation by auditor
- Mobile native app
- Recurring payments / scheduled disbursement
- Tax calculation per jurisdiction
- On/off-ramp integration
- Cross-chain support
- Subscription tiers

---

## 7. Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Frontend | Next.js 14 (App Router) | Server components for CSV, client for wallet |
| Language | TypeScript | Strict mode on |
| Styling | Tailwind CSS | No CSS-in-JS |
| Wallet adapter | `@solana/wallet-adapter-react` | Phantom, Solflare, Trust, Ledger, Torus |
| Solana SDK | `@solana/kit` | Modern TS library |
| Privacy | `@umbra-privacy/sdk` | Core SDK |
| Animations | `gsap` + `lenis` | **Must `npm install` after git pull** |
| CSV | Papaparse | Browser-side |
| Deployment | Vercel | |
| Network | Solana devnet | Mainnet after MVP |

### Do NOT add
- Redux, Zustand — React state is enough
- ORM / database — state lives on-chain + localStorage
- Auth libraries — wallet signature IS auth
- Backend frameworks — Next.js API routes only

---

## 8. Umbra SDK — Critical Knowledge

### 8.1 Program IDs
- Mainnet: `UMBRAD2ishebJTcgCLkTkNUx1v3GyoAgpTRPeWoLykh`
- Devnet: `DSuKkyqGVGgo4QtPABfxKJKygUDACbUhirnuv63mEpAJ`

### 8.2 Primitives Used

| Umbra Primitive | Used For |
|-----------------|----------|
| Encrypted Token Accounts | Contributor balances |
| Mixer Pool (UTXOs) | Unlinkable transfers DAO → contributor |
| X25519 Compliance Grants | Role-based auditor access |
| Mixer Pool Viewing Keys | Auditor query |

### 8.3 Critical SDK Rules

- **Master seed:** from `signMessage(UMBRA_MESSAGE_TO_SIGN)`. NEVER modify message — invalidates all keys.
- **Registration required** before any deposit/transfer. New wallets must register first.
- **Encrypted balance ≠ on-chain balance.** Requires decryption with master seed.
- **MPC operations have latency** — Arcium computes off-chain. Show loading, handle timeouts.
- **X25519 registration TTL:** ~180 slots on devnet. If registration TX expires, retry.

### 8.4 Withdraw Two-Step Flow (IMPORTANT)

Withdraw is NOT atomic. Two separate transactions:

1. **Queue TX** (`queueSignature`) — deducts from encrypted balance. **Committed immediately.** Cannot be reversed.
2. **Callback TX** — Arcium MPC sends SOL/USDC to recipient wallet. **Can fail independently.**

`callbackStatus` values:
- `"finalized"` — funds delivered to wallet
- `"timed-out"` or `"pruned"` — callback failed; funds deducted but not delivered. User must wait or retry. Devnet reliability is low for callbacks.
- `undefined` / pending — still processing

**UI must surface `callbackStatus` to user.** "Balance deducted but SOL not received" is expected devnet behavior, not a bug.

### 8.5 WSOL Wrapping

Umbra Mixer Pool is SPL-token only. SOL withdrawals:
- SDK auto-wraps SOL → WSOL before mixer transfer
- Callback TX unwraps WSOL → SOL via `MpcCallbackWrappedSolUnwrappingHelperAccount`
- User receives native SOL in wallet, not WSOL — this is correct behavior

### 8.6 Stale Client State Bug

After claiming new UTXOs, client-side state can be stale. If withdraw throws `Transaction simulation failed`, user needs to click Refresh to reload state, then retry.

### 8.7 Reference Docs
- https://sdk.umbraprivacy.com/quickstart
- https://sdk.umbraprivacy.com/sdk/registration
- https://sdk.umbraprivacy.com/sdk/mixer/overview
- https://sdk.umbraprivacy.com/sdk/compliance

When in doubt about SDK API shape, fetch docs — SDK released April 2026, not in training data.

---

## 9. Architecture

```
stealth-fe/
├── app/
│   ├── contributor/     — Contributor: balance, claim, withdraw
│   ├── treasurer/       — Treasurer: pay, bulk CSV
│   └── auditor/         — Auditor: compliance dashboard, report export
├── components/
│   ├── app/             — Shared app components (WalletModal, AppNav, etc.)
│   ├── contributor/
│   ├── treasurer/
│   └── auditor/
├── lib/
│   └── umbra/           — SDK wrappers: balance.ts, withdraw.ts, claim.ts, transfers.ts
├── context/
│   ├── UmbraContext.tsx  — SDK client instance
│   ├── WalletProvider.tsx — Solana wallet adapter setup
│   └── ToastContext.tsx
├── hooks/
│   └── useGsap.ts        — GSAP animation hooks (useGsapEnter, useGsapStagger, useGsapCharReveal)
└── lib/constants.ts      — SOLANA_RPC_URL, USDC_DEVNET_MINT, KNOWN_MINTS
```

No backend database. State: on-chain (Umbra) + localStorage (UTXO claim tracking).

---

## 10. Key Implementation Patterns

### 10.1 localStorage for UTXO Claim Tracking

UTXOs claimed are persisted per wallet address to survive page refresh:

```ts
const lsKey = publicKey ? `umbra_claimed_${publicKey.toBase58()}` : null;

// Load on wallet connect
useEffect(() => {
  if (!lsKey) return;
  try {
    const raw = localStorage.getItem(lsKey);
    if (raw) setClaimedIndices(new Set(JSON.parse(raw) as string[]));
  } catch { /* ignore */ }
}, [lsKey]);

// Persist after each claim
const persistClaimed = (next: Set<string>) => {
  if (!lsKey) return;
  try { localStorage.setItem(lsKey, JSON.stringify([...next])); } catch { /* ignore */ }
};
```

Key format: `umbra_claimed_<base58 wallet address>` — per-wallet, no cross-contamination.

### 10.2 Refresh Balance Pattern

Manual refresh button that re-runs `loadBalancesAndScan()` without page reload:

```tsx
<button
  onClick={loadBalancesAndScan}
  disabled={isLoadingBalances || isScanning}
  className="..."
>
  <svg className={isLoadingBalances || isScanning ? "animate-spin" : ""}>...</svg>
  {isLoadingBalances || isScanning ? "Refreshing…" : "Refresh"}
</button>
```

`loadBalancesAndScan` runs `queryBalances` and `scanClaimableUtxos` in parallel.

### 10.3 WalletModal State Architecture

Three pieces of state for modal lifecycle:
- `mounted` — controls portal render
- `closing` — prevents double-close during GSAP out animation
- `lastHovered` — **never clears** (unlike `hovered`) so right pane stays stable and "Connect Phantom" button remains clickable even after mouse leaves wallet row

```tsx
const [hovered, setHovered] = useState<string | null>(null);
const [lastHovered, setLastHovered] = useState<string | null>(null);

const handleRowEnter = (name: string) => { setHovered(name); setLastHovered(name); };
const handleRowLeave = () => setHovered(null); // lastHovered intentionally NOT cleared

// Right pane uses lastHovered, not hovered — never unmounts after first hover
const displayWallet = solanaWallets.find((w) => w.adapter.name === lastHovered);
```

**Modal close on `open` prop change:**
```tsx
useEffect(() => {
  if (open) {
    setMounted(true);
    setClosing(false);
  } else if (mounted && !closing) {
    triggerClose(); // Must handle open=false → run close animation
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open]);
```

Without `else if` branch: modal stays visible when parent calls `setModalOpen(false)`, making connect button appear broken.

### 10.4 Compliance Grants Storage

Compliance grants stored in localStorage key `stealth:compliance-grants`. Works within same browser only. Across different browsers requires a backend (Vercel KV or Supabase free tier — acceptable v2 work).

---

## 11. Known Issues & Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| `Transaction simulation failed` on withdraw | Stale client state after recent claim | Click Refresh → retry withdraw |
| Callback `timed-out` / `pruned` | Arcium MPC devnet reliability | Wait 2-5 min; same 180-slot TTL; check wallet manually |
| `Cannot find module 'gsap'` after git pull | `gsap`/`lenis` in package.json but `node_modules` not updated | `npm install` in `stealth-fe/` |
| Registration TX expires | 180-slot Solana devnet TTL | Retry registration; happens rarely |
| Balance shows MXE encrypted | Umbra balance in MXE mode, not Shared mode | This is encrypted state — use SDK to decrypt |

---

## 12. Code Style Conventions

- **TypeScript strict mode.** No `any` unless documented why.
- **No comments** unless WHY is non-obvious. No "what" comments — code is self-documenting.
- **No animation libraries beyond gsap/lenis** (already installed). Tailwind transitions for simple cases.
- **No state management libraries** — React state + context is sufficient.
- **No console.log in production code.**
- **Wallet signature IS auth** — no auth libraries needed.

---

## 13. Demo Script (60-second pitch)

> "DAOs on Solana have a strange problem. They want to be crypto-native, but their treasuries are public — competitors see burn rate, contributors see each other's salaries. The solution isn't Tornado Cash — that makes them un-auditable.
>
> **Stealth: private payroll for DAOs, with a compliance dashboard for their auditors.**
>
> [Treasurer view] Mira pays 23 contributors at once. Private. One click.
>
> [Auditor dashboard] Hacken Auditing Firm logs in — sees Q1 aggregate report. Total disbursement, category breakdown, sanctions screening. No individual salaries leaked.
>
> [Drill-down] Auditor needs engineering category detail? DAO grants scoped access. 12 transactions, recipients still encrypted. Enough for an audit, not enough to doxx.
>
> Built on Umbra. Private by default. Auditable on demand."

---

## 14. Critical Reminders for AI Assistants

1. **Always check Umbra SDK docs before guessing API shape.** SDK released April 2026 — not in training data.
2. **Never invent SDK methods.** Assume nothing, verify everything.
3. **Auditor flow is most important UX.** Most teams stop at treasurer. Auditor dashboard wins.
4. **Stay on devnet.** Mainnet is not the goal — working devnet demo is.
5. **Push back on out-of-scope features** listed in Section 6.
6. **Demos > features.** If it doesn't show in demo, deprioritize.
7. **Wallet UX matters.** Users won't retry if popup fails. Handle errors and show clear states.
8. **Privacy is the product.** Never log sensitive data, never embed viewing keys in URLs, never persist master seeds.

---

## 15. Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Pivoted from "consumer income proof" to "DAO auditor compliance" | Auditors are crypto-native, uses more Umbra primitives, clearer demo | Initial planning |
| Dropped contributor proof-of-income from MVP | Scope discipline | Initial planning |
| Devnet-first strategy | Mainnet adds risk without demo benefit | Initial planning |
| localStorage for UTXO claim tracking, keyed by wallet | Survives refresh, no backend needed, per-wallet isolation | Session 1 |
| `lastHovered` never-clears pattern in WalletModal | Prevents race condition where mouse-leave unmounts right pane before click registers | Session 1 |
| Surface `callbackStatus` in withdraw UI | Devnet MPC callbacks unreliable; users need to know queue success ≠ delivery | Session 1 |
| Manual refresh button instead of polling | Polling wastes RPC quota; user-triggered is sufficient for hackathon | Session 1 |

---

## 16. Contact

- Hackathon coordinator: Telegram @abbasshaikh01
- Umbra team: X @UmbraPrivacy or GitHub umbra-defi
- Hackathon listing: https://superteam.fun/earn/listing/umbra-side-track

---

**End of CLAUDE.md.** Read fully before any non-trivial code change.
