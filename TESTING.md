# Stealth — End-to-End Testing Guide

Complete walkthrough for all three user roles: **Contributor**, **Treasurer**, and **Auditor**.  
Covers setup from zero through real on-chain Umbra data in the auditor dashboard.

---

## Prerequisites

### Wallets needed
You need **at least two Phantom (or Solflare) wallets** on Solana devnet:

| Wallet | Role |
|--------|------|
| Wallet A | Treasurer (pays contributors) |
| Wallet B | Contributor (receives payment) |
| Wallet C | Auditor (optional; Wallet B can double as auditor) |

### Tools
- Node.js 18+
- Git
- Phantom browser extension (devnet mode)

---

## Part 0 — Local Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd stealth-fe

# 2. Install dependencies (must do this after every git pull)
npm install

# 3. Copy env file
cp .env.local.example .env.local   # or ask teammate for .env.local

# 4. Start dev server
npm run dev
```

Open `http://localhost:3000` in browser.

### `.env.local` minimum required:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.devnet.solana.com
NEXT_PUBLIC_UMBRA_NETWORK=devnet
NEXT_PUBLIC_UMBRA_RELAYER_URL=https://relayer.api-devnet.umbraprivacy.com
NEXT_PUBLIC_UMBRA_INDEXER_URL=https://utxo-indexer.api-devnet.umbraprivacy.com
```

---

## Part 1 — Get Devnet SOL

Every wallet that interacts on-chain needs SOL for transaction fees.

**Option A — Solana CLI:**
```bash
solana airdrop 2 <WALLET_ADDRESS> --url devnet
```

**Option B — Browser faucet:**  
Go to https://faucet.solana.com, paste wallet address, select Devnet, request 2 SOL.

**Option C — In-app (Phantom):**  
Settings → Developer Settings → Airdrop SOL (devnet only).

> Repeat for Wallet A, Wallet B, and Wallet C.

---

## Part 2 — Contributor Flow (Wallet B)

### 2.1 Connect wallet
1. Open `http://localhost:3000/contributor`
2. Click **Connect Wallet** → select Phantom → approve

### 2.2 Initialize Umbra client
1. Click **Initialize Umbra Client**
2. Phantom shows a `signMessage` popup — **Sign it**
   - Message: `"Umbra: Generate Umbra Private Keys"`
   - This derives master seed. Never share this signature.
3. Wait for "Umbra client initialized" toast

### 2.3 Register with Umbra
1. Click **Register**
2. Approve transaction in Phantom
3. Wait for "Registered" toast (~10–30 sec)
4. Status badge changes to **Registered**

> If registration fails with "expired", wait 10 seconds and try again (devnet slot TTL ~180 slots).

### 2.4 Check encrypted balance
- After registration, encrypted balance shows `0.00 USDC` and `0.00 WSOL`
- Balance is `uninitialized` until treasurer sends payment

### 2.5 Claim UTXOs (do this after treasurer sends payment in Part 3)
1. Come back here after Part 3
2. Click **Refresh** to scan for claimable UTXOs
3. If UTXOs found, click **Claim All**
4. Approve transaction in Phantom
5. Encrypted balance updates

### 2.6 Withdraw to public wallet
1. Enter amount in **Withdraw** field
2. Select token (USDC or WSOL)
3. Click **Withdraw**
4. Approve in Phantom
5. Two steps happen:
   - **Queue TX** — deducted from encrypted balance immediately
   - **Callback TX** — Arcium MPC delivers funds to wallet (~1–4 min)
6. `callbackStatus` shown:
   - `finalized` → funds in wallet ✓
   - `timed-out` / `pruned` → devnet MPC failure; wait 2–5 min and check wallet

---

## Part 3 — Treasurer Flow (Wallet A)

### 3.1 Connect wallet
1. Open `http://localhost:3000/treasurer`
2. Connect Phantom with Wallet A

### 3.2 Initialize + Register (same as Contributor)
1. Click **Initialize Umbra Client** → sign message
2. Click **Register** → approve transaction
3. Wait for registered status

### 3.3 Wrap SOL → WSOL (needed for Umbra mixer)
1. Go to `/treasurer/pay`
2. Click **Wrap SOL → WSOL** button (devnet only helper)
3. Enter amount (e.g. `0.5` SOL)
4. Approve in Phantom
5. WSOL balance updates

> If wrap fails with "not confirmed in 30 seconds", try again — devnet congestion.

### 3.4 Send payment to contributor (single)
1. Stay on `/treasurer/pay`
2. Fill **Recipient Address** with Wallet B address
3. Fill **Amount** (e.g. `0.1` WSOL or USDC)
4. Click **Send**
5. Approve in Phantom
6. Toast shows queue signature

> Payment goes through Umbra mixer pool — recipient gets a claimable UTXO, not a direct transfer.

### 3.5 Send bulk payment via CSV (optional)
1. Go to `/treasurer/pay` → **Bulk CSV** tab
2. Upload CSV with format:
   ```csv
   address,amount,mint,note
   <wallet_B_address>,100000,WSOL,Engineering
   <wallet_C_address>,50000,WSOL,Design
   ```
3. Click **Send All**
4. Approve each transaction in Phantom

---

## Feature Overview

Four distinct features span the three roles. Read this first to understand what you're testing.

| Feature | Who | What it does |
|---------|-----|--------------|
| **Self-Sovereign Compliance** | Contributor | Decrypts own Umbra history locally → re-encrypts with shared secret → publishes encrypted report to IPFS (Pinata), mapped to auditor's wallet address |
| **Individual Reports** | Auditor | Syncs IPFS to find reports contributors sent to your wallet → enter shared secret → decrypt locally |
| **Company Audits / Compliance Scanner** | Auditor | DAO treasury scan using MVK issued by treasurer → decrypts all payroll transactions on-chain |
| **Compliance Grants** | Treasurer | Issues scoped viewing key (MVK or time-bounded) to auditor wallet → auditor can run scanner on that DAO's treasury. Re-encrypted via Arcium MPC (X25519 ECDH). Revocable on-chain anytime. |

**Two separate auditor flows:**
- `Company Audits` tab → grant from DAO treasurer → scanner sees all payroll (decrypted with MVK)
- `Individual Reports` tab → report from contributor → auditor sees individual income proof (decrypted with shared password)

These are independent. Contributor-side proof does NOT require a company grant.

---

## Part 4 — Auditor Flow (Wallet C or Wallet B)

### Part 4A — Treasurer Issues Compliance Grant (Wallet A)

> **What this is:** Treasurer gives auditor a scoped viewing key (VK Level: Master = all time, or Yearly/Monthly = time-bounded). The MVK is derived from the treasurer's master seed (via `signMessage`) and stored with the grant. Arcium MPC re-encrypts treasury outputs under the auditor's X25519 public key — auditor can then scan and decrypt without the treasurer's private key. Each grant has a unique nonce — no replay attacks.

#### 4A.1 Derive master viewing key
1. Open `/treasurer/auditors` (still on Wallet A)
2. Make sure Umbra client is initialized (if not, re-initialize on `/contributor` or `/treasurer`)
3. In the **"Issue New Grant"** form:
   - Fill **Auditor Wallet Address** with Wallet C address
   - Fill **Label** (e.g. `"Q2 2025 Audit"`)
   - In **Viewing Key** field, click **"Derive from wallet ↗"**
   - Phantom shows `signMessage` popup — **Sign it**
   - Viewing key hex auto-fills in the textarea + copied to clipboard

#### 4A.2 Issue grant
4. Click **Issue Grant**
5. Approve transaction in Phantom
6. Toast: `"Grant issued · <signature>…"`
7. Grant appears in the **Active Grants** list with a green dot

> Keep this page open — you need the nonce shown in the grant row.

---

### Part 4B — Auditor Opens Dashboard (Wallet C)

#### 4B.1 Connect auditor wallet
1. Switch to Wallet C in Phantom
2. Open `http://localhost:3000/auditor`
3. Connect Wallet C

> **Note**: Auditor does NOT need to register with Umbra. Viewing is read-only.

#### 4B.2 Find the grant
1. Page shows list of DAOs that granted you access
2. Find the entry from Wallet A (Treasurer)
3. Click **View Report**

#### 4B.3 Scan for real transactions
1. On the report page, the scanner panel appears at the top
2. **Mint** field — default is WSOL (`So11111111111111111111111111111111111111112`)  
   Change to USDC if treasurer sent USDC: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`  
   **Must match the token actually used by the treasurer** — mint determines TVK derivation
3. **VK Level** — select `master` (sees all transactions for that mint)
4. Click **Load Transactions**
5. Wait 5–30 seconds (scanning on-chain tx history + decrypting)

#### 4B.4 Reading the results

**Progress counters explained:**

| Counter | Meaning |
|---------|---------|
| Indexed | Transactions found on-chain for this treasurer address (via Solana RPC) |
| In Scope | UTXOs matching the selected mint + time window |
| Events | Anchor event logs found and decoded in transactions |
| Decrypted | Successfully decrypted UTXOs |
| Failed | Decryption errors (wrong key, missing events) |
| Bogus | Outputs that look like wrong-key garbage (heuristic check) |

**Transaction table columns:**

| Column | Meaning |
|--------|---------|
| Transaction | First 16 chars of on-chain signature + decrypted recipient address |
| Amount | Token amount (decrypted for ETA, plaintext for ATA) |
| Source | `ATA` = sent from public balance; `ETA` = sent from encrypted balance |
| Date | Block timestamp of the transaction |

#### 4B.5 Export report
- Click **Export CSV** → downloads `stealth-audit-<daoId>.csv`
- Click **Export PDF** → downloads `stealth-audit-<daoId>.pdf`

---

## Part 5 — Self-Sovereign Compliance (Contributor → Auditor via IPFS)

This flow lets a **contributor** prove their income to an auditor directly — without involving the DAO treasurer. Data never touches a server; it goes contributor → Pinata IPFS → auditor.

### Prerequisites
- Contributor wallet (Wallet B) must be initialized + have some Umbra history (claimed UTXOs)
- Auditor wallet address (Wallet C) — contributor needs this beforehand
- Both parties agree on a **shared secret password** out-of-band (e.g. Signal message)
- `NEXT_PUBLIC_PINATA_JWT` must be set in `.env.local` (Pinata API key)

```
NEXT_PUBLIC_PINATA_JWT=<your_pinata_jwt_token>
```

Get Pinata JWT at https://app.pinata.cloud → API Keys → New Key → Admin.

---

### 5.1 Contributor publishes encrypted report (Wallet B)

1. Connect Wallet B → open `/contributor`
2. Initialize Umbra Client (if not already) → sign message
3. On the right panel: **SELF-SOVEREIGN COMPLIANCE**
4. Fill **Auditor Wallet Address** → paste Wallet C's base58 address
5. Fill **Enter shared secret password** → type the agreed password (e.g. `audit2026`)
   - This password is symmetric — auditor needs the exact same string to decrypt
   - **Never put this in a URL or blockchain tx** — share via secure channel only
6. Click **Encrypt & Publish**
7. App decrypts your Umbra history locally (no data leaves your machine unencrypted)
8. Re-encrypts the report using the shared secret
9. Publishes to IPFS via Pinata — mapped to the auditor's wallet address
10. Toast shows IPFS CID on success (e.g. `QmXxx...`)

**What gets included in the report:**
- Transaction history from your encrypted Umbra balance
- Amounts received + approximate timestamps
- Recipient is your own wallet — no other parties' data

---

### 5.2 Auditor syncs and decrypts (Wallet C)

1. Switch to Wallet C → open `/auditor`
2. Click **Individual Reports** tab (top nav)
3. Left panel: click **Sync IPFS Reports**
   - App queries Pinata for all IPFS files mapped to Wallet C's address
   - Reports list populates (shows contributor address + publish timestamp)
4. Click a report row to select it
5. Right panel: **SELECTED REPORT** shows the report metadata
6. Fill **SHARED SECRET (PASSWORD)** → type the same password contributor used
7. Click **Decrypt Report**
8. Report decrypts locally — income data appears (amounts, dates, token)

**Expected output:**
- Table of payment entries with amount + date
- Contributor wallet shown
- Decryption happens 100% client-side — Pinata never sees plaintext

---

### 5.3 Verification checklist

- [ ] Report appears in Auditor Individual Reports after Sync
- [ ] Wrong password → decrypt fails with error (not garbage data)
- [ ] Correct password → all entries show with correct amounts
- [ ] IPFS CID from step 5.1 matches what appears in Pinata dashboard
- [ ] No private data in IPFS URL or browser URL bar

---

## Part 6 — Troubleshooting

### Indexed = 0
- Treasurer has no confirmed transactions on devnet yet
- Wait 30–60 seconds after sending payment and retry
- Confirm treasurer wallet has at least one Umbra transaction on-chain

### Events = 0
- The transaction is indexed but its logs can't be fetched
- Devnet public RPC sometimes drops old logs
- Try again; if persistent, the RPC may not archive those logs

### Decrypted = 0, Failed > 0
- MVK derived from wrong wallet — treasurer must be on Wallet A when deriving
- Wrong VK Level vs scope combination
- Try re-issuing grant after re-deriving viewing key

### "More than 50% look invalid" warning
Two possible causes:
1. **Wrong mint** — Umbra TVK is mint-specific; if treasurer sent WSOL but scanner is set to USDC, decryption produces garbage. Change Mint field to match what was actually sent.
2. **Wrong viewing key** — MVK derived from wrong wallet. Treasurer should re-issue grant using **"Derive from wallet ↗"** while connected to correct wallet.

### Individual Reports: "No reports synced yet" after clicking Sync
- Check `NEXT_PUBLIC_PINATA_JWT` is set in `.env.local`
- Contributor must have published at least one report (Part 5.1) using Wallet C's address
- Pinata propagation can take 30–60 sec — wait and sync again

### Individual Reports: Decrypt fails / garbled output
- Wrong shared secret — both parties must use exact same string (case-sensitive)
- Report may have been published to a different auditor wallet — check contributor used Wallet C's address

### Encrypt & Publish button fails
- `NEXT_PUBLIC_PINATA_JWT` missing or expired — generate new key at https://app.pinata.cloud
- Umbra client not initialized — re-initialize on `/contributor` before publishing
- No Umbra history to report — claim at least one UTXO first (Part 2.5)

### Wrap SOL fails "not confirmed in 30 seconds"
- Pure devnet congestion — try again
- If repeated, check SOL balance (need >0.01 SOL for fees)

### Registration TX expires
- Solana devnet has ~180 slot TTL for registration
- Error: `"Transaction simulation failed"` or similar
- Just click **Register** again

### Balance shows encrypted / `••••••`
- Balance in MXE mode — Umbra client not fully initialized
- Re-initialize: click **Initialize Umbra Client** again and sign

### Callback timed-out / pruned after withdraw
- Devnet MPC (Arcium) is unreliable — this is expected
- Funds were deducted from encrypted balance (queue TX committed)
- Check public wallet manually on Solscan (devnet)
- May need to wait 2–5 minutes for delayed delivery

---

## Quick Reference — Pages

| URL | Role | Action |
|-----|------|--------|
| `/contributor` | Contributor | Scan UTXOs, claim, view balance, withdraw |
| `/contributor` (right panel) | Contributor | Self-Sovereign Compliance — encrypt + publish income report to IPFS |
| `/treasurer` | Treasurer | Dashboard overview |
| `/treasurer/pay` | Treasurer | Send private payment, wrap SOL |
| `/treasurer/auditors` | Treasurer | Issue/revoke compliance grants (MVK → auditor X25519 key) |
| `/auditor` | Auditor | Company Audits tab — see grants issued by DAO treasurers |
| `/auditor` → Individual Reports tab | Auditor | Sync IPFS + decrypt individual contributor reports |
| `/auditor/<daoId>?nonce=<nonce>` | Auditor | Company audit: scan + decrypt full treasury payroll |

---

## Flow Diagram

```
Wallet A (Treasurer)                    Wallet B (Contributor)
─────────────────────                   ──────────────────────
Initialize + Register                   Initialize + Register
        │                                       │
        ▼                                       │
  Wrap SOL → WSOL                              │
        │                                       │
        ▼                                       │
  Send payment ──── Umbra Mixer Pool ──────────▶ Claim UTXO
  /treasurer/pay     (private UTXO)               │
        │                                         ▼
        │                                   Encrypted Balance
        │                                         │
        ▼                                         ▼
  /treasurer/auditors               ┌─── Withdraw to wallet
  Derive MVK → Issue grant          │
        │                           │    (Optional: self-sovereign flow)
        │                           └──▶ Encrypt + Publish to IPFS
        │                                /contributor (right panel)
        ▼                                       │
Wallet C (Auditor)                             │
──────────────────                             │
  /auditor                                     │
  ├─ Company Audits tab ◄──── grant from A ────┘(separate path)
  │    Load Transactions (uses MVK)
  │    Decrypted real tx data ✓
  │    Export PDF / CSV
  │
  └─ Individual Reports tab ◄── IPFS reports from contributors
       Sync from Pinata
       Select report → enter shared secret
       Decrypt locally ✓
```

---

*Last updated: 2026-05-10*  
*Network: Solana devnet · SDK: @umbra-privacy/sdk v4+*
