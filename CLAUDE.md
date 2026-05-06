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
| Umbra Codama | `@umbra-privacy/umbra-codama` v2.0.2 | Codama-generated IDL decoders for Anchor events |
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
│   ├── treasurer/
│   │   ├── page.tsx     — Treasurer dashboard
│   │   ├── pay/         — Send payments, wrap SOL → WSOL, bulk CSV
│   │   └── auditors/    — Issue/revoke compliance grants + derive MVK
│   └── auditor/
│       ├── page.tsx     — Auditor: list of received grants
│       └── [daoId]/     — Compliance scanner + report export (real Umbra data)
├── components/
│   ├── app/             — Shared app components (WalletModal, AppNav, etc.)
│   ├── contributor/
│   ├── treasurer/
│   └── auditor/
├── lib/
│   ├── umbra/           — SDK wrappers: balance.ts, withdraw.ts, claim.ts, transfers.ts
│   └── compliance/      — Compliance scanner pipeline (7 files — see Section 16)
├── context/
│   ├── UmbraContext.tsx  — SDK client instance
│   ├── WalletProvider.tsx — Solana wallet adapter setup
│   └── ToastContext.tsx
├── hooks/
│   └── useGsap.ts        — GSAP animation hooks (useGsapEnter, useGsapStagger, useGsapCharReveal)
└── lib/constants.ts      — SOLANA_RPC_URL, USDC_DEVNET_MINT, KNOWN_MINTS
```

No backend database. State: on-chain (Umbra) + localStorage (UTXO claim tracking + compliance grants).

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

Each grant now stores an optional `viewingKey` hex string (the Master Viewing Key, MVK). Treasurer derives it via the "Derive from wallet ↗" button on `/treasurer/auditors` — triggers `getMasterViewingKeyDeriver({client})()` which returns `bigint`, converted to hex and stored with the grant. The auditor page reads this from the grant record to pre-fill the scanner.

---

## 11. Known Issues & Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| `Transaction simulation failed` on withdraw | Stale client state after recent claim | Click Refresh → retry withdraw |
| Callback `timed-out` / `pruned` | Arcium MPC devnet reliability — now extended to 600 slots (~4 min) + 6 min wall-clock | Wait 2-5 min; same 180-slot TTL; check wallet manually on Solscan devnet |
| `Cannot find module 'gsap'` after git pull | `gsap`/`lenis` in package.json but `node_modules` not updated | `npm install` in `stealth-fe/` |
| Registration TX expires | 180-slot Solana devnet TTL | Retry registration; happens rarely |
| Balance shows MXE encrypted | Umbra balance in MXE mode, not Shared mode | This is encrypted state — use SDK to decrypt |
| Scanner: Indexed = 0 | Treasurer has no confirmed on-chain txs | Wait 30–60s after sending, retry |
| Scanner: Events = 0 | Devnet RPC drops old logs | Retry; persistent = RPC doesn't archive logs |
| Scanner: Decrypted = 0, Failed > 0 | MVK derived from wrong wallet | Re-issue grant with "Derive from wallet ↗" on correct Treasurer wallet |
| Scanner: Bogus = N (all decrypts invalid) | Wrong mint in scanner — TVK is per-mint | Change Mint field to match token treasurer actually sent (WSOL vs USDC) |
| Scanner: "More than 50% look invalid" | Wrong mint OR wrong MVK | Fix mint first; if still bogus, re-derive MVK on correct wallet |
| Amount shows 0.00 for small WSOL transfers | Old display code sliced frac to 2 chars — fixed in session 3 | `formatAmount` now trims trailing zeros, shows full precision |
| Wrap SOL fails "not confirmed in 30s" | Devnet congestion | Retry; need >0.01 SOL for fees |

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
| Compliance scanner reads Anchor event logs, not UtxoDataItem | Linker ciphertexts live in `Program data:` log lines, not in indexer UTXO fields | Session 2 |
| Hardcoded event discriminators (`sha256("event:<Name>")[0:8]`) | Codama exports instruction discriminators (`sha256("global:...")`), not event discriminators — must compute manually | Session 2 |
| TVK descent uses `levelIdx > startIdx` (strict `<`, not `<=`) | Off-by-one silently produces garbage TVK — hashing AT the auditor's level produces wrong key | Session 2 |
| Store MVK hex with compliance grant in localStorage | Auditor needs MVK to run scanner; passing it via URL would embed sensitive key in browser history | Session 2 |
| Next.js rewrite proxy for Umbra indexer | Avoids CORS issues when fetching from `utxo-indexer.api-devnet.umbraprivacy.com` from browser | Session 2 |
| `maxSlotWindow: 600` + `safetyTimeoutMs: 360_000` in withdraw | Default 200 slots (~80 sec) too short for devnet MPC — increased to ~4 min slot window, 6 min wall-clock | Session 2 |
| Replaced Umbra indexer REST with `getSignaturesForAddress` (Solana RPC) in `indexer.ts` | Umbra indexer uses protobuf binary responses + index-range pagination only — no per-depositor filter exists. `GET /utxo?user=...` never existed | Session 3 |
| Default scanner mint changed to WSOL (`So111...112`) | Hackathon testing uses WSOL; TVK is mint-specific so wrong mint = all-bogus decryption | Session 3 |
| `formatAmount` trims trailing zeros instead of slicing to 2 chars | 2-char slice turned 0.001 WSOL into "0.00" — unreadable for small devnet transfers | Session 3 |

---

## 16. Compliance Scanner — Deep Dive

The auditor dashboard uses a custom scanner pipeline in `lib/compliance/` that reads real on-chain data without requiring the Umbra SDK client (auditor is read-only — no wallet signing needed).

### 16.1 The 7 Files

| File | Responsibility |
|------|----------------|
| `types.ts` | Shared types: `VkLevel`, `ScanScope`, `DecryptedUtxoTransaction`, `ScanResult`, `ScanProgress` |
| `indexer.ts` | Step 1: fetch treasurer's recent tx signatures via Solana RPC `getSignaturesForAddress` (Umbra indexer has no per-depositor filter) |
| `rpc.ts` | Steps 3, 5b, 5c: JSON-RPC batch fetcher with 5-concurrent parallelism |
| `anchor-events.ts` | Step 4: decode `Program data:` log lines → `ParsedEvent[]` |
| `buffer-pda.ts` | Step 5a: derive `StealthPoolDepositInputBuffer` PDA for ETA fallback |
| `tvk.ts` | Step 6: TVK descent + Poseidon decrypt + address reassembly |
| `scanner.ts` | Orchestrator: calls all above steps, returns `ScanResult` |

### 16.2 VK / TVK Hierarchy

```
MVK (Master Viewing Key)
 └─► MintVK = Poseidon([MVK, mintLow, mintHigh])     ← 3-input, mint split into LE U128 halves
      └─► YearlyVK  = Poseidon([MintVK, year])
           └─► MonthlyVK = Poseidon([YearlyVK, month])
                └─► DailyVK  = Poseidon([MonthlyVK, day])
                     └─► HourlyVK = Poseidon([DailyVK, hour])
                          └─► MinuteVK = Poseidon([HourlyVK, minute])
                               └─► TVK (second-level) = Poseidon([MinuteVK, second])
```

**Auditor's grant level** determines WHERE in this chain they enter. Example: `"master"` level = auditor got MVK → can see all time. `"monthly"` level = auditor got MonthlyVK → can only see that month.

TVK descent is **strictly `levelIdx > startIdx`** — hashing AT the auditor's own level would produce a wrong TVK silently.

MVK derivation: `getMasterViewingKeyDeriver({ client: umbraClient })()` — zero-arg async function. Treasurer calls this on `/treasurer/auditors`, result stored as hex in the grant.

### 16.3 Anchor Event Discriminators

Umbra uses Anchor-style event discriminators: `sha256("event:<EventName>")[0:8]`. **Not** instruction discriminators (`sha256("global:...")`).

Precomputed discriminators in `anchor-events.ts`:
- **ATA** (`DepositIntoStealthPoolFromPublicBalance`): `[195,64,209,156,202,109,31,122]`  
- **Buffer** (`DepositIntoStealthPoolFromEncryptedBalance`): `[130,179,215,123,55,205,252,5]`  
- **ETA hint** (`DepositIntoStealthPoolFromEncryptedBalanceHint`): `[118,173,110,113,20,196,87,139]`

### 16.4 What Gets Decrypted

Each transaction has **linker ciphertexts** in its Anchor event logs:

| Event Type | Linkers | Plaintext layout |
|------------|---------|------------------|
| ATA | 2 ciphertexts | `[destLow, destHigh]` — recipient address halves |
| Buffer (ETA) | 3 ciphertexts | `[destLow, destHigh, amount]` — address + amount |

Decryption: Poseidon stream cipher. `decryptLinkers(linkerBytes, tvk)` → `bigint[]`. Reassemble address with `reassembleAddress(destLow, destHigh)`.

### 16.5 Wrong-Key Heuristic

No auth tag in Poseidon cipher. Wrong key produces garbage values. Heuristic:
- `destLow < 2^128 && destHigh < 2^128` (valid Solana address = 32 bytes)
- `amount < 2^64` (for ETA)

If `>50% of attempted decryptions look bogus` → surface warning to auditor. Root causes:
1. **Wrong mint** — TVK is derived per-mint; scanner Mint field must match the token actually transferred
2. MVK derived from wrong wallet or wrong VK level

### 16.6 Next.js Proxy Rewrite

`next.config.ts` rewrites `/proxy/data-indexer/:path*` → `${NEXT_PUBLIC_UMBRA_INDEXER_URL}/:path*`. **No longer used by the compliance scanner** (session 3: replaced with Solana RPC). Kept in config in case other features need the indexer. `NEXT_PUBLIC_UMBRA_INDEXER_URL` is optional.

### 16.7 Testing the Scanner

See `TESTING.md` (in repo root, one level above `stealth-fe/`) for full step-by-step walkthrough including how to get real devnet data into the auditor dashboard.

---

## 17. Contact

- Hackathon coordinator: Telegram @abbasshaikh01
- Umbra team: X @UmbraPrivacy or GitHub umbra-defi
- Hackathon listing: https://superteam.fun/earn/listing/umbra-side-track

---

**End of CLAUDE.md.** Read fully before any non-trivial code change.
