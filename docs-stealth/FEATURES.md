# Features

> Feature-by-feature breakdown. Each entry explains what the user does, which files are involved, and the technical notes you can't infer from the name alone.

---

## Table of Contents

- [Landing page](#landing-page)
- [Welcome — role chooser](#welcome--role-chooser)
- [Treasurer · Dashboard](#treasurer--dashboard)
- [Treasurer · Bulk Private Payout](#treasurer--bulk-private-payout)
- [Treasurer · Manage Auditors](#treasurer--manage-auditors)
- [Contributor · Encrypted Balance](#contributor--encrypted-balance)
- [Contributor · Self-Sovereign IPFS Report](#contributor--self-sovereign-ipfs-report)
- [Auditor · Company Audits](#auditor--company-audits)
- [Auditor · Treasury Report (scanner)](#auditor--treasury-report-scanner)
- [Auditor · Individual IPFS Reports](#auditor--individual-ipfs-reports)
- [Global features](#global-features)

---

## Landing page

**Route:** `/`
**Page:** `app/page.tsx`
**Components:** `components/landing/{Navbar, HeroSection, StatsSection, HowItWorksSection, ProblemSection, FeaturesSection, UmbraSection, CtaSection, Footer}.tsx`

The first impression for new visitors. A short narrative about the DAO payroll trilemma, the Stealth value proposition, and a CTA to `/welcome`.

**Technical notes:**
- Every section is a client component because they use GSAP + IntersectionObserver.
- `Reveal.tsx` is the shared wrapper for fade-up reveal.
- `Navbar.tsx` here is **distinct** from `AppNav.tsx` used in authenticated areas.

---

## Welcome — role chooser

**Route:** `/welcome`
**Page:** `app/welcome/page.tsx`

The user picks one of three roles: Treasurer, Contributor, or Auditor. The choice determines where the CTA points next.

**Flow:**
1. Open `/welcome`.
2. Use the segmented control to choose a role.
3. A detail card surfaces with the role description and feature list.
4. Click the CTA → redirected to `/treasurer`, `/contributor`, or `/auditor`.

**Technical notes:**
- The segmented control uses a sliding pill indicator — `gsap.set(ind, { x, width })` on first mount, then `gsap.to(...)` for transitions.
- The card body re-staggers every role change via the `.welcome-anim` selector.
- The footer hint `All flows happen on Solana devnet` acts as a disclaimer.

---

## Treasurer · Dashboard

**Route:** `/treasurer`
**Page:** `app/treasurer/page.tsx`

The landing surface for treasurers. Onboarding checklist + two action cards (Pay & Manage Auditors).

**Onboarding checklist** (auto-hides once everything is complete):
1. **Wallet connected** — `publicKey` from `useWallet()`.
2. **Stealth session active** — Umbra `client` from `UmbraContext`.
3. **Registered with Umbra** — `useRegistration(walletAddress)` exposes `"registered" | "pending" | "registering" | "unregistered" | ...`.

The registration status is polled every **15 seconds** via `setInterval`.

**Technical notes:**
- Each action card surfaces a halo gradient on hover (indigo for Pay, emerald for Auditors).
- The network footer pill reads `Solana devnet · Powered by Umbra SDK` + a link to the Umbra docs.

---

## Treasurer · Bulk Private Payout

**Route:** `/treasurer/pay`
**Page:** `app/treasurer/pay/page.tsx`
**Library:** `lib/umbra/transfers.ts` (`privateSend`), `lib/csv.ts` (`parseCsvPayments`)

Send many payments at once without leaking individual amounts.

**Flow:**
1. Wrap SOL → WSOL via the yellow banner. Default amount: 0.05 SOL.
2. Upload a CSV (headers: `address,amount,mint,note`). A template is available via `generateCsvTemplate()`.
3. Preview the table: address, amount, token, status (Pending).
4. Click **Send N privately** → each row is processed in sequence, status flips `Pending → Sending → Sent` or `Error`.

**Technical notes:**
- `privateSend` is retry-friendly: if the SDK throws `"already been processed"`, it counts as success (the tx is already on-chain). See `transfers.ts`.
- The `"invalid private or public key"` error is caught and translated into a user-friendly message: ask the recipient to re-register with Umbra.

---

## Treasurer · Manage Auditors

**Route:** `/treasurer/auditors`
**Page:** `app/treasurer/auditors/page.tsx`
**Library:** `lib/umbra/compliance.ts`, `lib/grants-store.ts`

Issue and revoke compliance grants to auditors.

**Issue-grant flow:**
1. Paste the auditor's wallet address.
2. (Optional) Add a label, e.g., "Payment Audit 2026".
3. Pick a VK level (master / mint / yearly / monthly / daily / hourly / minute / second).
4. Click **Issue Grant** → the wallet confirms → the grant lands in localStorage and the X25519 key exchange ships on-chain.
5. (Optional) **Derive from wallet ↗** to attach the `viewingKey` hex (MVK) to the grant — so the auditor doesn't have to derive it later.

**Revoke flow:** click the revoke button on an active grant → confirm in the wallet → the entry is removed from localStorage.

**Technical notes:**
- `issueComplianceGrant` checks four preconditions: granter exists, auditor exists, granter X25519 registered, auditor X25519 registered.
- The nonce is generated via `crypto.getRandomValues(16 bytes)` and stored as a hex string.
- Grants live in `stealth:compliance-grants` in localStorage — **per browser only**. Cross-browser sync needs a backend (v2 work).

---

## Contributor · Encrypted Balance

**Route:** `/contributor`
**Page:** `app/contributor/page.tsx`
**Library:** `lib/umbra/balance.ts`, `lib/umbra/claim.ts`, `lib/umbra/withdraw.ts`

Encrypted balance + UTXO claim + withdraw to a public wallet.

**Balance states from the SDK:**

| State | UI |
|---|---|
| `"shared"` | Real number (decrypt succeeded). |
| `"mxe"` | `••••••` (MXE-encrypted, not decrypted). |
| `"uninitialized"` | `0.00`. |
| `undefined` | "Ask treasurer to send payment first". |

**Claim flow:**
1. `scanClaimableUtxos(client)` returns UTXOs addressed to the user.
2. Filter against `claimedIndices` persisted in `localStorage.umbra_claimed_<base58>`.
3. `claimReceiverUtxos(client, utxos)` claims **one at a time** (batch fails if any UTXO is already spent).
4. Successful indices are appended to localStorage.

**Withdraw flow (two-step):**
1. **Queue TX** — `withdrawToPublic(client, dest, mint, amount)` deducts the encrypted balance immediately.
2. **Callback TX** — Arcium MPC delivers the SOL / USDC to the public wallet. Can fail independently.

`callbackStatus` is surfaced in the UI:

| Value | Meaning |
|---|---|
| `"finalized"` | Funds delivered. |
| `"timed-out"` / `"pruned"` | Callback failed — balance deducted but not delivered yet. Verify on Solscan. |
| `undefined` | Still processing. |

**Technical notes:**
- Withdraw config: `maxSlotWindow: 600` (~4 min), `safetyTimeoutMs: 360_000` (6 min). The SDK defaults are too short for devnet Arcium.
- Refresh is manual — no automatic polling.

---

## Contributor · Self-Sovereign IPFS Report

**Route:** `/contributor` (inside the *Self-Sovereign Compliance* card)
**API:** `app/api/pinata/upload/route.ts`
**Crypto:** WebCrypto AES-GCM + PBKDF2

Contributors generate their own compliance report — they don't need the DAO to issue a grant.

**Flow:**
1. Pick a time range (All time / Year / Month).
2. Paste the auditor wallet address.
3. Set a shared secret password.
4. Click **Encrypt & Publish** → an AES-GCM key is derived from the password + salt via PBKDF2 (100k iterations) → the ciphertext is uploaded to Pinata via `/api/pinata/upload`.
5. Response: the IPFS hash. A green toast appears.

**Encrypted payload format:**

```json
{
  "cipher": "AES-GCM",
  "ciphertext": "<base64>",
  "iv": "<base64>",
  "salt": "<base64>"
}
```

Pinata metadata tags the pin with `auditor` and `contributor` addresses, so `/api/pinata/list` can filter by auditor.

---

## Auditor · Company Audits

**Route:** `/auditor`
**Page:** `app/auditor/page.tsx`

The list of grants issued to the auditor's wallet. If empty: an empty state with a 3-step mini guide (Share address → Treasurer issues → Decrypt).

**Technical notes:**
- Source: `getGrantsByAuditor(walletAddress)` from `lib/grants-store.ts`.
- Clicking a card navigates to `/auditor/[treasurerAddress]?nonce=<nonce>`.
- The empty state has decoration: aurora line, two drifting halos, dot grid, pulse rings, floating dots — styled via `.ambient-drift`, `.ambient-float`, and the `thumbRingPulse` keyframe.

---

## Auditor · Treasury Report (scanner)

**Route:** `/auditor/[daoId]`
**Page:** `app/auditor/[daoId]/page.tsx`
**Library:** `lib/compliance/scanner.ts`

The compliance scanner that decrypts the subset of transactions within the VK level + scope.

**Flow:**
1. Pick a **Mint** (default WSOL `So111…112`).
2. Pick a **VK Level** (master / mint / yearly / monthly / daily / ...).
3. Pick a **Time range** (year / month / day, where applicable).
4. Click **Load transactions** → the scanner pipeline runs:
   - Pull tx signatures from Solana RPC.
   - Decode Anchor event logs.
   - Derive the TVK by descending from MVK to the scope level.
   - Decrypt the linker ciphertexts → recipient address + amount.
   - Validate plaintext (wrong-key heuristic).
5. The transaction list renders with signature (clickable → Solscan), amount, source variant (ATA/ETA), and date.
6. **Export PDF** or **Export CSV** via `lib/pdf.ts` (`generateAuditPdf`) or `lib/csv.ts` (`exportAuditCsv`).

**ScanProgress surfaced in the UI:**
- `indexerCount` — total candidate txs from the indexer.
- `inScopeCount` — those passing the time + mint pre-filter.
- `eventsFound` — Anchor events successfully parsed.
- `decrypted` — successfully decrypted.
- `decryptionFailed`, `wrongMint`, `outOfScopeTime`, `looksBogus` — error breakdown.

**Technical notes:**
- Caching: an `indexerCache` map keyed by depositor lives for the browser session.
- A warning surfaces automatically when >50% of decryption attempts produce `looksBogus` plaintext — usually a wrong mint or wrong MVK.

---

## Auditor · Individual IPFS Reports

**Route:** `/auditor/decrypt`
**Page:** `app/auditor/decrypt/page.tsx`
**API:** `app/api/pinata/list/route.ts`

The auditor syncs E2E reports sent directly by contributors (not via a grant).

**Flow:**
1. Click **Sync IPFS Reports** → fetch `/api/pinata/list?auditor=<addr>` → list of pins tagged with the auditor's address.
2. Click **Select** on a report → download the payload from `https://gateway.pinata.cloud/ipfs/<hash>`.
3. Enter the **shared secret** previously agreed with the contributor.
4. Click **Decrypt Report** → AES-GCM decrypt in the browser → transaction table renders.

**Technical notes:**
- Decryption **never** touches a server — everything goes through `crypto.subtle`.
- A wrong password is caught as a generic error ("Incorrect password or corrupted file") so we don't leak attack surface.
- Each decrypted row links to Solscan when `signature.length > 20`; shorter values (e.g., "Index: 760") are rendered as plain text.

---

## Global features

### Wallet Modal
**File:** `components/app/WalletModal.tsx`

Two-pane RainbowKit-style modal. Left pane lists wallets; right pane previews the hovered one. The `lastHovered` state never clears, so the right pane stays mounted long enough to click Connect.

### Wallet Account Popover
**File:** `components/app/WalletButton.tsx`

The pill in the top-right corner. Click → a popover with the avatar, SOL balance (fetched via `Connection.getBalance`), copy address (green check feedback), Solscan link, and disconnect.

### Guide Tour
**File:** `components/app/GuideTour.tsx` + `components/app/AppNav.tsx`

SVG mask spotlight + portal tooltip walking the user through the role they just entered. Auto-triggers the first time the role's `stealth-guide-seen-v2-{role}` flag is missing from localStorage. Reopenable from the **Guide** button in the nav.

### Retro CRT ConnectGate
**File:** `components/app/ConnectGate.tsx` + `components/ui/404-error-page.tsx`

When the wallet isn't connected, a retro TV screen appears with static + scanline animation. The `FlowButton` rounded-pill CTA opens the WalletModal. The preferred wallet is persisted in `localStorage["stealth-wallet-name"]` for next visit.

### Registration Banner
**File:** `components/app/RegistrationBanner.tsx`

Banner at the top of the treasurer & contributor pages (auditor is read-only, so it's hidden there). Status `unregistered` → register CTA. `pending` → spinner + "Waiting for Arcium MPC". `registered` → banner disappears.

### Toast System
**File:** `context/ToastContext.tsx` + `components/app/Toaster.tsx`

A queue capped at 5 toasts. Types: `success` (5s), `error` (8s), `info` (5s), `loading` (manual dismiss). API: `useToast()` → `.success()`, `.error()`, `.info()`, `.loading()`, `.dismiss()`.

---

[← Back to index](./README.md) · [Next: Components →](./COMPONENTS.md)
